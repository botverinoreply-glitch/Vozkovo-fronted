from __future__ import annotations

import asyncio
import os
import re
import shutil
import subprocess
import tempfile
import time
import uuid
from pathlib import Path
from typing import Any

import edge_tts
from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field
from starlette.background import BackgroundTask

BASE_DIR = Path(__file__).resolve().parent
STATIC_DIR = BASE_DIR / "static"
LOGOS_DIR = BASE_DIR / "logos"
JOBS_DIR = Path(tempfile.gettempdir()) / "vozkovo-jobs"
JOBS_DIR.mkdir(parents=True, exist_ok=True)

app = FastAPI(title="VozKovo", version="1.0.0")
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")
app.mount("/logos", StaticFiles(directory=LOGOS_DIR), name="logos")

# Jobs are stored in memory; generated MP3 files are kept temporarily on disk.
jobs: dict[str, dict[str, Any]] = {}
active_jobs = 0
job_semaphore = asyncio.Semaphore(2)
voices_cache: list[dict[str, str]] | None = None
voices_cache_time = 0.0

DEFAULT_VOICE = "es-ES-AlvaroNeural"
MAX_CHUNK_CHARS = 2800
JOB_TTL_SECONDS = 60 * 60
MAX_PAUSE_SECONDS = 10
PAUSE_PATTERN = re.compile(
    r"\[(?:silence|silencio|pause|pausa|break)"
    r"(?:\s+(\d+(?:[.,]\d+)?)\s*(ms|milliseconds?|millisecond|s|sec|secs|seconds?|seg|segs|segundos?))?\s*\]",
    re.IGNORECASE,
)


class GenerateRequest(BaseModel):
    text: str = Field(min_length=1)
    voice: str = Field(default=DEFAULT_VOICE, min_length=3, max_length=120)
    rate: int = Field(default=0, ge=-50, le=50)


def split_long_piece(piece: str, limit: int = MAX_CHUNK_CHARS) -> list[str]:
    """Split a long sentence into chunks without cutting words when possible."""
    result: list[str] = []
    remaining = piece.strip()
    while len(remaining) > limit:
        cut = remaining.rfind(" ", 0, limit + 1)
        if cut < limit // 2:
            cut = limit
        result.append(remaining[:cut].strip())
        remaining = remaining[cut:].strip()
    if remaining:
        result.append(remaining)
    return result


def split_text(text: str, limit: int = MAX_CHUNK_CHARS) -> list[str]:
    """Sentence-aware chunking so long text can be synthesized in pieces."""
    paragraphs = [p.strip() for p in text.replace("\r\n", "\n").split("\n") if p.strip()]
    chunks: list[str] = []
    current = ""

    for paragraph in paragraphs:
        sentences = re.split(r"(?<=[.!?…])\s+", paragraph)
        for sentence in sentences:
            sentence = sentence.strip()
            if not sentence:
                continue
            pieces = split_long_piece(sentence, limit)
            for piece in pieces:
                candidate = f"{current} {piece}".strip() if current else piece
                if len(candidate) <= limit:
                    current = candidate
                else:
                    if current:
                        chunks.append(current)
                    current = piece
        if current and len(current) < limit - 2:
            current += "\n"

    if current.strip():
        chunks.append(current.strip())
    return chunks or [text.strip()]


def split_speech_markers(text: str) -> list[tuple[str, str | float]]:
    """Split text into speech and silence segments. Pause tags are language-neutral."""
    segments: list[tuple[str, str | float]] = []
    cursor = 0

    for match in PAUSE_PATTERN.finditer(text):
        spoken_text = text[cursor:match.start()].strip()
        if spoken_text:
            segments.extend(("text", chunk) for chunk in split_text(spoken_text))

        amount = match.group(1)
        unit = (match.group(2) or "s").lower()
        duration = float(amount.replace(",", ".")) if amount else 1.0
        if unit.startswith("ms") or unit.startswith("millisecond"):
            duration /= 1000
        segments.append(("silence", min(MAX_PAUSE_SECONDS, max(0.1, duration))))
        cursor = match.end()

    remaining = text[cursor:].strip()
    if remaining:
        segments.extend(("text", chunk) for chunk in split_text(remaining))

    if not segments:
        segments.extend(("text", chunk) for chunk in split_text(text))
    return segments


def create_silence(path: Path, duration: float) -> None:
    """Create a short MP3 silence segment compatible with the speech chunks."""
    result = subprocess.run(
        [
            "ffmpeg", "-hide_banner", "-loglevel", "error", "-y",
            "-f", "lavfi", "-i", "anullsrc=r=24000:cl=mono",
            "-t", f"{duration:.3f}", "-c:a", "libmp3lame", "-b:a", "48k", str(path),
        ],
        capture_output=True,
        text=True,
        timeout=60,
    )
    if result.returncode != 0 or not path.exists() or path.stat().st_size == 0:
        raise RuntimeError("Could not create an audio pause.")


async def get_voices(force_refresh: bool = False) -> list[dict[str, str]]:
    global voices_cache, voices_cache_time
    now = time.time()
    if voices_cache is not None and not force_refresh and now - voices_cache_time < 1800:
        return voices_cache

    raw_voices = await edge_tts.list_voices()
    clean: list[dict[str, str]] = []
    for item in raw_voices:
        short_name = item.get("ShortName")
        if not short_name:
            continue
        clean.append({
            "id": short_name,
            "name": item.get("FriendlyName", short_name),
            "locale": item.get("Locale", ""),
            "gender": item.get("Gender", ""),
        })
    clean.sort(key=lambda v: (v["locale"], v["gender"], v["id"]))
    voices_cache = clean
    voices_cache_time = now
    return clean


