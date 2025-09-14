import type { GuessDistribution } from '../api';

interface BoxCardProps {
  number: number;
  guess?: string;
  distribution?: GuessDistribution;
  onClick: () => void;
  disabled: boolean;
  rankIcon?: 1 | 2 | 3;
}

export default function BoxCard({ number, guess, distribution, onClick, disabled, rankIcon }: BoxCardProps) {
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
      </button>
      
      {/* Rank badge (top-right) */}
      {rankIcon ? (
        <div
          className={`absolute -top-2 -right-2 h-7 w-7 rounded-full text-[10px] font-bold flex items-center justify-center shadow
            ${rankIcon === 1 ? 'bg-yellow-400 text-black' : rankIcon === 2 ? 'bg-gray-300 text-black' : 'bg-amber-700 text-white'}`}
          title={rankIcon === 1 ? '1st' : rankIcon === 2 ? '2nd' : '3rd'}
        >
          {rankIcon === 1 ? '1st' : rankIcon === 2 ? '2nd' : '3rd'}
        </div>
      ) : (
        <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${getStatusColor(status)} border border-white`} />
      )}
      
      {/* Distribution info removed per UI spec */}
    </div>
  );
}
