# 🍗 Quick Start Guide - Test Locally in 2 Minutes!

Since you don't have PostgreSQL installed, I've created a simple setup that uses SQLite for local testing.

## Step 1: Run Setup (One Time Only)

```bash
./setup-local.sh
```

This will:
- Configure SQLite database (no installation needed!)
- Install all dependencies
- Set up the database
- Create test data

## Step 2: Start the App

You'll need **two terminal windows**:

**Terminal 1 - Backend Server:**
```bash
npm run dev
```

**Terminal 2 - Frontend:**
```bash
npm run dev:web
```

## Step 3: Test the Game!

### As Admin:
1. Open http://localhost:5173/admin
2. Password: `admin123`
3. Create event with code: `TEST`
4. Set box mappings (which brand is in each box)
5. Control game phases with buttons

### As Player:
1. Open http://localhost:5173 (use incognito for multiple players)
2. Join with code: `TEST`
3. Pick any username
4. Play through the phases:
   - **Guess** which brand is in each box
   - **Rank** your top 3 by taste
   - **See results** when admin reveals

## That's it! 🎉

The app is now running locally with:
- Backend API: http://localhost:3000
- Frontend: http://localhost:5173
- Database: SQLite (no setup needed)
- Admin password: `admin123`

## Tips:
- Open multiple incognito windows to test with multiple players
- Watch the real-time updates as players vote
- The admin controls when to move between phases

## Troubleshooting:

**Port already in use?**
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill

# Kill process on port 5173  
lsof -ti:5173 | xargs kill
```

**Want to reset everything?**
```bash
rm -f prisma/dev.db
npm run prisma:migrate -- --name init
npm run prisma:seed
```
