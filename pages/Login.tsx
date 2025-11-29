import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface LoginProps {
  initialIsLogin?: boolean;
}

const Login: React.FC<LoginProps> = ({ initialIsLogin = true }) => {
  const [isLogin, setIsLogin] = useState(initialIsLogin);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  
  const { login, register, isLoading } = useAuth();
  const navigate = useNavigate();

  // Sync state if user navigates via Navbar while on this page
  useEffect(() => {
    setIsLogin(initialIsLogin);
    setError('');
    setFormData(prev => ({ ...prev, password: '' }));
  }, [initialIsLogin]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!formData.username || !formData.password) {
      setError("Please fill in all required fields.");
      return;
    }
    
    if (!isLogin && !formData.email) {
      setError("Email is required for registration.");
      return;
    }

    try {
      if (isLogin) {
        await login(formData.username, formData.password);
      } else {
        await register(formData.username, formData.email, formData.password);
      }
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || "Authentication failed");
    }
  };

  const toggleMode = () => {
      const newMode = !isLogin;
      setIsLogin(newMode);
      setError('');
      // Update URL to match mode without full reload
      navigate(newMode ? '/login' : '/signup', { replace: true });
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 border border-slate-200 dark:border-slate-700">
        
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-4">
             <i className={`fa-solid ${isLogin ? 'fa-right-to-bracket' : 'fa-user-plus'} text-xl`}></i>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">
            {isLogin ? 'Enter your details to access your dashboard.' : 'Start your typing journey today.'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-lg flex items-center animate-fade-in">
            <i className="fa-solid fa-circle-exclamation mr-2"></i>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">Username</label>
            <input 
              name="username"
              type="text" 
              required
              className="w-full px-4 py-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-primary focus:border-transparent dark:text-white transition-all outline-none"
              placeholder="e.g. TurboTyper"
              value={formData.username}
              onChange={handleChange}
            />
          </div>

          {!isLogin && (
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">Email</label>
              <input 
                name="email"
                type="email" 
                required
                className="w-full px-4 py-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-primary focus:border-transparent dark:text-white transition-all outline-none"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">Password</label>
            <input 
              name="password"
              type="password" 
              required
              className="w-full px-4 py-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-primary focus:border-transparent dark:text-white transition-all outline-none"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full py-3 bg-primary hover:bg-indigo-600 text-white rounded-lg font-bold shadow-lg shadow-indigo-500/30 transition-all flex justify-center items-center mt-6"
          >
            {isLoading ? (
              <i className="fa-solid fa-circle-notch fa-spin"></i>
            ) : (
              isLogin ? 'Login' : 'Sign Up'
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
          {isLogin ? (
            <>
              Don't have an account?{' '}
              <button 
                type="button"
                onClick={toggleMode}
                className="text-primary font-bold hover:underline"
              >
                Sign Up
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button 
                type="button"
                onClick={toggleMode}
                className="text-primary font-bold hover:underline"
              >
                Login
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;