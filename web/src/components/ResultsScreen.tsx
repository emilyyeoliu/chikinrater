// React import not required with automatic JSX runtime
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface ResultsScreenProps {
  username?: string;
  userVotes: Record<number, { guess: string; ranking?: number }>;
  onBackToVoting: () => void;
}

// Mock data for live polling results
const mockResults = {
  totalVotes: 12,
  guesses: {
    1: { 'Popeyes': 3, 'KFC': 2, 'Jollibee': 4, 'The Bird': 1, 'Starbird': 2 },
    2: { 'Popeyes': 1, 'KFC': 5, 'Jollibee': 2, 'The Bird': 2, 'Starbird': 2 },
    3: { 'Popeyes': 2, 'KFC': 1, 'Jollibee': 1, 'The Bird': 6, 'Starbird': 2 },
    4: { 'Popeyes': 4, 'KFC': 3, 'Jollibee': 1, 'The Bird': 2, 'Starbird': 2 },
    5: { 'Popeyes': 1, 'KFC': 2, 'Jollibee': 3, 'The Bird': 1, 'Starbird': 5 },
    6: { 'Popeyes': 5, 'KFC': 1, 'Jollibee': 3, 'The Bird': 1, 'Starbird': 2 }
  },
  rankings: {
    1: { first: 4, second: 3, third: 2 },
    2: { first: 2, second: 4, third: 3 },
    3: { first: 3, second: 2, third: 4 },
    4: { first: 1, second: 3, third: 5 },
    5: { first: 5, second: 2, third: 1 },
    6: { first: 2, second: 3, third: 2 }
  }
};

export function ResultsScreen({ userVotes, onBackToVoting }: ResultsScreenProps) {
  const getTopGuess = (boxNumber: number) => {
    const guesses = mockResults.guesses[boxNumber as keyof typeof mockResults.guesses];
    return Object.entries(guesses).reduce((a, b) => guesses[a[0] as keyof typeof guesses] > guesses[b[0] as keyof typeof guesses] ? a : b);
  };

  const getTotalRankingScore = (boxNumber: number) => {
    const rankings = mockResults.rankings[boxNumber as keyof typeof mockResults.rankings];
    return rankings.first * 3 + rankings.second * 2 + rankings.third * 1;
  };

  const sortedBoxes = [1, 2, 3, 4, 5, 6].sort((a, b) => getTotalRankingScore(b) - getTotalRankingScore(a));

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl mb-2">📊 Live Results</h1>
          <p className="text-lg text-gray-600">
            Real-time polling from {mockResults.totalVotes} participants
          </p>
          <Button onClick={onBackToVoting} variant="outline" className="mt-4">
            ← Back to Voting
          </Button>
        </div>

        {/* Overall Ranking */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>🏆 Overall Chicken Rankings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sortedBoxes.map((boxNumber, index) => {
                const score = getTotalRankingScore(boxNumber);
                const maxScore = mockResults.totalVotes * 3;
                const percentage = (score / maxScore) * 100;
                
                return (
                  <div key={boxNumber} className="flex items-center gap-4">
                    <div className="text-2xl">
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-medium">Box {boxNumber}</span>
                        <span className="text-sm text-gray-600">{score} points</span>
                      </div>
                      <Progress value={percentage} className="h-2" />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Detailed Results */}
        <div className="grid md:grid-cols-2 gap-6">
          {[1, 2, 3, 4, 5, 6].map((boxNumber) => {
            const userGuess = userVotes[boxNumber]?.guess;
            const userRanking = userVotes[boxNumber]?.ranking;
            const topGuess = getTopGuess(boxNumber);
            const rankings = mockResults.rankings[boxNumber as keyof typeof mockResults.rankings];
            
            return (
              <Card key={boxNumber}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>📦 Box {boxNumber}</span>
                    {userGuess && (
                      <Badge variant={userGuess === topGuess[0] ? "default" : "secondary"}>
                        Your guess: {userGuess}
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Popular Guesses:</h4>
                    <div className="space-y-1">
                      {Object.entries(mockResults.guesses[boxNumber as keyof typeof mockResults.guesses])
                        .sort(([,a], [,b]) => b - a)
                        .slice(0, 3)
                        .map(([restaurant, votes]) => (
                          <div key={restaurant} className="flex justify-between text-sm">
                            <span>{restaurant}</span>
                            <span>{votes} votes</span>
                          </div>
                        ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Rankings:</h4>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div className="text-center">
                        <div>🥇 {rankings.first}</div>
                        <div className="text-xs text-gray-600">1st place</div>
                      </div>
                      <div className="text-center">
                        <div>🥈 {rankings.second}</div>
                        <div className="text-xs text-gray-600">2nd place</div>
                      </div>
                      <div className="text-center">
                        <div>🥉 {rankings.third}</div>
                        <div className="text-xs text-gray-600">3rd place</div>
                      </div>
                    </div>
                  </div>
                  
                  {userRanking && (
                    <Badge variant="outline" className="w-full justify-center">
                      You ranked this #{userRanking}
                    </Badge>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-8 text-center text-sm text-gray-600">
          <p>🔄 Results update in real-time as people vote!</p>
        </div>
      </div>
    </div>
  );
}
