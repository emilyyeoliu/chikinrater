import { Router } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { GuessSchema, RankSchema } from '../lib/validate';
import { getAuthenticatedUser } from './auth';
import { emitResults } from '../index';

const router = Router();

// Submit a guess
router.post('/guess', async (req, res) => {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    if (user.event.status !== 'GUESSING') {
      return res.status(400).json({ error: 'Not in guessing phase' });
    }
    
    const { boxNumber, placeName } = GuessSchema.parse(req.body);
    
    // Find box and place
    const [box, place] = await Promise.all([
      prisma.box.findUnique({ 
        where: { 
          eventId_number: { 
            eventId: user.eventId, 
            number: boxNumber 
          } 
        } 
      }),
      prisma.place.findUnique({ 
        where: { name: placeName } 
      }),
    ]);
    
    if (!box) {
      return res.status(400).json({ error: 'Invalid box number' });
    }
    
    if (!place) {
      return res.status(400).json({ error: 'Invalid place name' });
    }
    
    // Upsert guess
    await prisma.guess.upsert({
      where: { 
        userId_boxId: { 
          userId: user.id, 
          boxId: box.id 
        } 
      },
      update: { placeId: place.id },
      create: { 
        userId: user.id, 
        boxId: box.id, 
        placeId: place.id 
      },
    });
    
    // Emit updated results
    await emitResults(user.eventId);
    
    res.json({ ok: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.issues[0].message });
    }
    console.error('Guess error:', error);
    res.status(500).json({ error: 'Failed to submit guess' });
  }
});

// Get user's guesses
router.get('/guesses', async (req, res) => {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    const guesses = await prisma.guess.findMany({
      where: { userId: user.id },
      include: {
        box: true,
        place: true,
      },
    });
    
    res.json({ 
      guesses: guesses.map(g => ({
        boxNumber: g.box.number,
        placeName: g.place.name,
      }))
    });
  } catch (error) {
    console.error('Get guesses error:', error);
    res.status(500).json({ error: 'Failed to get guesses' });
  }
});

// Submit rankings
router.post('/rank', async (req, res) => {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    const { first, second, third } = RankSchema.parse(req.body);
    
    // Check all three are unique
    if (new Set([first, second, third]).size !== 3) {
      return res.status(400).json({ error: 'Must select 3 different boxes' });
    }
    
    // Get boxes
    const boxes = await prisma.box.findMany({ 
      where: { eventId: user.eventId } 
    });
    const boxByNumber = new Map(boxes.map(b => [b.number, b.id]));
    
    if (!boxByNumber.has(first) || !boxByNumber.has(second) || !boxByNumber.has(third)) {
      return res.status(400).json({ error: 'Invalid box numbers' });
    }
    
    // Upsert rankings in a transaction
    await prisma.$transaction([
      prisma.rankingEntry.upsert({
        where: { 
          userId_rank: { 
            userId: user.id, 
            rank: 1 
          } 
        },
        update: { boxId: boxByNumber.get(first)! },
        create: { 
          userId: user.id, 
          rank: 1, 
          boxId: boxByNumber.get(first)! 
        },
      }),
      prisma.rankingEntry.upsert({
        where: { 
          userId_rank: { 
            userId: user.id, 
            rank: 2 
          } 
        },
        update: { boxId: boxByNumber.get(second)! },
        create: { 
          userId: user.id, 
          rank: 2, 
          boxId: boxByNumber.get(second)! 
        },
      }),
      prisma.rankingEntry.upsert({
        where: { 
          userId_rank: { 
            userId: user.id, 
            rank: 3 
          } 
        },
        update: { boxId: boxByNumber.get(third)! },
        create: { 
          userId: user.id, 
          rank: 3, 
          boxId: boxByNumber.get(third)! 
        },
      }),
    ]);
    
    // Emit updated results
    await emitResults(user.eventId);
    
    res.json({ ok: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.issues[0].message });
    }
    console.error('Rank error:', error);
    res.status(500).json({ error: 'Failed to submit rankings' });
  }
});

// Get user's rankings
router.get('/rankings', async (req, res) => {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    const rankings = await prisma.rankingEntry.findMany({
      where: { userId: user.id },
      include: {
        box: true,
      },
      orderBy: { rank: 'asc' },
    });
    
    res.json({ 
      rankings: rankings.map(r => ({
        rank: r.rank,
        boxNumber: r.box.number,
      }))
    });
  } catch (error) {
    console.error('Get rankings error:', error);
    res.status(500).json({ error: 'Failed to get rankings' });
  }
});

// Get available places
router.get('/places', async (req, res) => {
  try {
    let places = await prisma.place.findMany({ orderBy: { name: 'asc' } });
    if (places.length === 0) {
      const defaultPlaces = [
        'Popeyes',
        'Jollibee',
        'The Bird',
        'Proposition Chicken',
        'KFC',
        'Starbird',
      ];
      // Seed defaults if none exist (idempotent via upsert)
      await prisma.$transaction(
        defaultPlaces.map((name) =>
          prisma.place.upsert({ where: { name }, update: {}, create: { name } })
        )
      );
      places = await prisma.place.findMany({ orderBy: { name: 'asc' } });
    }
    res.json({ places: places.map((p) => p.name) });
  } catch (error) {
    console.error('Get places error:', error);
    res.status(500).json({ error: 'Failed to get places' });
  }
});

// Player-triggered answers (party mode): return mappings regardless of status
router.get('/answers', async (req, res) => {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    const boxes = await prisma.box.findMany({
      where: { eventId: user.eventId },
      include: { place: true },
      orderBy: { number: 'asc' }
    });
    res.json({
      answers: boxes.map(b => ({ number: b.number, place: b.place?.name || null }))
    });
  } catch (error) {
    console.error('Get answers error:', error);
    res.status(500).json({ error: 'Failed to get answers' });
  }
});

export default router;
