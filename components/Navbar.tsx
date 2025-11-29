import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Link, useLocation } from 'react-router-dom';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path 
    ? "text-primary dark:text-primary font-semibold" 
    : "text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-primary";

  return (
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <Link to="/" className="flex items-center gap-2">
              <i className="fa-solid fa-keyboard text-2xl text-primary"></i>
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                TypeMaster
              </span>
            </Link>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className={isActive('/')}>Home</Link>
            <Link to="/test" className={isActive('/test')}>Typing Test</Link>
            <Link to="/leaderboard" className={isActive('/leaderboard')}>Leaderboard</Link>
            {user && <Link to="/dashboard" className={isActive('/dashboard')}>Dashboard</Link>}
          </div>

          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              aria-label="Toggle Theme"
            >
              <i className={`fa-solid ${theme === 'light' ? 'fa-moon' : 'fa-sun'}`}></i>
            </button>

            {user ? (
              <div className="flex items-center gap-3">
                <div className="text-right hidden lg:block">
                  <p className="text-sm font-medium dark:text-white">{user.username}</p>
                  <p className="text-xs text-slate-500">Lvl {user.level}</p>
                </div>
                <img src={user.avatar} alt="Avatar" className="w-9 h-9 rounded-full border border-slate-200 dark:border-slate-700" />
                <button 
                  onClick={logout}
                  className="text-sm text-red-500 hover:text-red-600 font-medium"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                 <Link
                  to="/login"
                  className="px-4 py-2 text-slate-700 dark:text-slate-200 hover:text-primary dark:hover:text-primary font-medium text-sm transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 bg-primary hover:bg-indigo-600 text-white rounded-lg text-sm font-bold transition-colors shadow-lg shadow-indigo-500/20"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-slate-600 dark:text-slate-300"
            >
              <i className={`fa-solid ${isMenuOpen ? 'fa-times' : 'fa-bars'} text-xl`}></i>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 pt-2 pb-4 space-y-3">
          <Link to="/" className={`block py-2 ${isActive('/')}`} onClick={() => setIsMenuOpen(false)}>Home</Link>
          <Link to="/test" className={`block py-2 ${isActive('/test')}`} onClick={() => setIsMenuOpen(false)}>Typing Test</Link>
          <Link to="/leaderboard" className={`block py-2 ${isActive('/leaderboard')}`} onClick={() => setIsMenuOpen(false)}>Leaderboard</Link>
          {user && (
             <Link to="/dashboard" className={`block py-2 ${isActive('/dashboard')}`} onClick={() => setIsMenuOpen(false)}>Dashboard</Link>
          )}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
             <button onClick={toggleTheme} className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                <i className={`fa-solid ${theme === 'light' ? 'fa-moon' : 'fa-sun'}`}></i>
                <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
             </button>
             {user ? (
               <button onClick={logout} className="text-red-500 font-medium">Logout</button>
             ) : (
               <div className="flex gap-4">
                   <Link to="/login" className="text-slate-600 dark:text-slate-300 font-medium" onClick={() => setIsMenuOpen(false)}>Login</Link>
                   <Link to="/signup" className="text-primary font-bold" onClick={() => setIsMenuOpen(false)}>Sign Up</Link>
               </div>
             )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;