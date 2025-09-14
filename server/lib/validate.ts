import { z } from 'zod';

export const RegisterSchema = z.object({
  eventCode: z.string().min(2).max(20),
  username: z.string().min(1).max(30).regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and dashes'),
});

export const GuessSchema = z.object({
  boxNumber: z.number().int().min(1).max(6),
  placeName: z.string(),
});

export const RankSchema = z.object({
  first: z.number().int().min(1).max(6),
  second: z.number().int().min(1).max(6),
  third: z.number().int().min(1).max(6),
});

export const AdminStatusSchema = z.object({
  code: z.string(),
  status: z.enum(['GUESSING', 'RANKING', 'REVEALED', 'CLOSED']),
});

export const AdminMapSchema = z.object({
  code: z.string(),
  // Use explicit key and value schemas for compatibility across zod versions
  // Use `any` cast to avoid TS signature mismatch across Zod versions during build environments
  mappings: (z as any).record ? (z as any).record(z.string(), z.string()) : (z as any).record(z.string()),
});

export const AdminSeedSchema = z.object({
  eventCode: z.string().min(2).max(20),
  eventName: z.string().min(1).max(100),
});
