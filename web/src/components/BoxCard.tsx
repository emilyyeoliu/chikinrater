import type { GuessDistribution } from '../api';
import { Badge } from '@/components/ui/badge';

interface BoxCardProps {
  number: number;
  guess?: string;
  distribution?: GuessDistribution;
  onClick: () => void;
  disabled: boolean;
}

export default function BoxCard({ number, guess, distribution, onClick, disabled }: BoxCardProps) {
  const totalGuesses = distribution ? Object.values(distribution).reduce((a, b) => a + b, 0) : 0;
  
  const getBoxStatus = () => {
    if (!guess) return 'not-voted';
    return 'guessed';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'guessed': return 'bg-green-500';
      default: return 'bg-gray-300';
    }
  };

  const status = getBoxStatus();
  
  return (
    <div className="relative">
      <button
        onClick={onClick}
        disabled={disabled}
        className={`
          w-full bg-white border-2 border-gray-200 rounded-lg hover:border-blue-500 transition-all flex flex-col items-center justify-center p-6 group
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:shadow-lg'}
        `}
      >
        <div className="text-2xl mb-2">📦</div>
        <div className="text-xl font-bold mb-2">Box {number}</div>
        
        {guess && (
          <div className="text-sm text-gray-600 mb-2">
            {guess}
          </div>
        )}
        
        <div className="text-sm text-gray-500">
          👆 Click to rate
        </div>
      </button>
      
      {/* Status indicator */}
      <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${getStatusColor(status)} border border-white`} />
      
      {/* Distribution info */}
      {distribution && totalGuesses > 0 && (
        <div className="mt-2 space-y-1">
          <div className="text-xs text-gray-500 font-medium text-center">
            Guesses ({totalGuesses})
          </div>
          {Object.entries(distribution)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 2)
            .map(([place, count]) => (
              <div key={place} className="flex justify-between text-xs">
                <span className="text-gray-500 truncate mr-2">{place}</span>
                <span className="text-gray-500">{count}</span>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
