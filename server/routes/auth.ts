import { Router } from 'express';
import { randomUUID } from 'crypto';
import prisma from '../lib/prisma';
import { RegisterSchema } from '../lib/validate';
import { z } from 'zod';

const router = Router();

// Helper to get authenticated user
export async function getAuthenticatedUser(req: any) {
  const token = req.signedCookies?.token || req.cookies?.token;
  if (!token) return null;
  
  return prisma.user.findUnique({ 
    where: { token }, 
    include: { event: true } 
  });
}

// Register/login
router.post('/register', async (req, res) => {
  try {
    const { eventCode, username } = RegisterSchema.parse(req.body);
    
    // Find event
    const event = await prisma.event.findUnique({ where: { code: eventCode } });
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    // Check if username is taken in this event
    const existingUser = await prisma.user.findUnique({
      where: {
        eventId_username: {
          eventId: event.id,
          username: username,
        }
      }
    });
    
    if (existingUser) {
      return res.status(400).json({ error: 'Username already taken in this event' });
    }
    
    // Create anonymous token
    const token = randomUUID();
    
    // Create user
    const user = await prisma.user.create({ 
      data: { 
        eventId: event.id, 
        username, 
        token 
      } 
    });
    
    // Set cookie (signed only if a secret is configured)
    res.cookie('token', token, { 
      httpOnly: true, 
      sameSite: 'lax', 
      secure: process.env.NODE_ENV === 'production',
      signed: Boolean(process.env.SESSION_SECRET),
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
    
    res.json({ 
      user: { 
        id: user.id, 
        username: user.username 
      }, 
      event: { 
        id: event.id, 
        status: event.status, 
        code: event.code,
        name: event.name
      } 
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.issues[0].message });
    }
    console.error('Register error:', error);
    res.status(500).json({ error: 'Failed to register' });
  }
});

// Get current user
router.get('/me', async (req, res) => {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    res.json({ 
      user: { 
        id: user.id, 
        username: user.username 
      },
      event: {
        id: user.event.id,
        status: user.event.status,
        code: user.event.code,
        name: user.event.name
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

// Logout
router.post('/logout', (_req, res) => {
  res.clearCookie('token');
  res.json({ ok: true });
});

export default router;
