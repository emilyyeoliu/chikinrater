import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../api';
import type { User, Event } from '../api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Logo from '../components/Logo';

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
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-golden-50 to-chicken-50">
      <Card className="w-full max-w-md shadow-xl border-2 border-golden-200 bg-white/90 backdrop-blur-sm">
        <CardHeader className="text-center pb-6">
          <div className="flex justify-center mb-4">
            <Logo size="xl" className="justify-center" />
          </div>
          <CardDescription className="text-lg text-crust-700 font-medium">
            Welcome to the ultimate fried chicken taste test party!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="eventCode" className="block mb-2 text-sm font-semibold text-crust-800">
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
                className="border-golden-300 focus:border-chicken-500 focus:ring-chicken-500 bg-white/80"
              />
            </div>

            <div>
              <label htmlFor="username" className="block mb-2 text-sm font-semibold text-crust-800">
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
                pattern="[A-Za-z0-9_\\-]+"
                title="Letters, numbers, underscores, and dashes only"
                className="border-golden-300 focus:border-chicken-500 focus:ring-chicken-500 bg-white/80"
              />
            </div>

            {error && (
              <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm font-medium">
                {error}
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-chicken-600 to-chicken-500 hover:from-chicken-700 hover:to-chicken-600 text-white font-bold py-3 shadow-lg hover:shadow-xl transition-all duration-300 border-0" 
              disabled={loading || !eventCode.trim() || !username.trim()}
            >
              {loading ? 'Joining the Party...' : 'Start Tasting! 🍗✨'}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-crust-600 bg-golden-100 px-4 py-2 rounded-lg border border-golden-200">
              🥳 Rate 6 mystery chicken boxes and guess where they're from! 🥳
            </p>
          </div>

          <div className="mt-4 text-center">
            <a
              href="/admin"
              className="text-sm text-crust-500 hover:text-chicken-600 underline font-medium transition-colors"
            >
              Admin Panel
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
