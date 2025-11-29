import React, { useEffect, useState } from 'react';
import { mockDb } from '../services/mockBackend';
import { LeaderboardEntry } from '../types';

const Leaderboard: React.FC = () => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const data = await mockDb.getLeaderboard();
        setEntries(data);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Global Leaderboard</h1>
        <p className="text-slate-500 dark:text-slate-400">See who has the fastest fingers in the world.</p>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-slate-500">Loading rankings...</div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-slate-100 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Rank</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">User</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase text-right">WPM</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase text-right">Level</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase text-right">XP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {entries.map((entry, index) => (
                <tr key={entry.userId} className={`hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors ${index < 3 ? 'bg-indigo-50/30 dark:bg-indigo-900/10' : ''}`}>
                  <td className="px-6 py-4">
                    {index === 0 && <span className="text-2xl mr-2">🥇</span>}
                    {index === 1 && <span className="text-2xl mr-2">🥈</span>}
                    {index === 2 && <span className="text-2xl mr-2">🥉</span>}
                    <span className={`font-mono font-bold ${index < 3 ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500'}`}>#{index + 1}</span>
                  </td>
                  <td className="px-6 py-4 flex items-center gap-3">
                    <img src={entry.avatar} alt="" className="w-8 h-8 rounded-full bg-slate-200" />
                    <span className="font-semibold text-slate-900 dark:text-slate-200">{entry.username}</span>
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-lg text-primary">{entry.wpm}</td>
                  <td className="px-6 py-4 text-right text-slate-600 dark:text-slate-400">{entry.level}</td>
                  <td className="px-6 py-4 text-right text-slate-500 text-sm">{entry.xp.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;