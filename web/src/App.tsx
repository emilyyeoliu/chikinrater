import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Join from './pages/Join';
import Play from './pages/Play';
import Admin from './pages/Admin';
import { authAPI } from './api';
import type { User, Event } from './api';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already authenticated
    authAPI.me()
      .then((data) => {
        setUser(data.user);
        setEvent(data.event);
      })
      .catch(() => {
        // Not authenticated
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Routes>
          <Route 
            path="/join" 
            element={
              user ? (
                <Navigate to="/play" replace />
              ) : (
                <Join setUser={setUser} setEvent={setEvent} />
              )
            } 
          />
          <Route 
            path="/play" 
            element={
              user && event ? (
                <Play user={user} event={event} />
              ) : (
                <Navigate to="/join" replace />
              )
            } 
          />
          <Route path="/admin" element={<Admin />} />
          <Route path="/" element={<Navigate to="/join" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;