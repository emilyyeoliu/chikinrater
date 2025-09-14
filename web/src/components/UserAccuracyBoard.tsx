import type { UserAccuracy } from '../api';

interface UserAccuracyBoardProps {
  users: UserAccuracy[];
  currentUserId: string;
}

export default function UserAccuracyBoard({ users, currentUserId }: UserAccuracyBoardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-bold mb-4">
        🎯 Accuracy Leaderboard
      </h3>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2">Rank</th>
              <th className="text-left py-2">Player</th>
              <th className="text-center py-2">Correct</th>
              <th className="text-center py-2">Accuracy</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, index) => {
              const accuracy = user.total > 0 ? (user.correct / user.total * 100).toFixed(0) : 0;
              const isCurrentUser = user.username === users.find(u => u.username === currentUserId)?.username;
              
              return (
                <tr 
                  key={user.username} 
                  className={`border-b hover:bg-gray-50 ${isCurrentUser ? 'bg-orange-50' : ''}`}
                >
                  <td className="py-3">
                    {index === 0 && '🥇'}
                    {index === 1 && '🥈'}
                    {index === 2 && '🥉'}
                    {index > 2 && `${index + 1}`}
                  </td>
                  <td className="py-3 font-semibold">
                    {user.username}
                    {isCurrentUser && ' (You)'}
                  </td>
                  <td className="py-3 text-center">{user.correct}/{user.total}</td>
                  <td className="py-3 text-center font-bold">{accuracy}%</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
