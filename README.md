# Personal Farming Assistant - Krishi Sakhi

An AI-powered personal farming assistant designed specifically for Kerala farmers. This digital companion provides personalized, timely agricultural advice and helps farmers track their farming activities throughout the crop cycle.

## Features

- **Farmer & Farm Profiling**: Capture location, land size, crop, soil type, and irrigation details
- **Conversational Interface**: Interact in Malayalam via voice or text
- **Activity Tracking**: Log farming events like sowing, irrigation, input use, and pest issues
- **Personalized Advisory**: Receive contextual guidance based on weather, local conditions, and crop data
- **Reminders & Alerts**: Get timely notifications for crop operations, scheme deadlines, and price trends
- **Knowledge Engine**: Access local crop calendars, pest data, and agricultural best practices

## Technology Stack

This project is built with:
- React 18
- Vite
- Framer Motion (for animations)
- Lucide React (for icons)
- Custom CSS with green theme

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open your browser and navigate to the displayed URL (usually http://localhost:5173)

### Local AI via backend

This repo includes two backend options. For local development, run the Node server:

1) Create `server/.env` from `server/.env.example` and set `API_KEY` and `MODEL`.
2) In one terminal:
    - `cd server && npm install && npm run dev`
3) In another terminal:
    - `npm run dev`

Vite proxies `/api` to `http://localhost:8787` during dev.

### Production AI via Cloudflare Worker

You can deploy the stateless chat endpoint as a Cloudflare Worker so your API key and system prompt stay off the client and out of this repo.

- Worker path: `worker/`
- Configure with Wrangler:
   - `cd worker`
   - `npm i -g wrangler` (if not installed)
   - `wrangler login`
   - Set secrets and vars:
      - `wrangler secret put API_KEY`
      - `wrangler secret put SYSTEM_PROMPT`
      - `wrangler secret put MODEL`
   - `wrangler deploy`

The deploy command will output a Worker URL like `https://farmerportal-api.your-account.workers.dev`.

In GitHub Pages build, set `VITE_API_BASE` to that Worker URL so the frontend calls it at runtime.


## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Impact

This solution aims to empower smallholder farmers with:
- Personalized, on-demand agricultural support
- Enhanced productivity through timely actions
- Bridging the knowledge gap using AI and local context

---

*Creating a "Krishi Sakhi" - a digital friend who walks with the farmer throughout the crop cycle.*
