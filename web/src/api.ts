import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Types
export interface User {
  id: string;
  username: string;
}

export interface Event {
  id: string;
  code: string;
  name: string;
  status: 'GUESSING' | 'RANKING' | 'REVEALED' | 'CLOSED';
}

export interface Box {
  number: number;
  revealedPlace?: string | null;
  correctGuesses?: number;
}

export interface GuessDistribution {
  [placeName: string]: number;
}

export interface BoxResult {
  number: number;
  guessDist: GuessDistribution;
  points: number;
  rankCounts: Record<number, number>;
  revealedPlace?: string | null;
  correctGuesses?: number;
}

export interface UserAccuracy {
  username: string;
  correct: number;
  total: number;
}

export interface UserProgress {
  userId: string;
  username: string;
  guessesCompleted: number;
  rankingCompleted: boolean;
}

export interface ResultsPayload {
  eventStatus: Event['status'];
  boxes: Box[];
  results: BoxResult[];
  userAccuracy?: UserAccuracy[];
  userProgress: UserProgress[];
}

// Auth API
export const authAPI = {
  register: async (eventCode: string, username: string) => {
    const { data } = await api.post('/api/register', { eventCode, username });
    return data as { user: User; event: Event };
  },
  
  me: async () => {
    const { data } = await api.get('/api/me');
    return data as { user: User; event: Event };
  },
  
  logout: async () => {
    await api.post('/api/logout');
  },
};

// Game API
export const gameAPI = {
  guess: async (boxNumber: number, placeName: string) => {
    const { data } = await api.post('/api/guess', { boxNumber, placeName });
    return data;
  },
  
  getGuesses: async () => {
    const { data } = await api.get('/api/guesses');
    return data as { guesses: Array<{ boxNumber: number; placeName: string }> };
  },
  
  rank: async (first: number, second: number, third: number) => {
    const { data } = await api.post('/api/rank', { first, second, third });
    return data;
  },
  
  getRankings: async () => {
    const { data } = await api.get('/api/rankings');
    return data as { rankings: Array<{ rank: number; boxNumber: number }> };
  },
  
  getPlaces: async () => {
    const { data } = await api.get('/api/places');
    return data as { places: string[] };
  },
};

// Admin API
export const adminAPI = {
  setHeaders: (adminSecret: string) => {
    api.defaults.headers['x-admin-secret'] = adminSecret;
  },
  
  seed: async (eventCode: string, eventName: string) => {
    const { data } = await api.post('/api/admin/seed', { eventCode, eventName });
    return data;
  },
  
  updateStatus: async (code: string, status: Event['status']) => {
    const { data } = await api.post('/api/admin/status', { code, status });
    return data;
  },
  
  setMapping: async (code: string, mappings: Record<string, string>) => {
    const { data } = await api.post('/api/admin/map', { code, mappings });
    return data;
  },
  
  getEvent: async (code: string) => {
    const { data } = await api.get(`/api/admin/event/${code}`);
    return data;
  },
  
  getEvents: async () => {
    const { data } = await api.get('/api/admin/events');
    return data;
  },
};

export default api;
