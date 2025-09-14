import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';

interface ChickenModalProps {
  boxNumber: number;
  currentVote?: { guess: string; ranking?: number };
  onClose: () => void;
  onSubmit: (boxNumber: number, guess: string, ranking?: number) => void;
}

const restaurants = [
  'Popeyes',
  'Jollibee', 
  'The Bird',
  'Proposition Chicken',
  'KFC',
  'Starbird'
];

export function ChickenModal({ boxNumber, currentVote, onClose, onSubmit }: ChickenModalProps) {
  const [guess, setGuess] = useState(currentVote?.guess || '');
  const [ranking, setRanking] = useState<number | undefined>(currentVote?.ranking);
  const [step, setStep] = useState<'guess' | 'rank'>(currentVote?.guess ? 'rank' : 'guess');

  const handleGuessSubmit = () => {
    if (guess) {
      onSubmit(boxNumber, guess);
      setStep('rank');
    }
  };

  const handleRankSubmit = (selectedRank: number) => {
    setRanking(selectedRank);
    onSubmit(boxNumber, guess, selectedRank);
    onClose();
  };

  const handleSkipRanking = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md max-h-[80vh] overflow-y-auto">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>📦 Box {boxNumber}</span>
            <Button variant="ghost" size="sm" onClick={onClose}>✕</Button>
          </CardTitle>
          <CardDescription>
            {step === 'guess' ? 'First, guess which restaurant this is from' : 'Now rank this chicken in your top 3!'}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {step === 'guess' ? (
            <div className="space-y-4">
              <div>
                <label className="block mb-2">Guess where this chicken is from:</label>
                <Select value={guess} onValueChange={setGuess}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a restaurant..." />
                  </SelectTrigger>
                  <SelectContent>
                    {restaurants.map((restaurant) => (
                      <SelectItem key={restaurant} value={restaurant}>
                        {restaurant}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <Button 
                onClick={handleGuessSubmit} 
                className="w-full"
                disabled={!guess}
              >
                Submit Guess & Continue to Ranking
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-center">
                <Badge variant="outline" className="mb-4">
                  Your guess: {guess}
                </Badge>
                <p>How would you rank this chicken in your top 3?</p>
              </div>
              
              <div className="grid grid-cols-3 gap-3">
                <Button
                  variant={ranking === 1 ? "default" : "outline"}
                  className="aspect-square text-lg"
                  onClick={() => handleRankSubmit(1)}
                >
                  🥇<br/>1st Place
                </Button>
                <Button
                  variant={ranking === 2 ? "default" : "outline"}
                  className="aspect-square text-lg"
                  onClick={() => handleRankSubmit(2)}
                >
                  🥈<br/>2nd Place
                </Button>
                <Button
                  variant={ranking === 3 ? "default" : "outline"}
                  className="aspect-square text-lg"
                  onClick={() => handleRankSubmit(3)}
                >
                  🥉<br/>3rd Place
                </Button>
              </div>
              
              <div className="text-center pt-4">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={handleSkipRanking}
                >
                  Skip ranking for now
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}