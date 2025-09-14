import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { User, Event, ResultsPayload } from '../api';
import { gameAPI, authAPI } from '../api';
import socketManager from '../socket';
import BoxCard from '../components/BoxCard';
import ChickenModal from '../components/ChickenModal';
import TopThree from '../components/TopThree';
import Leaderboard from '../components/Leaderboard';
import UserAccuracyBoard from '../components/UserAccuracyBoard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';

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

  const userProgress = results?.userProgress.find(p => p.userId === user.id);
  const hasCompletedGuesses = Object.keys(userGuesses).length === 6;
  const hasCompletedRankings = Object.keys(userRankings).length === 3;

  // Optimistic overlay so the Taste Leaderboard reflects local selections immediately
  const displayResults = useMemo(() => {
    if (!results) return null;
    const cloned = results.results.map(r => ({
      ...r,
      rankCounts: { ...r.rankCounts },
      points: r.points,
    }));
    const byNumber = new Map(cloned.map(r => [r.number, r]));
    Object.entries(userRankings).forEach(([numStr, rank]) => {
      const num = Number(numStr);
      const r = byNumber.get(num);
      if (!r) return;
      // Increment local counts/points (3/2/1)
      r.rankCounts[rank] = (r.rankCounts[rank] || 0) + 1;
      r.points += rank === 1 ? 3 : rank === 2 ? 2 : 1;
    });
    // Sort by points desc for display
    cloned.sort((a, b) => b.points - a.points);
    return cloned;
  }, [results, userRankings]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading game...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">🍗 {event.name}</h1>
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

      <div className="flex justify-center min-h-[calc(100vh-80px)]">
        <div className="w-full max-w-5xl px-4 py-8">
          {/* Main Content */}
          {event.status === 'GUESSING' && (
            <Tabs defaultValue="rating" className="w-full">
              <div className="text-center mb-8">
                <h2 className="text-4xl font-semibold mb-2">🍗 Chikin Rater</h2>
                <p className="text-lg text-gray-600 mb-6">Hey {user.username}! Click each box to taste and rate</p>

                <div className="flex items-center justify-center">
                  <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-sm">
                    Completed: {userProgress?.guessesCompleted || 0}/6
                  </span>
                </div>

                <div className="mt-4 flex justify-center">
                  <TabsList className="grid w-full max-w-xs grid-cols-2">
                    <TabsTrigger value="rating">Rating</TabsTrigger>
                    <TabsTrigger value="results">Live Results</TabsTrigger>
                  </TabsList>
                </div>
              </div>

              <TabsContent value="rating" className="space-y-8">
                {/* Chicken Boxes Grid - 2/3 responsive centered to match mock */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                  {[1, 2, 3, 4, 5, 6].map(num => (
                    <BoxCard
                      key={num}
                      number={num}
                      guess={userGuesses[num]}
                      distribution={results?.results.find(r => r.number === num)?.guessDist}
                      onClick={() => setSelectedBox(num)}
                      disabled={false}
                      rankIcon={userRankings[num] as 1 | 2 | 3 | undefined}
                    />
                  ))}
                </div>

                {hasCompletedGuesses && (
                  <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg max-w-2xl mx-auto text-center">
                    Great! You've completed all your guesses. Wait for the ranking phase to begin.
                  </div>
                )}

                <div className="text-sm text-gray-500 text-center max-w-2xl mx-auto">
                  <p>💡 First guess the restaurant, then rank your top 3!</p>
                  <p>Green = Complete | Yellow = Guessed only | Gray = Not started</p>
                </div>
              </TabsContent>

              <TabsContent value="results">
                {results && displayResults && (
                  <Leaderboard results={displayResults} revealed={event.status === 'REVEALED'} />
                )}
              </TabsContent>
            </Tabs>
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
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
        </div>
      </div>

      {/* Chicken Modal */}
      {selectedBox !== null && (
        <ChickenModal
          boxNumber={selectedBox}
          places={places}
          currentGuess={userGuesses[selectedBox]}
          onGuess={handleGuess}
          onRankSelect={(boxNumber, rank) => setUserRankings(prev => ({ ...prev, [boxNumber]: rank }))}
          onClose={() => setSelectedBox(null)}
        />
      )}
    </div>
  );
}
