import express from 'express';
import http from 'http';
import cookieParser from 'cookie-parser';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';

import prisma from './lib/prisma';
import { buildResultsForEvent } from './results';
import authRoutes from './routes/auth';
import gameRoutes from './routes/game';
import adminRoutes from './routes/admin';

// Load environment variables
dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, { 
  cors: { 
    origin: process.env.NODE_ENV === 'production' ? false : true, 
    credentials: true 
  } 
});

// Middleware
app.use(cors({ 
  origin: process.env.NODE_ENV === 'production' ? false : true, 
  credentials: true 
}));
app.use(express.json());
app.use(cookieParser(process.env.SESSION_SECRET));

// Helper functions
export function room(eventId: string) { 
  return `event:${eventId}`; 
}

export async function emitResults(eventId: string) {
  try {
    const payload = await buildResultsForEvent(eventId);
    io.to(room(eventId)).emit('results:update', payload);
  } catch (error) {
    console.error('Error emitting results:', error);
  }
}

// Make io available to routes
app.set('io', io);

// API Routes
app.use('/api', authRoutes);
app.use('/api', gameRoutes);
app.use('/api/admin', adminRoutes);

// Socket.IO
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('join', async ({ eventCode }) => {
    try {
      const event = await prisma.event.findUnique({ where: { code: eventCode } });
      if (!event) {
        socket.emit('error', { message: 'Event not found' });
        return;
      }
      
      socket.join(room(event.id));
      console.log(`Socket ${socket.id} joined room ${room(event.id)}`);
      
      const payload = await buildResultsForEvent(event.id);
      socket.emit('results:update', payload);
      socket.emit('event:status', { status: event.status });
    } catch (error) {
      console.error('Error joining room:', error);
      socket.emit('error', { message: 'Failed to join event' });
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Serve frontend build in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(process.cwd(), 'web', 'dist')));
  app.get('*', (_, res) => {
    res.sendFile(path.join(process.cwd(), 'web', 'dist', 'index.html'));
  });
}

// Error handling middleware
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
