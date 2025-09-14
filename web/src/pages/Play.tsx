import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { User, Event, ResultsPayload } from '../api';
import { gameAPI, authAPI } from '../api';
import socketManager from '../socket';
import BoxCard from '../components/BoxCard';
import GuessModal from '../components/GuessModal';
import TopThree from '../components/TopThree';
import Leaderboard from '../components/Leaderboard';
import UserAccuracyBoard from '../components/UserAccuracyBoard';

interface PlayProps {
  user: User;
  event: Event;
}

export default function Play({ user, event: initialEvent }: PlayProps) {
  const navigate = useNavigate();
  const [event, setEvent] = useState(initialEvent);
  const [results, setResults] = useState<ResultsPayload | null>(null);
  const [userGuesses, setUserGuesses] = useState<Record<number, string>>({});
  const [userRankings, setUserRankings] = useState<Record<number, number>>({});
  const [selectedBox, setSelectedBox] = useState<number | null>(null);
  const [places, setPlaces] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Load initial data
  useEffect(() => {
    Promise.all([
      gameAPI.getPlaces(),
      gameAPI.getGuesses(),
      gameAPI.getRankings(),
    ]).then(([placesData, guessesData, rankingsData]) => {
      setPlaces(placesData.places);
      
      const guessMap: Record<number, string> = {};
      guessesData.guesses.forEach(g => {
        guessMap[g.boxNumber] = g.placeName;
      });
      setUserGuesses(guessMap);
      
      const rankMap: Record<number, number> = {};
      rankingsData.rankings.forEach(r => {
        rankMap[r.boxNumber] = r.rank;
      });
      setUserRankings(rankMap);
    }).finally(() => {
      setLoading(false);
    });
  }, []);

  // Socket connection
  useEffect(() => {
    socketManager.connect();
    socketManager.joinEvent(event.code);

    const unsubResults = socketManager.on('results:update', (data: ResultsPayload) => {
      setResults(data);
    });

    const unsubStatus = socketManager.on('event:status', (data: { status: Event['status'] }) => {
      setEvent(prev => ({ ...prev, status: data.status }));
    });

    return () => {
      unsubResults();
      unsubStatus();
    };
  }, [event.code]);

  const handleGuess = async (placeName: string) => {
    if (selectedBox === null) return;
    
    try {
      await gameAPI.guess(selectedBox, placeName);
      setUserGuesses(prev => ({ ...prev, [selectedBox]: placeName }));
      setSelectedBox(null);
    } catch (error) {
      console.error('Failed to submit guess:', error);
      alert('Failed to submit guess. Please try again.');
    }
  };

  const handleRankingSubmit = async (rankings: { first: number; second: number; third: number }) => {
    try {
      await gameAPI.rank(rankings.first, rankings.second, rankings.third);
      setUserRankings({
        [rankings.first]: 1,
        [rankings.second]: 2,
        [rankings.third]: 3,
      });
    } catch (error: any) {
      console.error('Failed to submit rankings:', error);
      alert(error.response?.data?.error || 'Failed to submit rankings. Please try again.');
    }
  };

  const handleLogout = async () => {
    await authAPI.logout();
    navigate('/join');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading game...</div>
      </div>
    );
  }

  const userProgress = results?.userProgress.find(p => p.userId === user.id);
  const hasCompletedGuesses = Object.keys(userGuesses).length === 6;
  const hasCompletedRankings = Object.keys(userRankings).length === 3;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">🍗 {event.name}</h1>
              <p className="text-sm text-gray-600">
                Status: <span className="font-semibold capitalize">{event.status.toLowerCase()}</span>
              </p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">Welcome, {user.username}!</span>
              <button
                onClick={handleLogout}
                className="text-sm text-red-600 hover:text-red-700 underline"
              >
                Leave Event
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Game Content */}
        {event.status === 'GUESSING' && (
          <div>
            <h2 className="text-xl font-semibold mb-4">
              Guess the brand for each box
              {userProgress && (
                <span className="text-sm font-normal text-gray-600 ml-2">
                  ({userProgress.guessesCompleted}/6 completed)
                </span>
              )}
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
              {[1, 2, 3, 4, 5, 6].map(num => (
                <BoxCard
                  key={num}
                  number={num}
                  guess={userGuesses[num]}
                  distribution={results?.results.find(r => r.number === num)?.guessDist}
                  onClick={() => setSelectedBox(num)}
                  disabled={false}
                />
              ))}
            </div>

            {hasCompletedGuesses && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-center">
                Great! You've completed all your guesses. Wait for the ranking phase to begin.
              </div>
            )}
          </div>
        )}

        {event.status === 'RANKING' && (
          <div>
            {!hasCompletedGuesses ? (
              <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg">
                You must complete all guesses before ranking. The guessing phase has ended.
              </div>
            ) : !hasCompletedRankings ? (
              <div>
                <h2 className="text-xl font-semibold mb-4">
                  Rank your top 3 boxes by taste
                </h2>
                <TopThree onSubmit={handleRankingSubmit} />
              </div>
            ) : (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-center">
                Rankings submitted! Wait for the results to be revealed.
              </div>
            )}
          </div>
        )}

        {event.status === 'REVEALED' && (
          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-semibold mb-4">Results Revealed!</h2>
              
              {/* Box Mappings */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                {results?.boxes.map(box => {
                  const userGuess = userGuesses[box.number];
                  const isCorrect = userGuess === box.revealedPlace;
                  
                  return (
                    <div
                      key={box.number}
                      className={`p-4 rounded-lg border-2 ${
                        isCorrect ? 'bg-green-50 border-green-500' : 'bg-red-50 border-red-500'
                      }`}
                    >
                      <div className="text-2xl font-bold mb-2">Box #{box.number}</div>
                      <div className="text-lg font-semibold">{box.revealedPlace}</div>
                      <div className="text-sm mt-2">
                        Your guess: <span className={isCorrect ? 'text-green-700' : 'text-red-700'}>
                          {userGuess || 'None'}
                        </span>
                      </div>
                      {box.correctGuesses !== undefined && (
                        <div className="text-xs text-gray-600 mt-1">
                          {box.correctGuesses} correct guesses
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* User Accuracy Leaderboard */}
            {results?.userAccuracy && (
              <UserAccuracyBoard users={results.userAccuracy} currentUserId={user.id} />
            )}
          </div>
        )}

        {/* Live Leaderboard (always visible) */}
        {results && (
          <div className="mt-8">
            <Leaderboard results={results.results} revealed={event.status === 'REVEALED'} />
          </div>
        )}
      </div>

      {/* Guess Modal */}
      {selectedBox !== null && (
        <GuessModal
          boxNumber={selectedBox}
          places={places}
          currentGuess={userGuesses[selectedBox]}
          onGuess={handleGuess}
          onClose={() => setSelectedBox(null)}
        />
      )}
    </div>
  );
}
