import { useState, useEffect } from 'react';
import { adminAPI } from '../api';
import type { Event } from '../api';
import { LogoIcon } from '../components/Logo';

export default function Admin() {
  const [adminSecret, setAdminSecret] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [events, setEvents] = useState<any[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  
  // Form states
  const [newEventCode, setNewEventCode] = useState('');
  const [newEventName, setNewEventName] = useState('');
  const [mappings, setMappings] = useState<Record<string, string>>({
    '1': '',
    '2': '',
    '3': '',
    '4': '',
    '5': '',
    '6': '',
  });

  const places = [
    'Popeyes',
    'Jollibee',
    'The Bird',
    'Proposition Chicken',
    'KFC',
    'Starbird'
  ];

  useEffect(() => {
    // Check if admin secret is stored
    const storedSecret = localStorage.getItem('adminSecret');
    if (storedSecret) {
      setAdminSecret(storedSecret);
      adminAPI.setHeaders(storedSecret);
      setIsAuthenticated(true);
      loadEvents();
    }
  }, []);

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('adminSecret', adminSecret);
    adminAPI.setHeaders(adminSecret);
    setIsAuthenticated(true);
    loadEvents();
  };

  const loadEvents = async () => {
    try {
      const data = await adminAPI.getEvents();
      setEvents(data.events);
    } catch (error) {
      console.error('Failed to load events:', error);
      alert('Invalid admin secret');
      handleLogout();
    }
  };

  const loadEvent = async (code: string) => {
    try {
      setLoading(true);
      const data = await adminAPI.getEvent(code);
      setSelectedEvent(data.event);
      
      // Load existing mappings
      const newMappings: Record<string, string> = {};
      data.event.boxes.forEach((box: any) => {
        if (box.placeName) {
          newMappings[box.number.toString()] = box.placeName;
        }
      });
      setMappings(newMappings);
    } catch (error) {
      console.error('Failed to load event:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await adminAPI.seed(newEventCode.toUpperCase(), newEventName);
      alert('Event created successfully!');
      setNewEventCode('');
      setNewEventName('');
      loadEvents();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (status: Event['status']) => {
    if (!selectedEvent) return;
    
    try {
      setLoading(true);
      await adminAPI.updateStatus(selectedEvent.code, status);
      alert(`Status updated to ${status}`);
      loadEvent(selectedEvent.code);
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveMappings = async () => {
    if (!selectedEvent) return;
    
    // Validate all mappings are set
    const allMapped = Object.values(mappings).every(v => v);
    if (!allMapped) {
      alert('Please set all box mappings');
      return;
    }
    
    try {
      setLoading(true);
      await adminAPI.setMapping(selectedEvent.code, mappings);
      alert('Mappings saved successfully!');
    } catch (error) {
      console.error('Failed to save mappings:', error);
      alert('Failed to save mappings');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminSecret');
    setIsAuthenticated(false);
    setAdminSecret('');
    setEvents([]);
    setSelectedEvent(null);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-golden-50 to-chicken-50 flex items-center justify-center px-4">
        <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-xl border-2 border-golden-200 p-8 w-full max-w-md">
          <div className="flex items-center justify-center mb-6">
            <LogoIcon size="lg" className="mr-3" />
            <h1 className="text-2xl font-bold text-crust-900">Admin Panel</h1>
          </div>
          <form onSubmit={handleAuth}>
            <input
              type="password"
              value={adminSecret}
              onChange={(e) => setAdminSecret(e.target.value)}
              placeholder="Enter admin secret"
              className="w-full px-4 py-2 border-2 border-golden-300 focus:border-chicken-500 focus:ring-chicken-500 rounded-lg mb-4 bg-white/80"
              required
            />
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-chicken-600 to-chicken-500 hover:from-chicken-700 hover:to-chicken-600 text-white font-semibold py-2 rounded-lg shadow-lg transition-all duration-300"
            >
              Login
            </button>
          </form>
          <a href="/" className="block text-center mt-4 text-sm text-crust-600 hover:text-chicken-600 underline font-medium transition-colors">
            Back to Game
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-golden-50 to-chicken-50">
      <div className="bg-white/95 backdrop-blur-sm shadow-lg border-b-2 border-golden-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <LogoIcon size="md" />
              <h1 className="text-2xl font-bold text-crust-900">Admin Panel</h1>
            </div>
            <button
              onClick={handleLogout}
              className="text-sm text-red-600 hover:text-red-700 underline font-medium transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Create Event */}
          <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-xl border-2 border-golden-200 p-6">
            <h2 className="text-xl font-bold mb-4 text-crust-900">Create New Event</h2>
            <form onSubmit={handleCreateEvent}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Event Code
                </label>
                <input
                  type="text"
                  value={newEventCode}
                  onChange={(e) => setNewEventCode(e.target.value)}
                  placeholder="e.g., WINGS"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  required
                  maxLength={20}
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Event Name
                </label>
                <input
                  type="text"
                  value={newEventName}
                  onChange={(e) => setNewEventName(e.target.value)}
                  placeholder="e.g., Chicken Party 2024"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-500 text-white font-semibold py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50"
              >
                Create Event
              </button>
            </form>
          </div>

          {/* Events List */}
          <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-xl border-2 border-golden-200 p-6">
            <h2 className="text-xl font-bold mb-4 text-crust-900">Events</h2>
            <div className="space-y-2">
              {events.map(event => (
                <button
                  key={event.id}
                  onClick={() => loadEvent(event.code)}
                  className={`w-full text-left p-3 rounded-lg border-2 transition-all duration-200 ${
                    selectedEvent?.id === event.id
                      ? 'border-chicken-500 bg-chicken-50 shadow-md'
                      : 'border-golden-300 hover:bg-golden-50 hover:border-golden-400'
                  }`}
                >
                  <div className="font-semibold">{event.name}</div>
                  <div className="text-sm text-gray-600">
                    Code: {event.code} | Status: {event.status} | Users: {event.userCount}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Selected Event Management */}
        {selectedEvent && (
          <div className="mt-8 bg-white/95 backdrop-blur-sm rounded-lg shadow-xl border-2 border-golden-200 p-6">
            <h2 className="text-xl font-bold mb-4 text-crust-900">
              Manage Event: {selectedEvent.name} ({selectedEvent.code})
            </h2>

            {/* Status Control */}
            <div className="mb-6">
              <h3 className="font-semibold mb-2 text-crust-800">Event Status</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => handleUpdateStatus('GUESSING')}
                  disabled={loading || selectedEvent.status === 'GUESSING'}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
                >
                  Start Guessing
                </button>
                <button
                  onClick={() => handleUpdateStatus('RANKING')}
                  disabled={loading || selectedEvent.status === 'RANKING'}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                >
                  Start Ranking
                </button>
                <button
                  onClick={() => handleUpdateStatus('REVEALED')}
                  disabled={loading || selectedEvent.status === 'REVEALED'}
                  className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50"
                >
                  Reveal Results
                </button>
                <button
                  onClick={() => handleUpdateStatus('CLOSED')}
                  disabled={loading || selectedEvent.status === 'CLOSED'}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50"
                >
                  Close Event
                </button>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Current status: <span className="font-semibold">{selectedEvent.status}</span>
              </p>
            </div>

            {/* Box Mappings */}
            <div>
              <h3 className="font-semibold mb-2 text-crust-800">Box Mappings</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map(num => (
                  <div key={num}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Box #{num}
                    </label>
                    <select
                      value={mappings[num.toString()] || ''}
                      onChange={(e) => setMappings(prev => ({
                        ...prev,
                        [num.toString()]: e.target.value
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="">Select brand</option>
                      {places.map(place => (
                        <option key={place} value={place}>{place}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
              <button
                onClick={handleSaveMappings}
                disabled={loading}
                className="mt-4 px-6 py-2 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 disabled:opacity-50"
              >
                Save Mappings
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
