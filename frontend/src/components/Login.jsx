import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { 
  EnvelopeIcon, 
  LockClosedIcon, 
  EyeIcon, 
  EyeSlashIcon,
  ArrowRightIcon,
  SparklesIcon,
  CheckBadgeIcon,
  MapPinIcon,
  ShieldCheckIcon,
  CpuChipIcon
} from '@heroicons/react/24/outline';

function Login() {
  const { login, error, loading } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [localError, setLocalError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    
    const result = await login(formData);
    
    if (result.success) {
      const loggedInUser = result.user;
      
      if (loggedInUser?.role === 'admin') {
        navigate('/admin');
      } else if (loggedInUser?.role === 'board_official') {
        navigate('/board');
      } else {
        navigate('/student');
      }
    } else {
      setLocalError(result.error || 'Login failed');
    }
  };

  return (
    <div className={`min-h-screen w-full flex items-center justify-center p-0 lg:p-6 transition-colors duration-300 ${
      theme === 'dark' 
        ? 'bg-gray-950 text-white' 
        : 'bg-slate-100 text-slate-900'
    }`}>
      <div className={`w-full max-w-5xl min-h-[650px] grid grid-cols-1 lg:grid-cols-12 shadow-2xl overflow-hidden transition-all lg:rounded-3xl border ${
        theme === 'dark' 
          ? 'bg-gray-900/90 border-gray-800 shadow-black/60' 
          : 'bg-white border-slate-200/80 shadow-slate-300/50'
      }`}>

        <div className={`hidden lg:flex lg:col-span-5 p-10 flex-col justify-between relative overflow-hidden ${
          theme === 'dark'
            ? 'bg-gradient-to-br from-blue-950 via-gray-900 to-indigo-950 text-white'
            : 'bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 text-white'
        }`}>
          <div className="absolute inset-0 -z-10 opacity-20">
            <div className="absolute top-10 left-10 w-48 h-48 bg-cyan-400 rounded-full blur-3xl" />
            <div className="absolute bottom-10 right-10 w-48 h-48 bg-purple-500 rounded-full blur-3xl" />
          </div>

          <div>
            <Link to="/" className="inline-flex items-center gap-3 group focus:outline-none">
              <div className="flex items-center justify-center w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-lg group-hover:scale-105 transition-transform">
                <MapPinIcon className="w-7 h-7 text-white" />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xl font-black tracking-tight text-white flex items-center gap-1.5">
                  AI-ECLT 
                </span>
                <span className="text-xs text-blue-100 font-medium tracking-wide">
                  Exam Center Tracer System
                </span>
              </div>
            </Link>
          </div>
          <div >
          
            
            <h1 className="text-3xl font-black tracking-tight leading-snug">
              Welcome Back Our Platform.
            </h1>
            
            <p className="text-sm text-blue-100/80 leading-relaxed font-normal">
              Sign in to securely access your student portal, check board updates, and track exam center assignments in real-time.
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3 text-xs font-medium text-blue-50">
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                  <CheckBadgeIcon className="w-4 h-4 text-cyan-300" />
                </div>
                <span>Role-Based Access Control (RBAC)</span>
              </div>
              <div className="flex items-center gap-3 text-xs font-medium text-blue-50">
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                  <CpuChipIcon className="w-4 h-4 text-cyan-300" />
                </div>
                <span>Real-time AI Center Tracking</span>
              </div>
            </div>
          </div>
          <div className="text-xs text-blue-200/70 font-medium">
            © 2026 AI-ECLT Pro. All rights reserved.
          </div>
        </div>
        <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between">
          <div>
            <div className="lg:hidden flex items-center justify-between mb-8">
              <Link to="/" className="inline-flex items-center gap-2.5">
                <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-xl text-white shadow-md">
                  <MapPinIcon className="w-5 h-5" />
                </div>
                <span className={`text-lg font-black ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                  AI-ECLT <span className="text-blue-500 text-xs">Pro</span>
                </span>
              </Link>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                theme === 'dark' ? 'bg-gray-800 text-gray-300' : 'bg-slate-200 text-slate-700'
              }`}>
                Sign In
              </span>
            </div>

            <div className="mb-6">
              <h2 className={`text-2xl font-black tracking-tight ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                Login
              </h2>
              <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-slate-500'}`}>
                Sign in to access your dashboard & system operations
              </p>
            </div>
            {(localError || error) && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-500 dark:text-red-400 p-3 rounded-xl mb-4 text-xs font-medium flex items-center gap-2.5 animate-slide-down">
                <span className="text-base">⚠️</span>
                <span>{localError || error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className={`block mb-1.5 text-xs font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-gray-300' : 'text-slate-700'}`}>
                  Email Address
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <EnvelopeIcon className="h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition" />
                  </div>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={`w-full pl-10 pr-4 py-3 rounded-xl border text-xs font-medium outline-none transition placeholder-gray-400 ${
                      theme === 'dark' 
                        ? 'bg-gray-800/50 border-gray-700 text-white focus:border-blue-500 focus:bg-gray-800' 
                        : 'bg-slate-50/80 border-slate-200 text-slate-900 focus:border-blue-600 focus:bg-white'
                    }`}
                    required
                    autoComplete="email"
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className={`text-xs font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-gray-300' : 'text-slate-700'}`}>
                    Password
                  </label>
                  <Link 
                    to="/forgot-password"
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-bold transition"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <LockClosedIcon className="h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className={`w-full pl-10 pr-11 py-3 rounded-xl border text-xs font-medium outline-none transition placeholder-gray-400 ${
                      theme === 'dark' 
                        ? 'bg-gray-800/50 border-gray-700 text-white focus:border-blue-500 focus:bg-gray-800' 
                        : 'bg-slate-50/80 border-slate-200 text-slate-900 focus:border-blue-600 focus:bg-white'
                    }`}
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-white transition"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-4 w-4" />
                    ) : (
                      <EyeIcon className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2.5 text-xs font-medium cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className={`w-4 h-4 rounded border text-blue-600 focus:ring-blue-500 focus:ring-offset-0 ${
                      theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-slate-100 border-slate-300'
                    }`}
                  />
                  <span className={`font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-slate-600'}`}>Remember me</span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-[0.98] text-white py-3.5 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed font-bold text-xs shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 group"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <div className={`w-full border-t ${theme === 'dark' ? 'border-gray-800' : 'border-slate-200'}`}></div>
              </div>
              <div className="relative flex justify-center text-[10px]">
                <span className={`px-3 font-bold uppercase tracking-wider ${
                  theme === 'dark' ? 'bg-gray-900 text-gray-500' : 'bg-white text-slate-400'
                }`}>Or</span>
              </div>
            </div>

            {/* Register Link */}
            <p className={`text-center text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-slate-600'}`}>
              Don't have an account?{' '}
              <Link
                to="/register"
                className="text-blue-600 dark:text-blue-400 font-bold hover:underline transition"
              >
                Create one now
              </Link>
            </p>
          </div>

          <div className={`mt-6 pt-4 border-t flex items-center justify-between text-[11px] ${
            theme === 'dark' ? 'border-gray-800 text-gray-500' : 'border-slate-100 text-slate-400'
          }`}>
            <span className="flex items-center gap-1.5 font-medium">
              <ShieldCheckIcon className="w-4 h-4 text-emerald-500" />
              Secure Authentication
            </span>
            <span className="lg:hidden">© 2026 AI-ECLT Pro</span>
          </div>

        </div>

      </div>
    </div>
  );
}

export default Login;