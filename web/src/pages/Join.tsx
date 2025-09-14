import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../api';
import type { User, Event } from '../api';

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
    <div className="min-h-screen bg-gradient-to-br from-orange-400 to-red-600 flex items-center justify-center px-4">
      <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">🍗 Chicken Rater</h1>
          <p className="text-gray-600">Join the ultimate chicken taste test!</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="eventCode" className="block text-sm font-medium text-gray-700 mb-2">
              Event Code
            </label>
            <input
              type="text"
              id="eventCode"
              value={eventCode}
              onChange={(e) => setEventCode(e.target.value)}
              placeholder="Enter event code"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              required
              autoFocus
            />
          </div>

          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
              Your Name
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your name"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              required
              maxLength={30}
              pattern="[a-zA-Z0-9_-]+"
              title="Letters, numbers, underscores, and dashes only"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-500 text-white font-semibold py-3 rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Joining...' : 'Join Event'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <a
            href="/admin"
            className="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            Admin Panel
          </a>
        </div>
      </div>
    </div>
  );
}
