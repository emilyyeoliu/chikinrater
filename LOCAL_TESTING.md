# 🍗 Local Testing Guide (SQLite + Vite + Tailwind v4)

This repo runs with a lightweight SQLite database and a Vite-powered React frontend.

## Prerequisites

- Node.js 18+ (recommend 18/20)
- npm 9+
- Two terminals

No Postgres required for local development.

## One‑time setup

```bash
# from repo root
npm install              # backend deps
cd web && npm install && cd -   # frontend deps

# Prisma client + local DB (SQLite file at prisma/dev.db)
npm run prisma:generate
npm run prisma:migrate    # creates tables in prisma/dev.db
npm run prisma:seed       # loads default places
```

## Start the app (two terminals)

### Terminal A – Backend API (Express + Socket.io)
```bash
# from repo root
npm run dev
# → http://localhost:3000
```

### Terminal B – Frontend (Vite + React)
```bash
cd web
npm run dev
# → Vite prints the URL (typically http://localhost:5173)
```

Open the printed Vite URL in your browser. If 5173 is taken, Vite will choose 5174+.

## Typical local flow

1. Visit `/admin` and enter the admin secret from `.env` (default `admin123`).
2. Create an event (e.g., code `TEST`).
3. In a separate tab go to `/join`, enter `TEST` and a username.
4. Follow the phases: Guessing → Ranking → Reveal.

## Environment variables

Create a `.env` at repo root if it does not exist:
```env
PORT=3000
SESSION_SECRET=local-dev-secret-123
ADMIN_SECRET=admin123
DATABASE_URL="file:./prisma/dev.db"
```

## Troubleshooting

### Frontend won’t style / looks unstyled
- Ensure Tailwind v4 is active.
  - `web/vite.config.ts` must include:
    ```ts
    import tailwind from '@tailwindcss/vite'
    export default defineConfig({ plugins: [react(), tailwind()] })
    ```
  - `web/src/index.css` must contain:
    ```css
    @tailwind base;
    @tailwind components;
    @tailwind utilities;
    ```
  - `web/src/main.tsx` must import `./index.css`.
- Clean and restart Vite:
  ```bash
  cd web
  rm -rf node_modules/.vite
  npm run dev
  ```

### Vite HMR websocket warning
- A brief "failed to connect to websocket" during server restart is normal. Hard refresh.
- If persistent, ensure you’re opening the exact URL Vite prints in the terminal.

### Clicking a box throws “Invalid hook call”
- This is caused by duplicate React copies in dev. We already dedupe in Vite.
- If you still see it, fully stop both terminals and start them again.

### Port already in use
```bash
# Kill anything on 3000 (backend)
lsof -ti:3000 | xargs kill
# Kill anything on 5173 (frontend)
lsof -ti:5173 | xargs kill
```

### Database reset (start clean)
```bash
npx prisma migrate reset  # drops and recreates prisma/dev.db
npm run prisma:seed
```

## Useful scripts

```bash
# Backend
npm run dev                 # start API (http://localhost:3000)

# Frontend
cd web && npm run dev       # start Vite (prints URL)

# Prisma
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run prisma:studio       # open DB viewer
```

## Quick test checklist

- [ ] Visit `/admin`, create event, set phases
- [ ] Join from `/join` with event code
- [ ] Guess → Rank → Reveal all work
- [ ] Leaderboards update live across multiple browser windows
