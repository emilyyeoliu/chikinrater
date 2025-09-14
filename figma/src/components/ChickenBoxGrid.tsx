import React, { useState } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ChickenModal } from './ChickenModal';

interface ChickenBoxGridProps {
  username: string;
  userVotes: Record<number, { guess: string; ranking?: number }>;
  onVoteSubmit: (boxNumber: number, guess: string, ranking?: number) => void;
  onViewResults: () => void;
}

export function ChickenBoxGrid({ username, userVotes, onVoteSubmit, onViewResults }: ChickenBoxGridProps) {
  const [selectedBox, setSelectedBox] = useState<number | null>(null);

  const boxes = [1, 2, 3, 4, 5, 6];

  const handleBoxClick = (boxNumber: number) => {
    setSelectedBox(boxNumber);
  };

  const handleModalClose = () => {
    setSelectedBox(null);
  };

  const getBoxStatus = (boxNumber: number) => {
    const vote = userVotes[boxNumber];
    if (!vote) return 'not-voted';
    if (vote.guess && vote.ranking) return 'complete';
    if (vote.guess) return 'guessed';
    return 'not-voted';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'complete': return 'bg-green-500';
      case 'guessed': return 'bg-yellow-500';
      default: return 'bg-gray-300';
    }
  };

  const completedVotes = Object.values(userVotes).filter(vote => vote.guess && vote.ranking).length;

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl mb-2">🍗 Chikin Rater</h1>
          <p className="text-lg text-muted-foreground">Hey {username}! Click each box to taste and rate</p>
          <div className="mt-4 flex justify-center gap-4">
            <Badge variant="outline">
              Completed: {completedVotes}/6
            </Badge>
            <Button 
              onClick={onViewResults}
              variant="secondary"
              size="sm"
            >
              View Live Results 📊
            </Button>
          </div>
        </div>

        {/* Chicken Boxes Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
          {boxes.map((boxNumber) => {
            const status = getBoxStatus(boxNumber);
            const vote = userVotes[boxNumber];
            
            return (
              <div key={boxNumber} className="relative">
                <button
                  onClick={() => handleBoxClick(boxNumber)}
                  className="w-full aspect-square bg-card border-2 border-border rounded-lg hover:border-primary transition-colors flex flex-col items-center justify-center p-4 group"
                >
                  <div className="text-4xl mb-2">📦</div>
                  <div className="text-2xl mb-2">Box {boxNumber}</div>
                  
                  {vote?.guess && (
                    <div className="text-sm text-muted-foreground text-center">
                      <div>Guess: {vote.guess}</div>
                      {vote.ranking && <div>Rank: #{vote.ranking}</div>}
                    </div>
                  )}
                  
                  <div className="group-hover:scale-110 transition-transform mt-2">
                    👆 Click to rate
                  </div>
                </button>
                
                {/* Status indicator */}
                <div className={`absolute -top-2 -right-2 w-4 h-4 rounded-full ${getStatusColor(status)} border-2 border-white`} />
              </div>
            );
          })}
        </div>

        {/* Instructions */}
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>🥇 First guess the restaurant, then rank your top 3!</p>
          <p>Green = Complete | Yellow = Guessed only | Gray = Not started</p>
        </div>
      </div>

      {/* Modal */}
      {selectedBox && (
        <ChickenModal
          boxNumber={selectedBox}
          currentVote={userVotes[selectedBox]}
          onClose={handleModalClose}
          onSubmit={onVoteSubmit}
        />
      )}
    </div>
  );
}