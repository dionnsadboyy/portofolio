# Dion Pratama Syahputra — Creative Developer

Personal portfolio built with vanilla HTML, CSS, and JavaScript. The page keeps its editorial typography, paper grain, portrait, and motion, with lavender as the dominant base and cream as the foreground material.

## Page structure

1. Hero
2. Selected work: TEAMcut, Dua Saudara, Bagong Lapar
3. Archive
4. Who I am
5. How I build
6. Now
7. Contact

Project screenshots are real assets in the assets folder and appear directly in Selected Work. TEAMcut uses mobile screenshots only. Dua Saudara is led by desktop captures. Bagong Lapar includes selected desktop and mobile views. Archive uses an editorial list; available screenshots update the preview on hover, focus, or tap. See assets/README.txt for the original showcase guidance.

## Files

- index.html — page structure, project stories, links, and assistant UI
- style.css — design tokens, responsive layouts, editorial project presentations, reduced-motion styles, and assistant styling
- script.js — hero text/image reveal, scroll reveal and drift, Archive preview interaction, navigation, and assistant conversation behavior
- api/portfolio-assistant.js — serverless assistant endpoint
- api/portfolio-context.js — portfolio facts supplied to the assistant
- .env.example — required assistant provider settings

## Run locally

Run `node scripts/dev-server.js` from this folder, then open http://localhost:3000. This built-in Node server serves the page and routes `/api/portfolio-assistant` to the existing endpoint, loading local settings from `.env`. A static server such as VS Code Live Server can preview the page, but it cannot run the assistant API and will return 405 for its POST request. For deployment, use a serverless runtime that exposes files under `api/` as routes.

## Assistant configuration

The endpoint expects an OpenAI-compatible chat completions provider. Set these variables in the serverless deployment environment:

- LLM_BASE_URL — provider API base URL, such as https://api.koboillm.com/v1
- LLM_API_KEY — provider secret; keep it server-side
- LLM_MODEL — model identifier accepted by the provider

The assistant keeps the latest six messages in page memory and sends them with the current section and selected Archive project when applicable. It does not save conversations in browser storage. Keep api/portfolio-context.js aligned with the facts and project status shown in index.html.

For local AI checks, copy `.env.example` to `.env`, add the provider key, then run `node scripts/test-ai.js`. The tester loads `.env` without an added dependency and sends one question through the existing portfolio assistant endpoint. Keep `.env` private; it is listed in `.gitignore`.

## Project and contact links

- TEAMcut: https://teamcut.pages.dev/
- Dua Saudara: https://dua-saudara.pages.dev/
- Bagong Lapar: no live URL is listed in the source
- Contact: dionpratamaart@gmail.com

No framework or build step is required.