def cleanup_expired_jobs() -> None:
    now = time.time()
    for job_id, info in list(jobs.items()):
        # Never expire a job that is still queued or synthesizing a long text.
        expiry_base = info.get("finished_at")
        if info.get("status") in {"done", "error"} and expiry_base and now - expiry_base > JOB_TTL_SECONDS:
            output = info.get("output")
            if output:
                try:
                    Path(output).unlink(missing_ok=True)
                except OSError:
                    pass
            jobs.pop(job_id, None)


async def synthesize_job(job_id: str, text: str, voice: str, rate: int) -> None:
    job = jobs[job_id]
    work_dir = JOBS_DIR / job_id
    work_dir.mkdir(parents=True, exist_ok=True)
    output_path = JOBS_DIR / f"{job_id}.mp3"

    try:
        async with job_semaphore:
            job["status"] = "processing"
            segments = split_speech_markers(text)
            job["total_chunks"] = len(segments)
            part_paths: list[Path] = []

            for index, (kind, value) in enumerate(segments, start=1):
                part_path = work_dir / f"part_{index:05d}.mp3"
                if kind == "silence":
                    create_silence(part_path, float(value))
                else:
                    communicate = edge_tts.Communicate(
                        str(value),
                        voice,
                        rate=f"{rate:+d}%",
                    )
                    await communicate.save(str(part_path))
                if not part_path.exists() or part_path.stat().st_size == 0:
                    raise RuntimeError("The speech service returned an empty audio segment.")
                part_paths.append(part_path)
                job["completed_chunks"] = index
                job["progress"] = round(index / len(segments) * 90)

            if len(part_paths) == 1:
                shutil.copyfile(part_paths[0], output_path)
            else:
                concat_file = work_dir / "concat.txt"
                with concat_file.open("w", encoding="utf-8") as handle:
                    for part in part_paths:
                        safe_path = str(part).replace("'", "'\\''")
                        handle.write(f"file '{safe_path}'\n")

                command = [
                    "ffmpeg", "-hide_banner", "-loglevel", "error", "-y",
                    "-f", "concat", "-safe", "0", "-i", str(concat_file),
                    "-vn", "-c:a", "libmp3lame", "-b:a", "128k", str(output_path),
                ]
                result = subprocess.run(command, capture_output=True, text=True, timeout=900)
                if result.returncode != 0:
                    raise RuntimeError("No se pudieron unir los fragmentos de audio.")

            if not output_path.exists() or output_path.stat().st_size == 0:
                raise RuntimeError("No se pudo crear el archivo MP3.")

            job["output"] = str(output_path)
            job["status"] = "done"
            job["progress"] = 100
            job["finished_at"] = time.time()
    except Exception as exc:
        output_path.unlink(missing_ok=True)
        job["status"] = "error"
        message = str(exc).strip()
        job["error"] = message[:320] if message else "No se pudo generar el audio."
    finally:
        shutil.rmtree(work_dir, ignore_errors=True)


@app.get("/")
async def home() -> FileResponse:
    return FileResponse(STATIC_DIR / "index.html")


@app.get("/documentation")
@app.get("/documentación")
async def documentation() -> FileResponse:
    return FileResponse(STATIC_DIR / "documentation.html")


@app.get("/api/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/api/voices")
async def voices() -> dict[str, Any]:
    try:
        available = await get_voices()
        return {"voices": available, "default": DEFAULT_VOICE}
    except Exception as exc:
        raise HTTPException(
            status_code=503,
            detail="No se pudo cargar el catálogo de voces. Comprueba la conexión del servidor e inténtalo de nuevo.",
        ) from exc


@app.post("/api/generate", status_code=202)
async def generate(request: GenerateRequest) -> dict[str, str]:
    cleanup_expired_jobs()
    text = request.text.strip()
    if not text:
        raise HTTPException(status_code=400, detail="Escribe un texto antes de generar la voz.")

    try:
        available = await get_voices()
    except Exception as exc:
        raise HTTPException(status_code=503, detail="El servicio de voces no está disponible ahora mismo.") from exc

    valid_voice_ids = {item["id"] for item in available}
    if request.voice not in valid_voice_ids:
        raise HTTPException(status_code=400, detail="La voz seleccionada no está disponible. Actualiza la lista de voces.")

    job_id = uuid.uuid4().hex
    jobs[job_id] = {
        "status": "queued",
        "progress": 0,
        "completed_chunks": 0,
        "total_chunks": 0,
        "created_at": time.time(),
        "output": None,
        "error": None,
    }
    asyncio.create_task(synthesize_job(job_id, text, request.voice, request.rate))
    return {"job_id": job_id}


@app.get("/api/jobs/{job_id}")
async def job_status(job_id: str) -> dict[str, Any]:
    info = jobs.get(job_id)
    if not info:
        raise HTTPException(status_code=404, detail="La tarea no existe o ha caducado.")
    return {
        "status": info["status"],
        "progress": info["progress"],
        "completed_chunks": info["completed_chunks"],
        "total_chunks": info["total_chunks"],
        "error": info["error"],
    }


@app.get("/api/jobs/{job_id}/download")
async def download(job_id: str) -> FileResponse:
    info = jobs.get(job_id)
    if not info or info["status"] != "done" or not info.get("output"):
        raise HTTPException(status_code=404, detail="El MP3 todavía no está listo o la tarea ha caducado.")
    output_path = Path(info["output"])
    if not output_path.is_file():
        raise HTTPException(status_code=404, detail="El archivo MP3 ya no está disponible.")
    return FileResponse(
        output_path,
        media_type="audio/mpeg",
        filename="voz-kovo.mp3",
        headers={"Cache-Control": "no-store"},
    )
