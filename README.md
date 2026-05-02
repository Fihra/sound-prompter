# AI Project Template

Starter template with working examples of common AI APIs, shown two ways: inside a p5 sketch and as plain HTML/JS widgets. All backed by one Express server.

## APIs included

- **Pixabay** — image search
- **Gemini** — chat/LLM (Google)
- **Cloudflare Workers AI** — chat (Llama 4 Scout), text-to-image (Flux 1 Schnell), image-to-image (Stable Diffusion 1.5)
- **ElevenLabs** — text-to-speech, sound effects

## Setup

1. `npm install`
2. Copy `.env.example` to `.env` and fill in your keys
3. `npm run dev`
4. Open http://localhost:3000

## Get API keys

- Pixabay: https://pixabay.com/api/docs/
- Gemini: https://aistudio.google.com/apikey
- Cloudflare: https://dash.cloudflare.com/profile/api-tokens (create a token with `Workers AI` permission, plus your account ID from the dashboard)
- ElevenLabs: https://elevenlabs.io/
