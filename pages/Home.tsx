import React from 'react';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300 dark:bg-purple-900 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
      <div className="absolute top-20 right-10 w-72 h-72 bg-indigo-300 dark:bg-indigo-900 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
      
      <div className="max-w-4xl text-center z-10">
        <div className="inline-block mb-6 px-4 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-sm font-semibold tracking-wide border border-indigo-100 dark:border-indigo-800">
          ✨ New: AI-Powered Typing Tests
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 dark:text-white mb-6 leading-tight">
          Master Your <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">Typing Speed</span>
        </h1>
        <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 mb-10 max-w-2xl mx-auto">
          Improve your WPM, track your progress, compete on the global leaderboard, and earn professional certificates.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            to="/test" 
            className="px-10 py-4 bg-primary hover:bg-indigo-600 text-white rounded-xl font-bold text-lg shadow-xl shadow-indigo-500/30 transition-all transform hover:-translate-y-1"
          >
            Start Typing Test
          </Link>
        </div>

        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-8">
          <div className="p-6 bg-white/50 dark:bg-slate-800/50 backdrop-blur rounded-2xl border border-white/20 dark:border-slate-700/30">
            <div className="text-3xl mb-3">🚀</div>
            <h3 className="font-bold text-lg dark:text-white mb-2">Fast & Responsive</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm">Experience lag-free typing with instant feedback and accurate WPM calculation.</p>
          </div>
          <div className="p-6 bg-white/50 dark:bg-slate-800/50 backdrop-blur rounded-2xl border border-white/20 dark:border-slate-700/30">
            <div className="text-3xl mb-3">🏆</div>
            <h3 className="font-bold text-lg dark:text-white mb-2">Compete Globally</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm">Climb the leaderboard ranks and show off your typing prowess to the world.</p>
          </div>
          <div className="p-6 bg-white/50 dark:bg-slate-800/50 backdrop-blur rounded-2xl border border-white/20 dark:border-slate-700/30">
            <div className="text-3xl mb-3">📜</div>
            <h3 className="font-bold text-lg dark:text-white mb-2">Earn Certificates</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm">Unlock verifiable certificates as you reach new speed and consistency milestones.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;