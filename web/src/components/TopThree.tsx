import { useState } from 'react';

interface TopThreeProps {
  onSubmit: (rankings: { first: number; second: number; third: number }) => void;
}

export default function TopThree({ onSubmit }: TopThreeProps) {
  const [first, setFirst] = useState<number | ''>('');
  const [second, setSecond] = useState<number | ''>('');
  const [third, setThird] = useState<number | ''>('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate selections
    if (!first || !second || !third) {
      setError('Please select all three rankings');
      return;
    }

    const selections = [first, second, third];
    if (new Set(selections).size !== 3) {
      setError('Please select three different boxes');
      return;
    }

    onSubmit({
      first: Number(first),
      second: Number(second),
      third: Number(third),
    });
  };

  const availableBoxes = [1, 2, 3, 4, 5, 6];

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 max-w-md mx-auto">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            🥇 1st Place (Best Taste)
          </label>
          <select
            value={first}
            onChange={(e) => setFirst(e.target.value ? Number(e.target.value) : '')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="">Select a box</option>
            {availableBoxes.map(num => (
              <option 
                key={num} 
                value={num}
                disabled={num === second || num === third}
              >
                Box #{num}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            🥈 2nd Place
          </label>
          <select
            value={second}
            onChange={(e) => setSecond(e.target.value ? Number(e.target.value) : '')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="">Select a box</option>
            {availableBoxes.map(num => (
              <option 
                key={num} 
                value={num}
                disabled={num === first || num === third}
              >
                Box #{num}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            🥉 3rd Place
          </label>
          <select
            value={third}
            onChange={(e) => setThird(e.target.value ? Number(e.target.value) : '')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="">Select a box</option>
            {availableBoxes.map(num => (
              <option 
                key={num} 
                value={num}
                disabled={num === first || num === second}
              >
                Box #{num}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <button
        type="submit"
        className="mt-6 w-full bg-orange-500 text-white font-semibold py-3 rounded-lg hover:bg-orange-600 transition-colors"
      >
        Submit Rankings
      </button>
    </form>
  );
}
