// components/Header.jsx - ✅ 100% FIXED (Mobile Par Navbar + Sidebar)
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Bars3Icon, 
  XMarkIcon, 
  UserCircleIcon,
  AcademicCapIcon,
  BuildingOfficeIcon,
  HomeIcon,
  UserGroupIcon,
  ArrowRightOnRectangleIcon,
  SunIcon,
  MoonIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

function Header({ activeSection, setActiveSection }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMobileMenuOpen(false);
  };

  const handleNavigation = (section) => {
    setActiveSection(section);
    setIsMobileMenuOpen(false);
  };

  return (
    <header className={`sticky top-0 z-50 backdrop-blur-xl border-b shadow-sm transition-colors duration-300 ${
      theme === 'dark' ? 'bg-gray-900/80 border-gray-800' : 'bg-slate-50/80 border-slate-200/50'
    }`}>
      <nav className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-4">
          {/* ==================== LOGO ==================== */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="p-2 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-xl shadow-lg shadow-blue-500/25 transition group-hover:scale-105">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className={`text-xl font-bold transition ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>AI-ECLT</span>
              <span className={`text-[10px] -mt-1 tracking-wider ${theme === 'dark' ? 'text-gray-400' : 'text-slate-500'}`}>Exam Management</span>
            </div>
          </Link>

          {/* ==================== DESKTOP NAVIGATION ==================== */}
          <div className="hidden md:flex items-center gap-1 bg-white/60 dark:bg-gray-800/60 backdrop-blur-md rounded-full px-2 py-1.5 border border-slate-200/60 dark:border-gray-700/60 shadow-sm">
            <Link to="/" className={`px-4 py-2 rounded-full text-sm font-medium transition ${activeSection === 'home' ? (theme === 'dark' ? 'bg-blue-500 text-white' : 'bg-slate-800 text-white') : (theme === 'dark' ? 'text-gray-300 hover:text-white hover:bg-gray-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100')}`}>
              Home
            </Link>
            <Link to="/about" className={`px-4 py-2 rounded-full text-sm font-medium transition ${activeSection === 'about' ? (theme === 'dark' ? 'bg-blue-500 text-white' : 'bg-slate-800 text-white') : (theme === 'dark' ? 'text-gray-300 hover:text-white hover:bg-gray-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100')}`}>
              About
            </Link>
            <Link to="/features" className={`px-4 py-2 rounded-full text-sm font-medium transition ${activeSection === 'features' ? (theme === 'dark' ? 'bg-blue-500 text-white' : 'bg-slate-800 text-white') : (theme === 'dark' ? 'text-gray-300 hover:text-white hover:bg-gray-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100')}`}>
              Features
            </Link>
            <Link to="/contact" className={`px-4 py-2 rounded-full text-sm font-medium transition ${activeSection === 'contact' ? (theme === 'dark' ? 'bg-blue-500 text-white' : 'bg-slate-800 text-white') : (theme === 'dark' ? 'text-gray-300 hover:text-white hover:bg-gray-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100')}`}>
              Contact
            </Link>
          </div>

          {/* ==================== AUTH + THEME TOGGLE ==================== */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-full transition ${theme === 'dark' ? 'bg-gray-700 text-yellow-400 hover:bg-gray-600' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
            </button>
            {!user ? (
              <>
                <Link to="/login" className={`text-sm font-medium transition ${theme === 'dark' ? 'text-gray-300 hover:text-white' : 'text-slate-600 hover:text-slate-900'}`}>Login</Link>
                <Link to="/register" className="px-5 py-2.5 bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-700 text-white rounded-full text-sm font-medium transition shadow-lg shadow-slate-900/20 dark:shadow-blue-600/20">Register</Link>
              </>
            ) : (
              <>
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition ${theme === 'dark' ? 'bg-gray-800/60 border-gray-700' : 'bg-white/60 border-slate-200/60'}`}>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 flex items-center justify-center text-white font-bold text-sm">{user.name?.charAt(0)?.toUpperCase() || 'U'}</div>
                  <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-slate-700'}`}>{user.name}</span>
                  <span className={`text-xs capitalize ${theme === 'dark' ? 'text-gray-400' : 'text-slate-500'}`}>{user.role?.replace('_', ' ')}</span>
                </div>
                <button onClick={handleLogout} className={`text-sm font-medium transition ${theme === 'dark' ? 'text-red-400 hover:text-red-300' : 'text-red-500 hover:text-red-600'}`}>Logout</button>
              </>
            )}
          </div>

          {/* ==================== MOBILE MENU BUTTON + THEME TOGGLE ==================== */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-full transition ${theme === 'dark' ? 'bg-gray-700 text-yellow-400' : 'bg-slate-100 text-slate-600'}`}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`p-2 rounded-lg transition ${theme === 'dark' ? 'text-gray-400 hover:text-white hover:bg-gray-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </nav>

      {/* ==================== MOBILE OFF-CANVAS SIDEBAR ==================== */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}></div>
          <aside className={`absolute left-0 top-0 bottom-0 w-72 flex flex-col animate-slide-in ${theme === 'dark' ? 'bg-gray-900 border-r border-gray-800' : 'bg-white border-r border-slate-200'}`}>
            <div className={`p-4 border-b flex items-center justify-between ${theme === 'dark' ? 'border-gray-800' : 'border-slate-100'}`}>
              <div className="flex items-center gap-2">
                <div className="p-2 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-xl">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <span className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>AI-ECLT</span>
              </div>
              <button onClick={() => setIsMobileMenuOpen(false)} className={`p-1 transition ${theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-slate-500 hover:text-slate-800'}`}>
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <nav className={`flex-1 p-4 space-y-1 overflow-y-auto ${theme === 'dark' ? 'text-gray-300' : 'text-slate-600'}`}>
              <Link to="/" className="flex items-center gap-3 px-4 py-3 rounded-xl transition hover:bg-slate-50 dark:hover:bg-gray-800" onClick={() => setIsMobileMenuOpen(false)}>
                <HomeIcon className="w-5 h-5" />
                <span className="text-sm font-medium">Home</span>
              </Link>
              <Link to="/about" className="flex items-center gap-3 px-4 py-3 rounded-xl transition hover:bg-slate-50 dark:hover:bg-gray-800" onClick={() => setIsMobileMenuOpen(false)}>
                <BuildingOfficeIcon className="w-5 h-5" />
                <span className="text-sm font-medium">About</span>
              </Link>
              <Link to="/features" className="flex items-center gap-3 px-4 py-3 rounded-xl transition hover:bg-slate-50 dark:hover:bg-gray-800" onClick={() => setIsMobileMenuOpen(false)}>
                <AcademicCapIcon className="w-5 h-5" />
                <span className="text-sm font-medium">Features</span>
              </Link>
              <Link to="/contact" className="flex items-center gap-3 px-4 py-3 rounded-xl transition hover:bg-slate-50 dark:hover:bg-gray-800" onClick={() => setIsMobileMenuOpen(false)}>
                <UserGroupIcon className="w-5 h-5" />
                <span className="text-sm font-medium">Contact</span>
              </Link>

              {!user ? (
                <div className={`border-t mt-4 pt-4 space-y-2 ${theme === 'dark' ? 'border-gray-800' : 'border-slate-100'}`}>
                  <Link to="/login" className="flex items-center gap-3 px-4 py-3 rounded-xl transition hover:bg-slate-50 dark:hover:bg-gray-800" onClick={() => setIsMobileMenuOpen(false)}>
                    <UserCircleIcon className="w-5 h-5" />
                    <span className="text-sm font-medium">Login</span>
                  </Link>
                  <Link to="/register" className="block px-4 py-3 bg-slate-900 dark:bg-blue-600 text-white rounded-xl transition text-sm font-medium text-center" onClick={() => setIsMobileMenuOpen(false)}>
                    Register
                  </Link>
                </div>
              ) : (
                <div className={`border-t mt-4 pt-4 ${theme === 'dark' ? 'border-gray-800' : 'border-slate-100'}`}>
                  <div className="flex items-center gap-3 px-4 py-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 flex items-center justify-center text-white font-bold text-sm">
                      {user.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>{user.name}</p>
                      <p className={`text-xs capitalize ${theme === 'dark' ? 'text-gray-400' : 'text-slate-500'}`}>{user.role?.replace('_', ' ')}</p>
                    </div>
                  </div>
                  <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 transition">
                    <ArrowRightOnRectangleIcon className="w-5 h-5" />
                    <span className="text-sm font-medium">Logout</span>
                  </button>
                </div>
              )}
            </nav>
          </aside>
        </div>
      )}
    </header>
  );
}

export default Header;