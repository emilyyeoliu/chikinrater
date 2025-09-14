import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../api';
import type { User, Event } from '../api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface JoinProps {
  setUser: (user: User) => void;
  setEvent: (event: Event) => void;
}

export default function Join({ setUser, setEvent }: JoinProps) {
  const navigate = useNavigate();
  const [eventCode, setEventCode] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await authAPI.register(eventCode.toUpperCase(), username);
      setUser(data.user);
      setEvent(data.event);
      navigate('/play');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to join event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl">🍗 Chikin Rater</CardTitle>
          <CardDescription>
            Welcome to the ultimate fried chicken taste test!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="eventCode" className="block mb-2 text-sm font-medium">
                Event Code
              </label>
              <Input
                id="eventCode"
                type="text"
                placeholder="Enter event code"
                value={eventCode}
                onChange={(e) => setEventCode(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div>
              <label htmlFor="username" className="block mb-2 text-sm font-medium">
                Your Name
              </label>
              <Input
                id="username"
                type="text"
                placeholder="Enter your name"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                maxLength={30}
                pattern="[a-zA-Z0-9_-]*"
                title="Letters, numbers, underscores, and dashes only"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading || !eventCode.trim() || !username.trim()}>
              {loading ? 'Joining...' : 'Start Tasting! 🍗'}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Rate 6 mystery chicken boxes and guess where they're from!
            </p>
          </div>

          <div className="mt-4 text-center">
            <a
              href="/admin"
              className="text-sm text-gray-500 hover:text-gray-700 underline"
            >
              Admin Panel
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
