import React, { useState } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Leaderboard from './pages/Leaderboard';
import Login from './pages/Login';
import TypingTest from './components/TypingTest';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { TestResult } from './types';

// Wrapper for Typing Page to handle modal state locally
const TypingPage: React.FC = () => {
  const [lastResult, setLastResult] = useState<TestResult | null>(null);

  const handleComplete = (result: TestResult) => {
    setLastResult(result);
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col items-center pt-10">
       <h2 className="text-2xl font-bold mb-6 text-slate-800 dark:text-white">Speed Test</h2>
       <TypingTest onComplete={handleComplete} />
       
       {/* Result Modal Overlay */}
       {lastResult && (
         <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-2xl max-w-md w-full animate-bounce-in">
              <div className="text-center mb-6">
                <i className="fa-solid fa-crown text-5xl text-yellow-400 mb-4"></i>
                <h3 className="text-3xl font-bold text-slate-900 dark:text-white">Test Complete!</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                 <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl text-center">
                    <p className="text-slate-500 text-xs uppercase">Speed</p>
                    <p className="text-3xl font-bold text-primary">{lastResult.wpm} <span className="text-sm text-slate-400 font-normal">WPM</span></p>
                 </div>
                 <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl text-center">
                    <p className="text-slate-500 text-xs uppercase">Accuracy</p>
                    <p className="text-3xl font-bold text-secondary">{lastResult.accuracy}%</p>
                 </div>
              </div>
              
              <div className="text-center mb-8">
                <p className="text-slate-600 dark:text-slate-300">
                  You earned <strong className="text-purple-500">+{lastResult.xpEarned} XP</strong>
                </p>
              </div>

              <div className="flex gap-4">
                 <button 
                   onClick={() => setLastResult(null)} 
                   className="flex-1 py-3 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-white rounded-lg font-medium hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                 >
                   Try Again
                 </button>
                 <button 
                    onClick={() => { setLastResult(null); window.location.hash = "#/dashboard"; }}
                    className="flex-1 py-3 bg-primary text-white rounded-lg font-medium hover:bg-indigo-600 transition-colors"
                 >
                   Dashboard
                 </button>
              </div>
            </div>
         </div>
       )}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <HashRouter>
          <div className="min-h-screen bg-gray-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-colors duration-200">
            <Navbar />
            <main>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/test" element={<TypingPage />} />
                <Route path="/leaderboard" element={<Leaderboard />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/login" element={<Login initialIsLogin={true} />} />
                <Route path="/signup" element={<Login initialIsLogin={false} />} />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </main>
          </div>
        </HashRouter>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;