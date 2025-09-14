import { Router } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { AdminStatusSchema, AdminMapSchema, AdminSeedSchema } from '../lib/validate';
import { emitResults, room } from '../index';

const router = Router();

// Admin authentication middleware (party mode)
// Simplified to a single hardcoded password for local/party usage
function requireAdmin(req: any, res: any, next: any) {
  const adminSecret = req.header('x-admin-secret');
  const envSecret = process.env.ADMIN_SECRET;
  const ok = adminSecret === 'chikin123' || (envSecret && adminSecret === envSecret);
  if (!ok) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  next();
}

// Apply admin auth to all routes
router.use(requireAdmin);

// Seed event and data
router.post('/seed', async (req, res) => {
  try {
    const { eventCode, eventName } = AdminSeedSchema.parse(req.body);
    
    // Check if event already exists
    const existingEvent = await prisma.event.findUnique({
      where: { code: eventCode }
    });
    
    if (existingEvent) {
      return res.status(400).json({ error: 'Event with this code already exists' });
    }
    
    // Create event, places, and boxes in a transaction
    await prisma.$transaction(async (tx) => {
      // Create event
      const event = await tx.event.create({
        data: {
          code: eventCode,
          name: eventName,
          status: 'GUESSING',
        }
      });
      
      // Create places if they don't exist
      const placeNames = [
        'Popeyes',
        'Jollibee',
        'The Bird',
        'Proposition Chicken',
        'KFC',
        'Starbird'
      ];
      
      for (const name of placeNames) {
        await tx.place.upsert({
          where: { name },
          update: {},
          create: { name },
        });
      }
      
      // Create 6 boxes
      for (let i = 1; i <= 6; i++) {
        await tx.box.create({
          data: {
            eventId: event.id,
            number: i,
          }
        });
      }
    });
    
    res.json({ ok: true, message: 'Event seeded successfully' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.issues[0].message });
    }
    console.error('Seed error:', error);
    res.status(500).json({ error: 'Failed to seed event' });
  }
});

// Update event status
router.post('/status', async (req, res) => {
  try {
    const { code, status } = AdminStatusSchema.parse(req.body);
    
    const event = await prisma.event.update({ 
      where: { code }, 
      data: { status } 
    });
    
    // Get io instance from app
    const io = req.app.get('io');
    
    // Emit status change
    io.to(room(event.id)).emit('event:status', { status });
    
    // Emit updated results
    await emitResults(event.id);
    
    res.json({ ok: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.issues[0].message });
    }
    console.error('Status update error:', error);
    res.status(500).json({ error: 'Failed to update status' });
  }
});

// Set box mappings
router.post('/map', async (req, res) => {
  try {
    // Be forgiving here to avoid zod runtime issues; validate manually
    const body = req.body ?? {};
    const code: string | undefined = body.code;
    const mappings: Record<string, string> | undefined = body.mappings;
    if (!code || !mappings || typeof mappings !== 'object') {
      return res.status(400).json({ error: 'Invalid payload. Expected { code, mappings }' });
    }
    
    const event = await prisma.event.findUnique({ where: { code } });
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    // Get all places
    const places = await prisma.place.findMany();
    const placeByName = new Map(places.map(p => [p.name, p.id]));
    
    // Update boxes in a transaction
    await prisma.$transaction(async (tx) => {
      for (const [numStr, placeName] of Object.entries(mappings)) {
        const num = Number(numStr);
        const placeId = placeByName.get(placeName);
        
        if (!placeId) {
          throw new Error(`Place not found: ${placeName}`);
        }
        
        await tx.box.update({
          where: { 
            eventId_number: { 
              eventId: event.id, 
              number: num 
            } 
          },
          data: { placeId },
        });
      }
    });
    
    // Emit updated results if revealed
    if (event.status === 'REVEALED') {
      await emitResults(event.id);
    }
    
    res.json({ ok: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.issues[0].message });
    }
    console.error('Map error:', error);
    res.status(500).json({ error: 'Failed to set mappings' });
  }
});

// Get event details
router.get('/event/:code', async (req, res) => {
  try {
    const { code } = req.params;
    
    const event = await prisma.event.findUnique({
      where: { code },
      include: {
        boxes: {
          include: {
            place: true,
            _count: {
              select: {
                guesses: true,
                rankings: true,
              }
            }
          },
          orderBy: { number: 'asc' }
        },
        _count: {
          select: {
            users: true,
          }
        }
      }
    });
    
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    res.json({ 
      event: {
        ...event,
        boxes: event.boxes.map(box => ({
          number: box.number,
          placeId: box.placeId,
          placeName: box.place?.name,
          guessCount: box._count.guesses,
          rankingCount: box._count.rankings,
        })),
        userCount: event._count.users,
      }
    });
  } catch (error) {
    console.error('Get event error:', error);
    res.status(500).json({ error: 'Failed to get event' });
  }
});

// Get all events
router.get('/events', async (req, res) => {
  try {
    const events = await prisma.event.findMany({
      include: {
        _count: {
          select: {
            users: true,
            boxes: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json({ 
      events: events.map(e => ({
        id: e.id,
        code: e.code,
        name: e.name,
        status: e.status,
        createdAt: e.createdAt,
        userCount: e._count.users,
        boxCount: e._count.boxes,
      }))
    });
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({ error: 'Failed to get events' });
  }
});

export default router;
