# 🍗 Chicken Rater

A real-time party game for blind taste-testing and rating chicken from different restaurants.

## Features

- **Anonymous Authentication**: Simple username-based login with cookie sessions
- **Three Game Phases**:
  1. **Guessing**: Players guess which brand each numbered box contains
  2. **Ranking**: Players rank their top 3 boxes by taste
  3. **Reveal**: Results are revealed showing correct answers and winners
- **Real-time Updates**: Live results using Socket.IO
- **Admin Panel**: Control game phases and set box mappings

## Tech Stack

- **Backend**: Node.js, Express, Socket.IO, TypeScript
- **Frontend**: React, Vite, TypeScript, Tailwind CSS
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Anonymous tokens with HTTP-only cookies

## Setup

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   cd web && npm install && cd ..
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/chikinrater?schema=public"
   PORT=3000
   SESSION_SECRET="your-session-secret-here"
   ADMIN_SECRET="your-admin-secret-here"
   ```

4. Set up the database:
   ```bash
   npm run prisma:migrate
   npm run prisma:seed
   ```

### Development

Run the backend server:
```bash
npm run dev
```

In a separate terminal, run the frontend:
```bash
npm run dev:web
```

- Backend: http://localhost:3000
- Frontend: http://localhost:5173

### Production Build

```bash
npm run build:full
npm start
```

## Game Flow

1. **Admin Setup**:
   - Go to `/admin`
   - Create a new event with a code (e.g., "WINGS")
   - Set the box-to-brand mappings (keep secret!)

2. **Players Join**:
   - Go to `/join`
   - Enter the event code and username

3. **Guessing Phase**:
   - Players guess which brand is in each box (1-6)
   - Live statistics show guess distribution

4. **Ranking Phase**:
   - Players rank their top 3 boxes by taste
   - Must complete all guesses first

5. **Reveal**:
   - Admin reveals the results
   - Shows correct mappings and accuracy leaderboard

## Deployment

### Railway

1. Create a new Railway project
2. Add a PostgreSQL database
3. Set environment variables:
   - `DATABASE_URL` (from Railway)
   - `SESSION_SECRET`
   - `ADMIN_SECRET`
   - `NODE_ENV=production`
4. Deploy from GitHub

Build command:
```bash
npm ci && npm run build:full && npx prisma migrate deploy
```

Start command:
```bash
npm start
```

## API Endpoints

### Auth
- `POST /api/register` - Join event with username
- `GET /api/me` - Get current user
- `POST /api/logout` - Clear session

### Game
- `POST /api/guess` - Submit a guess
- `GET /api/guesses` - Get user's guesses
- `POST /api/rank` - Submit rankings
- `GET /api/rankings` - Get user's rankings
- `GET /api/places` - Get available places

### Admin (requires x-admin-secret header)
- `POST /api/admin/seed` - Create new event
- `POST /api/admin/status` - Update event status
- `POST /api/admin/map` - Set box mappings
- `GET /api/admin/events` - List all events
- `GET /api/admin/event/:code` - Get event details

### WebSocket Events
- `join` - Join event room
- `results:update` - Live results data
- `event:status` - Status changes

## License

ISC
