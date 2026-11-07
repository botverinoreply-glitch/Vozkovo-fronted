# VozKovo

VozKovo is a text-to-speech web application with a lightweight frontend and a Python backend.

## Features

- Web interface for entering text and generating speech.
- Audio playback and download workflow.
- FastAPI backend.
- Static frontend served by the application.
- Render deployment configuration.

## Run locally

1. Install the dependencies:

```bash
pip install -r requirements.txt
```

2. Start the application:

```bash
uvicorn main:app --host 0.0.0.0 --port 8000
```

3. Open http://localhost:8000 in your browser.

## Project structure

- `main.py` — FastAPI application.
- `static/` — frontend files and documentation.
- `logos/` — project logo.
- `requirements.txt` — Python dependencies.
- `render.yaml` — Render deployment configuration.
- `Dockerfile` — container configuration.

## Status

Initial repository setup. The application source files are being added.
