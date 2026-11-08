# VozKovo Frontend

The standalone frontend for VozKovo. It contains the responsive web interface, seven interface languages, voice search and filters, reading-speed controls, MP3 playback, downloads, and a browser audio library.

## Stack
- HTML, CSS and vanilla JavaScript
- GitHub Pages-compatible relative asset paths
- Configurable API base URL

## Configure the API
Edit `static/config.js` and set the Cloudflare Worker URL:

```js
window.VOZKOVO_CONFIG = Object.freeze({
  API_BASE_URL: 'https://your-worker.workers.dev'
});
```

Leave the value empty while the API is not deployed. The frontend expects:
- `GET /api/voices`
- `POST /api/generate`
- `GET /api/jobs/:job_id`
- `GET /api/jobs/:job_id/download`

The API must allow CORS requests from the frontend origin. Until the backend is deployed and configured, live voice loading and audio generation will not work.

## Preview
Publish the repository root with GitHub Pages or serve it with any static file server.

## Languages
Spanish, English, French, German, Italian, Portuguese and Dutch.
