import type { BoxResult } from '../api';

interface LeaderboardProps {
  results: BoxResult[];
  revealed: boolean;
}

export default function Leaderboard({ results, revealed }: LeaderboardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-bold mb-4">
        🏆 Taste Leaderboard
      </h3>

      {/* Table on md+ screens */}
      <div className="overflow-x-auto hidden md:block">
        <table className="w-full min-w-[640px]">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2">Rank</th>
              <th className="text-left py-2">Box</th>
              {revealed && <th className="text-left py-2">Brand</th>}
              <th className="text-center py-2">Points</th>
              <th className="text-center py-2">1st</th>
              <th className="text-center py-2">2nd</th>
              <th className="text-center py-2">3rd</th>
            </tr>
          </thead>
          <tbody>
            {results.map((result, index) => (
              <tr key={result.number} className="border-b hover:bg-gray-50">
                <td className="py-3">
                  {index === 0 && '🥇'}
                  {index === 1 && '🥈'}
                  {index === 2 && '🥉'}
                  {index > 2 && `${index + 1}`}
                </td>
                <td className="py-3 font-semibold">Box #{result.number}</td>
                {revealed && (
                  <td className="py-3 text-sm">{result.revealedPlace || '-'}</td>
                )}
                <td className="py-3 text-center font-bold">{result.points}</td>
                <td className="py-3 text-center text-sm">{result.rankCounts[1] || 0}</td>
                <td className="py-3 text-center text-sm">{result.rankCounts[2] || 0}</td>
                <td className="py-3 text-center text-sm">{result.rankCounts[3] || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {results.map((result, index) => (
          <div key={result.number} className="border rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div className="text-lg font-semibold">Box #{result.number}</div>
              <div className="text-xl">
                {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
              </div>
            </div>
            {revealed && (
              <div className="text-sm text-gray-600 mt-1">{result.revealedPlace || '-'}</div>
            )}
            <div className="mt-2 grid grid-cols-4 text-center text-sm">
              <div className="font-bold">{result.points}</div>
              <div>1st: {result.rankCounts[1] || 0}</div>
              <div>2nd: {result.rankCounts[2] || 0}</div>
              <div>3rd: {result.rankCounts[3] || 0}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 text-xs text-gray-600">
        Points: 1st place = 3 points, 2nd = 2 points, 3rd = 1 point
      </div>
    </div>
  );
}
