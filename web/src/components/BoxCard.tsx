import type { GuessDistribution } from '../api';

interface BoxCardProps {
  number: number;
  guess?: string;
  distribution?: GuessDistribution;
  onClick: () => void;
  disabled: boolean;
}

export default function BoxCard({ number, guess, distribution, onClick, disabled }: BoxCardProps) {
  const totalGuesses = distribution ? Object.values(distribution).reduce((a, b) => a + b, 0) : 0;
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        relative p-6 rounded-lg border-2 transition-all
        ${guess 
          ? 'bg-orange-50 border-orange-300 hover:border-orange-400' 
          : 'bg-white border-gray-300 hover:border-gray-400'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:shadow-lg'}
      `}
    >
      <div className="text-3xl font-bold mb-2">#{number}</div>
      
      {guess && (
        <div className="text-sm font-medium text-orange-700 mb-2">
          Your guess: {guess}
        </div>
      )}
      
      {distribution && totalGuesses > 0 && (
        <div className="mt-3 space-y-1">
          <div className="text-xs text-gray-600 font-medium mb-1">
            Guesses ({totalGuesses})
          </div>
          {Object.entries(distribution)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 3)
            .map(([place, count]) => (
              <div key={place} className="flex justify-between text-xs">
                <span className="text-gray-700 truncate mr-2">{place}</span>
                <span className="text-gray-600">{count}</span>
              </div>
            ))}
        </div>
      )}
      
      {!guess && (
        <div className="text-sm text-gray-500 mt-2">
          Click to guess
        </div>
      )}
    </button>
  );
}
