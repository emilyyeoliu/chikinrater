interface GuessModalProps {
  boxNumber: number;
  places: string[];
  currentGuess?: string;
  onGuess: (place: string) => void;
  onClose: () => void;
}

export default function GuessModal({ boxNumber, places, currentGuess, onGuess, onClose }: GuessModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <h3 className="text-xl font-bold mb-4">
          Guess the brand for Box #{boxNumber}
        </h3>
        
        {currentGuess && (
          <div className="mb-4 p-3 bg-orange-50 rounded-lg text-sm">
            Current guess: <span className="font-semibold">{currentGuess}</span>
          </div>
        )}
        
        <div className="grid grid-cols-2 gap-3">
          {places.map(place => (
            <button
              key={place}
              onClick={() => onGuess(place)}
              className={`
                p-3 rounded-lg border-2 font-medium transition-all
                ${currentGuess === place
                  ? 'bg-orange-500 text-white border-orange-500'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-orange-400 hover:bg-orange-50'
                }
              `}
            >
              {place}
            </button>
          ))}
        </div>
        
        <button
          onClick={onClose}
          className="mt-6 w-full py-2 text-gray-600 hover:text-gray-800 underline"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
