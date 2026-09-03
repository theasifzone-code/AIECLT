
import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRightIcon,
  SparklesIcon,
  AcademicCapIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  MapPinIcon,
  CalendarIcon,
  UserIcon,
  StarIcon,
} from '@heroicons/react/24/outline';
import { useTheme } from '../context/ThemeContext';

export default function Hero({ user }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const stats = [
    {
      icon: MapPinIcon,
      count: '50+',
      label: 'Exam Centers',
      color: 'text-blue-500',
    },
    {
      icon: CalendarIcon,
      count: '200+',
      label: 'Schedules',
      color: 'text-purple-500',
    },
    {
      icon: UserIcon,
      count: '10K+',
      label: 'Students',
      color: 'text-emerald-500',
    },
    {
      icon: StarIcon,
      count: '98%',
      label: 'Satisfaction',
      color: 'text-amber-500',
    },
  ];

  return (
    <section
      className={`relative overflow-hidden pt-20 sm:pt-24 lg:pt-28 pb-16 sm:pb-20 lg:pb-24 px-4 sm:px-6 lg:px-8 transition-colors duration-300 ${
        isDark
          ? 'bg-gray-950 text-white'
          : 'bg-white text-slate-900'
      }`}
    >
      <div className="absolute inset-0 pointer-events-none overflow-hidden">

        {/* Grid */}
        <div
          className={`absolute inset-0 ${
            isDark ? 'opacity-[0.035]' : 'opacity-[0.04]'
          }`}
          style={{
            backgroundImage: `
              linear-gradient(to right, currentColor 1px, transparent 1px),
              linear-gradient(to bottom, currentColor 1px, transparent 1px)
            `,
            backgroundSize: '48px 48px',
          }}
        />

        <div
          className={`absolute -top-32 -left-20 w-72 h-72 sm:w-[500px] sm:h-[500px] rounded-full blur-3xl ${
            isDark ? 'bg-blue-600/10' : 'bg-blue-200/40'
          }`}
        />
        <div
          className={`absolute -top-32 -right-20 w-72 h-72 sm:w-[500px] sm:h-[500px] rounded-full blur-3xl ${
            isDark ? 'bg-purple-600/10' : 'bg-purple-200/40'
          }`}
        />

        <div
          className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-72 h-40 sm:w-[600px] sm:h-[250px] rounded-full blur-3xl ${
            isDark ? 'bg-indigo-600/5' : 'bg-indigo-100/30'
          }`}
        />
      </div>

      <div className="relative max-w-6xl mx-auto">

        <div className="max-w-4xl mx-auto text-center">

          {/* Badge */}
          <div
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-xs sm:text-sm font-semibold mb-6 ${
              isDark
                ? 'bg-blue-500/10 border-blue-500/20 text-blue-400'
                : 'bg-blue-50 border-blue-200 text-blue-600'
            }`}
          >
            <SparklesIcon className="w-4 h-4 animate-pulse" />
            AI-Powered Exam Management
          </div>

          {/* Heading */}
          <h1
            className={`text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[1.05] ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}
          >
            Smarter Way to Manage

            <span className="block mt-2 bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 bg-clip-text text-transparent">
              Your Exam Centers
            </span>
          </h1>

          {/* Description */}
          <p
            className={`max-w-2xl mx-auto mt-6 text-sm sm:text-base lg:text-lg leading-7 ${
              isDark ? 'text-gray-400' : 'text-slate-600'
            }`}
          >
            AI-ECLT simplifies exam center management with
            AI-powered scheduling, real-time monitoring, smart
            navigation, and automated notifications.
          </p>

          {/* ==================== CTA ==================== */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mt-9">

            {!user ? (
              <>
                <Link
                  to="/login"
                  className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 sm:px-8 py-3.5 sm:py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-sm sm:text-base shadow-xl shadow-blue-500/20 hover:shadow-blue-500/30 hover:-translate-y-0.5 transition-all duration-300"
                >
                  Get Started
                  <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  to="/register"
                  className={`w-full sm:w-auto inline-flex items-center justify-center px-7 sm:px-8 py-3.5 sm:py-4 rounded-2xl border font-semibold text-sm sm:text-base hover:-translate-y-0.5 transition-all duration-300 ${
                    isDark
                      ? 'bg-white/[0.03] border-white/10 text-white hover:bg-white/[0.06] hover:border-white/20'
                      : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50 hover:border-slate-300 shadow-sm'
                  }`}
                >
                  Create Account
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/student"
                  className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 sm:px-7 py-3.5 sm:py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-sm sm:text-base shadow-xl shadow-blue-500/20 hover:-translate-y-0.5 transition-all duration-300"
                >
                  <AcademicCapIcon className="w-5 h-5" />
                  Student Portal
                  <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>

                {(user.role === 'board_official' ||
                  user.role === 'admin') && (
                  <Link
                    to="/board"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 sm:px-7 py-3.5 sm:py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-700 hover:to-fuchsia-700 text-white font-semibold text-sm sm:text-base shadow-xl shadow-purple-500/20 hover:-translate-y-0.5 transition-all duration-300"
                  >
                    <BuildingOfficeIcon className="w-5 h-5" />
                    Board Dashboard
                  </Link>
                )}

                {user.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 sm:px-7 py-3.5 sm:py-4 rounded-2xl bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white font-semibold text-sm sm:text-base shadow-xl shadow-red-500/20 hover:-translate-y-0.5 transition-all duration-300"
                  >
                    <UserGroupIcon className="w-5 h-5" />
                    Admin Panel
                  </Link>
                )}
              </>
            )}
          </div>

          {/* ==================== USER CARD ==================== */}
          {user && (
            <div
              className={`inline-flex flex-wrap sm:flex-nowrap items-center justify-center gap-3 sm:gap-4 mt-9 px-4 sm:px-5 py-3 rounded-2xl border ${
                isDark
                  ? 'bg-white/[0.03] border-white/10'
                  : 'bg-white border-slate-200 shadow-sm'
              }`}
            >
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-400 flex items-center justify-center text-white font-bold shadow-lg">
                {user.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>

              <div className="text-left">
                <p
                  className={`text-sm font-bold ${
                    isDark ? 'text-white' : 'text-slate-900'
                  }`}
                >
                  {user.name}
                </p>

                <p
                  className={`text-xs ${
                    isDark ? 'text-gray-500' : 'text-slate-500'
                  }`}
                >
                  {user.email}
                </p>
              </div>

              <span className="px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-500 text-xs font-semibold capitalize">
                {user.role?.replace('_', ' ')}
              </span>
            </div>
          )}
        </div>

        {/* ==================== STATS ==================== */}
        <div
          className={`relative mt-16 sm:mt-20 max-w-4xl mx-auto rounded-3xl border overflow-hidden ${
            isDark
              ? 'bg-white/[0.03] border-white/10'
              : 'bg-white border-slate-200 shadow-2xl shadow-slate-200/50'
          }`}
        >
          <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-slate-200 dark:divide-white/10">

            {stats.map((stat) => {
              const Icon = stat.icon;

              return (
                <div
                  key={stat.label}
                  className="group relative p-5 sm:p-6 text-center hover:bg-white/[0.03] transition-colors"
                >
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <Icon
                      className={`w-4 h-4 sm:w-5 sm:h-5 ${stat.color} group-hover:scale-110 transition-transform`}
                    />

                    <span
                      className={`text-2xl sm:text-3xl font-black ${
                        isDark ? 'text-white' : 'text-slate-900'
                      }`}
                    >
                      {stat.count}
                    </span>
                  </div>

                  <p
                    className={`text-[11px] sm:text-xs font-medium ${
                      isDark ? 'text-gray-500' : 'text-slate-500'
                    }`}
                  >
                    {stat.label}
                  </p>
                </div>
              );
            })}

          </div>
        </div>
        <div className="flex flex-wrap justify-center items-center gap-x-6 gap-y-2 mt-7">
          {[
            'AI Powered',
            'Real-Time Updates',
            'Secure Platform',
            'Mobile Friendly',
          ].map((item) => (
            <div
              key={item}
              className={`flex items-center gap-2 text-xs sm:text-sm ${
                isDark ? 'text-gray-500' : 'text-slate-500'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              {item}
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
