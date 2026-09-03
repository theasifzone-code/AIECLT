import React from 'react';
import {
  ArrowRightIcon,
  SparklesIcon,
  CheckBadgeIcon,
  RocketLaunchIcon,
  UserGroupIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import { useTheme } from '../context/ThemeContext';

const CTASection = ({ onNavigate, user }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const features = [
    {
      icon: CheckBadgeIcon,
      text: '100% Secure',
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10',
    },
    {
      icon: RocketLaunchIcon,
      text: 'Fast & Reliable',
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
    },
    {
      icon: UserGroupIcon,
      text: '24/7 Support',
      color: 'text-purple-500',
      bg: 'bg-purple-500/10',
    },
    {
      icon: ShieldCheckIcon,
      text: 'Data Privacy',
      color: 'text-amber-500',
      bg: 'bg-amber-500/10',
    },
  ];

  return (
    <section
      id="cta"
      className={`relative overflow-hidden py-20 sm:py-24 lg:py-28 px-4 sm:px-6 lg:px-8 transition-colors duration-300 ${isDark
          ? 'bg-gray-950 text-white'
          : 'bg-slate-50 text-slate-900'
        }`}
    >
      <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
        {/* Grid */}
        <div
          className={`
            absolute inset-0
            opacity-[0.035]
            ${isDark
              ? 'bg-[linear-gradient(rgba(255,255,255,.8)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.8)_1px,transparent_1px)]'
              : 'bg-[linear-gradient(rgba(37,99,235,.8)_1px,transparent_1px),linear-gradient(90deg,rgba(37,99,235,.8)_1px,transparent_1px)]'
            }
            [background-size:40px_40px]
          `}
        />
        <div className="absolute -top-40 left-1/4 w-96 h-96 rounded-full bg-blue-600/10 blur-3xl" />
        <div className="absolute top-1/4 -right-40 w-96 h-96 rounded-full bg-violet-600/10 blur-3xl" />
      </div>

      <div className="relative max-w-6xl mx-auto">

        <div
          className={`relative overflow-hidden rounded-[2rem] sm:rounded-[2.5rem] border ${isDark
              ? 'bg-white/[0.03] border-white/10'
              : 'bg-white border-slate-200 shadow-2xl shadow-slate-200/60'
            }`}
        >

          <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-blue-600/10 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-purple-600/10 blur-3xl pointer-events-none" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent" />

          <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 p-7 sm:p-10 lg:p-14">
            <div className="lg:col-span-7 flex flex-col justify-center text-center lg:text-left">

              <div
                className={`mx-auto lg:mx-0 inline-flex w-fit items-center gap-2 px-4 py-2 rounded-full border text-xs sm:text-sm font-semibold mb-6 ${isDark
                    ? 'bg-blue-500/10 border-blue-500/20 text-blue-400'
                    : 'bg-blue-50 border-blue-200 text-blue-600'
                  }`}
              >
                <SparklesIcon className="w-4 h-4 animate-pulse" />
                Ready to Get Started?
              </div>

              <h2
                className={`text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight ${isDark ? 'text-white' : 'text-slate-900'
                  }`}
              >
                Make Exam Management

                <span className="block mt-2 bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 bg-clip-text text-transparent">
                  Smarter & Easier
                </span>
              </h2>

              <p
                className={`mt-5 max-w-2xl mx-auto lg:mx-0 text-sm sm:text-base lg:text-lg leading-7 ${isDark ? 'text-gray-400' : 'text-slate-600'
                  }`}
              >
                Join AI-ECLT and simplify your exam center operations
                with smart scheduling, real-time monitoring, and
                powerful AI-driven tools.
              </p>

              <div
                className={`hidden sm:flex flex-wrap items-center justify-center lg:justify-start gap-x-5 gap-y-2 mt-7 text-xs sm:text-sm font-medium ${isDark ? 'text-gray-500' : 'text-slate-500'
                  }`}
              >
                <span className="flex items-center gap-1.5">
                  <CheckBadgeIcon className="w-4 h-4 text-emerald-500" />
                  50+ institutions
                </span>

                <span
                  className={`w-1 h-1 rounded-full ${isDark ? 'bg-gray-700' : 'bg-slate-300'
                    }`}
                />

                <span>⭐ 4.9/5 rating</span>

                <span
                  className={`w-1 h-1 rounded-full ${isDark ? 'bg-gray-700' : 'bg-slate-300'
                    }`}
                />

                <span>10K+ students</span>
              </div>
            </div>

            <div className="lg:col-span-5 flex flex-col justify-center">

              {/* Features */}
              <div className="grid grid-cols-2 gap-3">
                {features.map((feature) => {
                  const Icon = feature.icon;

                  return (
                    <div
                      key={feature.text}
                      className={`group flex items-center gap-2.5 p-3 sm:p-3.5 rounded-2xl border transition-all duration-300 hover:-translate-y-1 ${isDark
                          ? 'bg-white/[0.03] border-white/10 hover:border-white/20 hover:bg-white/[0.05]'
                          : 'bg-slate-50 border-slate-200 hover:bg-white hover:border-slate-300 hover:shadow-md'
                        }`}
                    >
                      <div
                        className={`shrink-0 w-9 h-9 rounded-xl ${feature.bg} flex items-center justify-center group-hover:scale-110 transition-transform`}
                      >
                        <Icon className={`w-4.5 h-4.5 ${feature.color}`} />
                      </div>

                      <span
                        className={`text-xs sm:text-sm font-semibold ${isDark ? 'text-gray-200' : 'text-slate-800'
                          }`}
                      >
                        {feature.text}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 flex flex-col sm:flex-row gap-3">

                {!user ? (
                  <>
                    <button
                      type="button"
                      onClick={() => onNavigate('register')}
                      className="group w-full sm:flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 sm:py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-sm sm:text-base shadow-xl shadow-blue-500/20 hover:shadow-blue-500/30 hover:-translate-y-0.5 active:scale-95 transition-all duration-300"
                    >
                      Get Started
                      <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>

                    <button
                      type="button"
                      onClick={() => onNavigate('login')}
                      className={`w-full sm:w-auto px-6 py-3.5 sm:py-4 rounded-2xl border font-semibold text-sm sm:text-base transition-all duration-300 hover:-translate-y-0.5 active:scale-95 ${isDark
                          ? 'bg-white/[0.03] border-white/10 text-white hover:bg-white/[0.06] hover:border-white/20'
                          : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50 hover:border-slate-300 shadow-sm'
                        }`}
                    >
                      Sign In
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => onNavigate('student')}
                    className="group w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 sm:py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-sm sm:text-base shadow-xl shadow-blue-500/20 hover:shadow-blue-500/30 hover:-translate-y-0.5 transition-all duration-300"
                  >
                    Go to Dashboard
                    <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                )}
              </div>

              <div
                className={`sm:hidden flex items-center justify-center gap-3 mt-5 text-[11px] font-medium ${isDark ? 'text-gray-500' : 'text-slate-500'
                  }`}
              >
                <span className="flex items-center gap-1">
                  <CheckBadgeIcon className="w-3.5 h-3.5 text-emerald-500" />
                  50+ institutions
                </span>

                <span>•</span>

                <span>⭐ 4.9/5 rating</span>
              </div>
            </div>
          </div>

          <div className="absolute bottom-0 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
        </div>

        <p
          className={`text-center mt-6 text-xs sm:text-sm ${isDark ? 'text-gray-600' : 'text-slate-400'
            }`}
        >
          Everything you need to manage exams efficiently — all in one place.
        </p>
      </div>
    </section>
  );
};

export default CTASection;
