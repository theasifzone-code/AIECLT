import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

import {
  Bars3Icon,
  XMarkIcon,
  HomeIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  ArrowRightOnRectangleIcon,
  SunIcon,
  MoonIcon,
  MapPinIcon,
  SparklesIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';

import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function Header() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15);
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
    navigate('/', { replace: true });
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const navItems = [
    {
      name: 'Home',
      path: '/',
      icon: HomeIcon,
    },
    {
      name: 'About',
      path: '/about',
      icon: BuildingOfficeIcon,
    },
    {
      name: 'Features',
      path: '/features',
      icon: SparklesIcon,
    },
    {
      name: 'Contact',
      path: '/contact',
      icon: UserGroupIcon,
    },
  ];

  return (
    <>
      {/* HEADER */}
      <header
        className={`
          sticky top-0 z-50
          transition-all duration-300
          ${
            scrolled
              ? theme === 'dark'
                ? 'bg-gray-950/90 backdrop-blur-xl border-b border-white/10 shadow-2xl'
                : 'bg-white/90 backdrop-blur-xl border-b border-slate-200/80 shadow-lg'
              : theme === 'dark'
              ? 'bg-gray-950/70 backdrop-blur-md border-b border-white/5'
              : 'bg-white/80 backdrop-blur-md border-b border-slate-100'
          }
        `}
      >
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-[72px] sm:h-20 flex items-center justify-between gap-4">
            <Link
              to="/"
              className="group flex items-center gap-2.5 sm:gap-3 shrink-0"
            >
              <div
                className="
                  relative
                  w-10 h-10 sm:w-11 sm:h-11
                  rounded-xl sm:rounded-2xl
                  flex items-center justify-center
                  bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600
                  shadow-lg shadow-blue-600/20
                  group-hover:scale-105
                  group-hover:shadow-blue-600/30
                  transition-all duration-300
                "
              >
                <MapPinIcon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                <span
                  className="
                    absolute -right-1 -bottom-1
                    w-3.5 h-3.5
                    rounded-full
                    bg-cyan-400
                    border-2
                    border-white dark:border-gray-950
                  "
                />
              </div>
              <div className="hidden xs:flex flex-col leading-none">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`
                      text-base sm:text-lg
                      font-black
                      tracking-tight
                      ${
                        theme === 'dark'
                          ? 'text-white'
                          : 'text-slate-900'
                      }
                    `}
                  >
                    AI-ECLT
                  </span>

                  <span
                    className="
                      hidden sm:inline-flex
                      px-1.5 py-0.5
                      rounded-md
                      bg-blue-500/10
                      text-blue-500
                      text-[8px]
                      font-bold
                      uppercase
                      tracking-wider
                    "
                  >
                    AI
                  </span>
                </div>

                <span
                  className={`
                    text-[9px] sm:text-[10px]
                    font-medium
                    tracking-wide
                    mt-1
                    ${
                      theme === 'dark'
                        ? 'text-gray-400'
                        : 'text-slate-500'
                    }
                  `}
                >
                  Exam Center Tracer
                </span>
              </div>
            </Link>
            <div
              className={`
                hidden md:flex
                items-center
                gap-1
                p-1
                rounded-2xl
                border
                ${
                  theme === 'dark'
                    ? 'bg-white/[0.04] border-white/10'
                    : 'bg-slate-50 border-slate-200/80'
                }
              `}
            >
              {navItems.map((item) => {
                const active = isActive(item.path);

                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`
                      relative
                      px-4 lg:px-5
                      py-2.5
                      rounded-xl
                      text-xs lg:text-sm
                      font-semibold
                      transition-all duration-200
                      ${
                        active
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                          : theme === 'dark'
                          ? 'text-gray-400 hover:text-white hover:bg-white/5'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-white hover:shadow-sm'
                      }
                    `}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </div>
            <div className="hidden md:flex items-center gap-2.5">
              <button
                onClick={toggleTheme}
                aria-label="Toggle theme"
                className={`
                  relative
                  w-10 h-10
                  flex items-center justify-center
                  rounded-xl
                  border
                  transition-all duration-200
                  hover:scale-105
                  active:scale-95
                  ${
                    theme === 'dark'
                      ? 'bg-white/5 border-white/10 text-yellow-400 hover:bg-white/10'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }
                `}
              >
                {theme === 'dark' ? (
                  <SunIcon className="w-5 h-5" />
                ) : (
                  <MoonIcon className="w-5 h-5" />
                )}
              </button>
              {!user ? (
                <div className="flex items-center gap-2">
                  <Link
                    to="/login"
                    className={`
                      px-4 py-2.5
                      rounded-xl
                      text-xs lg:text-sm
                      font-semibold
                      border
                      transition-all duration-200
                      ${
                        theme === 'dark'
                          ? 'border-white/10 text-gray-300 hover:text-white hover:bg-white/5'
                          : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                      }
                    `}
                  >
                    Login
                  </Link>

                  <Link
                    to="/register"
                    className="
                      px-4 lg:px-5 py-2.5
                      rounded-xl
                      bg-blue-600
                      hover:bg-blue-700
                      text-white
                      text-xs lg:text-sm
                      font-semibold
                      shadow-lg shadow-blue-600/20
                      hover:shadow-blue-600/30
                      transition-all duration-200
                      active:scale-95
                    "
                  >
                    Get Started
                  </Link>
                </div>
              ) : (
                <div className="flex items-center gap-2">

                  {/* User */}
                  <div
                    className={`
                      flex items-center gap-2.5
                      px-2.5 py-1.5
                      rounded-xl
                      border
                      ${
                        theme === 'dark'
                          ? 'bg-white/[0.04] border-white/10'
                          : 'bg-slate-50 border-slate-200'
                      }
                    `}
                  >
                    <div
                      className="
                        w-8 h-8
                        rounded-lg
                        bg-gradient-to-br from-blue-500 to-indigo-600
                        flex items-center justify-center
                        text-white
                        font-bold
                        text-xs
                      "
                    >
                      {user.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>

                    <div className="flex flex-col min-w-0">
                      <span
                        className={`
                          max-w-[110px]
                          truncate
                          text-xs
                          font-bold
                          ${
                            theme === 'dark'
                              ? 'text-gray-200'
                              : 'text-slate-800'
                          }
                        `}
                      >
                        {user.name}
                      </span>

                      <span
                        className={`
                          text-[9px]
                          capitalize
                          ${
                            theme === 'dark'
                              ? 'text-blue-400'
                              : 'text-blue-600'
                          }
                        `}
                      >
                        {user.role?.replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  {/* Logout */}
                  <button
                    onClick={handleLogout}
                    aria-label="Logout"
                    title="Logout"
                    className={`
                      w-10 h-10
                      flex items-center justify-center
                      rounded-xl
                      border
                      text-red-500
                      transition-all
                      hover:bg-red-500/10
                      active:scale-95
                      ${
                        theme === 'dark'
                          ? 'border-white/10'
                          : 'border-slate-200'
                      }
                    `}
                  >
                    <ArrowRightOnRectangleIcon className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>

            {/* ================= MOBILE BUTTONS ================= */}
            <div className="md:hidden flex items-center gap-2">

              <button
                onClick={toggleTheme}
                aria-label="Toggle theme"
                className={`
                  w-10 h-10
                  flex items-center justify-center
                  rounded-xl
                  border
                  transition-all
                  active:scale-95
                  ${
                    theme === 'dark'
                      ? 'bg-white/5 border-white/10 text-yellow-400'
                      : 'bg-slate-50 border-slate-200 text-slate-700'
                  }
                `}
              >
                {theme === 'dark' ? (
                  <SunIcon className="w-5 h-5" />
                ) : (
                  <MoonIcon className="w-5 h-5" />
                )}
              </button>

              {/* Hamburger */}
              <button
                onClick={() =>
                  setIsMobileMenuOpen(!isMobileMenuOpen)
                }
                aria-label="Toggle menu"
                aria-expanded={isMobileMenuOpen}
                className={`
                  w-10 h-10
                  flex items-center justify-center
                  rounded-xl
                  border
                  transition-all
                  active:scale-95
                  ${
                    theme === 'dark'
                      ? 'bg-white/5 border-white/10 text-gray-200'
                      : 'bg-slate-50 border-slate-200 text-slate-700'
                  }
                `}
              >
                {isMobileMenuOpen ? (
                  <XMarkIcon className="w-5 h-5" />
                ) : (
                  <Bars3Icon className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </nav>

        <div
          className={`
            md:hidden
            absolute
            top-full
            left-0
            right-0
            overflow-hidden
            transition-all duration-300 ease-out
            ${
              isMobileMenuOpen
                ? 'max-h-[calc(100vh-72px)] opacity-100 visible'
                : 'max-h-0 opacity-0 invisible'
            }
          `}
        >
          <div
            className={`
              border-t
              shadow-2xl
              ${
                theme === 'dark'
                  ? 'bg-gray-950/98 border-white/5'
                  : 'bg-white/98 border-slate-100'
              }
            `}
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5">

              {/* Mobile Navigation */}
              <div className="space-y-1.5">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.path);

                  return (
                    <Link
                      key={item.name}
                      to={item.path}
                      className={`
                        group
                        flex items-center
                        gap-3
                        px-4 py-3.5
                        rounded-2xl
                        text-sm
                        font-semibold
                        transition-all duration-200
                        ${
                          active
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                            : theme === 'dark'
                            ? 'text-gray-300 hover:bg-white/5 hover:text-white'
                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        }
                      `}
                    >
                      <div
                        className={`
                          w-9 h-9
                          rounded-xl
                          flex items-center justify-center
                          ${
                            active
                              ? 'bg-white/15'
                              : theme === 'dark'
                              ? 'bg-white/5'
                              : 'bg-slate-100'
                          }
                        `}
                      >
                        <Icon className="w-5 h-5" />
                      </div>

                      <span className="flex-1">
                        {item.name}
                      </span>

                      <ChevronRightIcon
                        className={`
                          w-4 h-4
                          transition-transform
                          group-hover:translate-x-1
                          ${
                            active
                              ? 'text-white/70'
                              : theme === 'dark'
                              ? 'text-gray-600'
                              : 'text-slate-400'
                          }
                        `}
                      />
                    </Link>
                  );
                })}
              </div>

              {/* Divider */}
              <div
                className={`
                  my-5 border-t
                  ${
                    theme === 'dark'
                      ? 'border-white/5'
                      : 'border-slate-100'
                  }
                `}
              />

              {/* Mobile Auth */}
              {!user ? (
                <div className="grid grid-cols-2 gap-3">
                  <Link
                    to="/login"
                    className={`
                      flex items-center justify-center
                      py-3.5
                      rounded-2xl
                      text-sm
                      font-semibold
                      border
                      transition-all
                      active:scale-[0.98]
                      ${
                        theme === 'dark'
                          ? 'border-white/10 text-gray-200 hover:bg-white/5'
                          : 'border-slate-200 text-slate-800 hover:bg-slate-50'
                      }
                    `}
                  >
                    Login
                  </Link>

                  <Link
                    to="/register"
                    className="
                      flex items-center justify-center
                      py-3.5
                      rounded-2xl
                      bg-blue-600
                      hover:bg-blue-700
                      text-white
                      text-sm
                      font-semibold
                      shadow-lg
                      shadow-blue-600/20
                      transition-all
                      active:scale-[0.98]
                    "
                  >
                    Get Started
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">

                  {/* User Card */}
                  <div
                    className={`
                      flex items-center gap-3
                      p-3.5
                      rounded-2xl
                      border
                      ${
                        theme === 'dark'
                          ? 'bg-white/[0.04] border-white/10'
                          : 'bg-slate-50 border-slate-200'
                      }
                    `}
                  >
                    <div
                      className="
                        w-11 h-11
                        rounded-xl
                        bg-gradient-to-br from-blue-500 to-indigo-600
                        flex items-center justify-center
                        text-white
                        font-bold
                      "
                    >
                      {user.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p
                        className={`
                          text-sm
                          font-bold
                          truncate
                          ${
                            theme === 'dark'
                              ? 'text-white'
                              : 'text-slate-900'
                          }
                        `}
                      >
                        {user.name}
                      </p>

                      <p
                        className={`
                          text-xs
                          capitalize
                          mt-0.5
                          ${
                            theme === 'dark'
                              ? 'text-blue-400'
                              : 'text-blue-600'
                          }
                        `}
                      >
                        {user.role?.replace('_', ' ')}
                      </p>
                    </div>
                  </div>

                  {/* Logout */}
                  <button
                    onClick={handleLogout}
                    className="
                      flex items-center justify-center
                      gap-2
                      w-full
                      py-3.5
                      rounded-2xl
                      bg-red-500/10
                      hover:bg-red-500/15
                      text-red-500
                      border border-red-500/10
                      text-sm
                      font-semibold
                      transition-all
                      active:scale-[0.98]
                    "
                  >
                    <ArrowRightOnRectangleIcon className="w-5 h-5" />
                    Logout
                  </button>
                </div>
              )}

              {/* Mobile Footer */}
              <p
                className={`
                  text-center
                  text-[10px]
                  mt-5
                  ${
                    theme === 'dark'
                      ? 'text-gray-600'
                      : 'text-slate-400'
                  }
                `}
              >
                AI-ECLT • Exam Center Tracer
              </p>
            </div>
          </div>
        </div>
      </header>

      {isMobileMenuOpen && (
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          className="
            md:hidden
            fixed inset-0
            top-[72px]
            z-40
            bg-black/20
            backdrop-blur-[2px]
          "
        />
      )}
    </>
  );
}

