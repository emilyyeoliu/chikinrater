# 🍗 Local Testing Guide

## Prerequisites

1. **PostgreSQL** installed locally (or use Docker)
2. **Node.js 18+** installed
3. **Two terminal windows** ready

## Quick Setup

### Option 1: Using Local PostgreSQL

1. **Create a PostgreSQL database**:
   ```bash
   createdb chikinrater
   ```

2. **Update your `.env` file**:
   ```env
   DATABASE_URL="postgresql://YOUR_USER:YOUR_PASSWORD@localhost:5432/chikinrater?schema=public"
   PORT=3000
   SESSION_SECRET="local-dev-secret-123"
   ADMIN_SECRET="admin123"
   ```

### Option 2: Using Docker for PostgreSQL

1. **Run PostgreSQL in Docker**:
   ```bash
   docker run --name chikinrater-db -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=chikinrater -p 5432:5432 -d postgres
   ```

2. **Update your `.env` file**:
   ```env
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/chikinrater?schema=public"
   PORT=3000
   SESSION_SECRET="local-dev-secret-123"
   ADMIN_SECRET="admin123"
   ```

## Running the App

### First Time Setup

```bash
# 1. Install dependencies
npm install
cd web && npm install && cd ..

# 2. Generate Prisma client
npm run prisma:generate

# 3. Run database migrations
npm run prisma:migrate

# 4. Seed the database with chicken places
npm run prisma:seed
```

### Start Development Servers

**Terminal 1 - Backend Server**:
```bash
npm run dev
```
The backend will run on http://localhost:3000

**Terminal 2 - Frontend Dev Server**:
```bash
npm run dev:web
```
The frontend will run on http://localhost:5173

## Testing the Game Flow

### 1. Admin Setup

1. Go to http://localhost:5173/admin
2. Enter admin secret: `admin123`
3. Create a new event:
   - Event Code: `TEST`
   - Event Name: `Test Chicken Party`
4. Click on the created event to manage it
5. Set box mappings (e.g., Box 1 → Popeyes, Box 2 → KFC, etc.)
6. Keep this tab open to control game phases

### 2. Player Experience

1. Open a new browser window (or incognito)
2. Go to http://localhost:5173
3. Join the event:
   - Event Code: `TEST`
   - Username: `Player1`

### 3. Game Phases

**Guessing Phase** (Admin: "Start Guessing")
- Players guess which brand is in each box
- Live statistics show guess distribution

**Ranking Phase** (Admin: "Start Ranking")
- Players rank their top 3 boxes by taste
- Must complete all guesses first

**Reveal Phase** (Admin: "Reveal Results")
- Box mappings are revealed
- Accuracy and taste leaderboards shown

### 4. Testing Multiple Players

Open multiple browser windows/tabs in incognito mode to simulate multiple players:
- Each player needs a unique username
- You'll see real-time updates across all windows

## Useful Commands

```bash
# View database content
npm run prisma:studio

# Reset database
npx prisma migrate reset

# Check logs
# Backend logs appear in Terminal 1
# Frontend logs appear in browser console
```

## Common Issues

1. **Port already in use**: 
   - Change PORT in .env
   - Or kill existing process: `lsof -ti:3000 | xargs kill`

2. **Database connection failed**:
   - Ensure PostgreSQL is running
   - Check DATABASE_URL in .env
   - Try: `psql -U YOUR_USER -d chikinrater`

3. **WebSocket connection failed**:
   - Check that backend is running
   - Ensure frontend is connecting to correct port

## Testing Checklist

- [ ] Can create event as admin
- [ ] Can join event as player
- [ ] Can submit guesses for all 6 boxes
- [ ] Live guess counts update in real-time
- [ ] Can submit rankings after guessing
- [ ] Rankings require all guesses complete
- [ ] Admin can change phases
- [ ] Results reveal shows correct answers
- [ ] Leaderboards calculate correctly
- [ ] Multiple players see updates simultaneously

## Sample Test Data

When setting box mappings as admin, try this configuration:
- Box 1: Popeyes
- Box 2: KFC
- Box 3: Jollibee
- Box 4: The Bird
- Box 5: Starbird
- Box 6: Proposition Chicken

This gives a good variety for testing!
