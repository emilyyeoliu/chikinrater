import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

interface ChickenModalProps {
  boxNumber: number;
  places: string[];
  currentGuess?: string;
  onGuess: (place: string) => void;
  onClose: () => void;
  onRankSelect?: (boxNumber: number, rank: number) => void;
}

export default function ChickenModal({ boxNumber, places, currentGuess, onGuess, onClose, onRankSelect }: ChickenModalProps) {
  const [guess, setGuess] = useState(currentGuess || '');
  const [step] = useState<'guess' | 'rank'>('guess');

  const handleSelectGuess = (value: string) => {
    setGuess(value);
    onGuess(value);
    // Do not transition to ranking step; close will be handled by parent after guess
  };

  const handleRankSubmit = (selectedRank: number) => {
    if (onRankSelect) {
      onRankSelect(boxNumber, selectedRank);
    }
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
                <label className="block mb-2 text-sm font-medium">Guess where this chicken is from:</label>
                <Select value={guess} onValueChange={handleSelectGuess}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a restaurant..." />
                  </SelectTrigger>
                  <SelectContent>
                    {places.map((place) => (
                      <SelectItem key={place} value={place}>
                        {place}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
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
                  variant="outline"
                  className="h-16 w-16 rounded-full text-sm font-semibold"
                  onClick={() => handleRankSubmit(1)}
                >
                  1st
                </Button>
                <Button
                  variant="outline"
                  className="h-16 w-16 rounded-full text-sm font-semibold"
                  onClick={() => handleRankSubmit(2)}
                >
                  2nd
                </Button>
                <Button
                  variant="outline"
                  className="h-16 w-16 rounded-full text-sm font-semibold"
                  onClick={() => handleRankSubmit(3)}
                >
                  3rd
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
