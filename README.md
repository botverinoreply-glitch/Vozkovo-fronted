# VozKovo — Text to Speech

VozKovo is a lightweight web text-to-speech app with a searchable voice catalogue, reading-speed control, pause markers, MP3 downloads and a local browser audio library.

## Features

- Dynamically loaded voice catalogue provided by `edge-tts`.
- Search voices by name or locale, with country flags shown beside voice names.
- No fixed 5,000-character application cap. Long text is split into smaller speech chunks and combined into one MP3.
- Language-neutral pause markers such as `[silence]`, `[silencio]`, `[pause 1s]`, `[pausa 2s]` and `[break 500ms]`.
- Generated MP3 files are saved in the browser's IndexedDB library, where they can be played, downloaded or deleted.
- Voice catalogue and selected voice are cached in the browser.
- Automatic website-language detection for Spanish, English, French, German, Italian, Portuguese and Dutch, plus a manual selector.
- Responsive layout for desktop and mobile devices.
- English documentation available at `/documentation` (also `/documentación`).

## Important limits

VozKovo does not impose a fixed 5,000-character cap or a fixed monthly character allowance in the application. Long text is split into chunks and generated in sequence. This is not a guarantee of literally infinite generation: the external speech service, server resources, processing time, network connection and hosting plan may impose practical limits or temporary restrictions.

The app uses the online Edge TTS service through `edge-tts`. Internet access is required on the server. No API key is required by the app.

## Run locally

Requirements: Python 3.11+ and FFmpeg.

```bash
python -m venv .venv
# Windows: .venv\\Scripts\\activate
# macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```

Open `http://localhost:8000`.

## Deploy with Docker

1. Push the project to a Git repository.
2. Create a Docker-based web service on your hosting platform.
3. The included `Dockerfile` installs FFmpeg and the Python dependencies.
4. The app listens on the port supplied by the `PORT` environment variable.

## Browser storage

The voice catalogue and selected voice are cached in local storage. Generated MP3 files are saved in IndexedDB on the same browser and device. They do not sync between devices. Clearing browser/site data can remove the saved audio.

## Main dependencies

- `edge-tts` — online speech generation and voice catalogue.
- `FastAPI` — web server and API.
- `FFmpeg` — creates silence segments and combines generated audio chunks.
