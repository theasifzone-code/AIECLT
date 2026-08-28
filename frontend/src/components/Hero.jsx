// components/Hero.jsx - ✅ MODERN, RESPONSIVE, ROUTER-CONNECTED
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
  StarIcon
} from '@heroicons/react/24/outline';

function Hero({ user }) {
  return (
    <section className="relative overflow-hidden pt-24 pb-32 px-4">
      {/* ==================== ANIMATED BACKGROUND ==================== */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 dark:bg-purple-900 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-blue-300 dark:bg-blue-900 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-300 dark:bg-indigo-900 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      </div>

      <div className="container mx-auto max-w-6xl relative">
        <div className="text-center">
          {/* ==================== BADGE ==================== */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full mb-6 animate-fade-in">
            <SparklesIcon className="w-4 h-4 text-blue-400 animate-pulse" />
            <span className="text-sm text-blue-400 font-medium">AI-Powered Exam Management</span>
          </div>

          {/* ==================== MAIN HEADING ==================== */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6 animate-slide-left">
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              AI-ECLT
            </span>
            <br />
            <span className="text-gray-200">Exam Center</span>
            <br />
            <span className="text-gray-200">Management</span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-8 leading-relaxed animate-fade-in animation-delay-300">
            Streamline exam center operations with AI-powered scheduling, 
            real-time monitoring, and automated notifications for seamless 
            examination management.
          </p>

          {/* ==================== CTA BUTTONS ==================== */}
          <div className="flex flex-wrap items-center justify-center gap-4 animate-fade-in animation-delay-500">
            {!user ? (
              // 🔓 PUBLIC CTA (Router se connected)
              <>
                <Link
                  to="/login"
                  className="group px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl transition-all shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 flex items-center gap-2 text-lg font-medium hover:-translate-y-1"
                >
                  Get Started
                  <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/register"
                  className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-all border border-white/10 hover:border-white/20 text-lg font-medium hover:-translate-y-1"
                >
                  Create Account
                </Link>
              </>
            ) : (
              // 🔐 PRIVATE CTA (Router se connected)
              <>
                <Link
                  to="/student"
                  className="group px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl transition-all shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 flex items-center gap-2 text-lg font-medium hover:-translate-y-1"
                >
                  <AcademicCapIcon className="w-5 h-5" />
                  Student Portal
                  <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>

                {(user.role === 'board_official' || user.role === 'admin') && (
                  <Link
                    to="/board"
                    className="px-8 py-4 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-xl transition-all shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 text-lg font-medium hover:-translate-y-1"
                  >
                    <BuildingOfficeIcon className="w-5 h-5 inline mr-2" />
                    Board Dashboard
                  </Link>
                )}

                {user.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="px-8 py-4 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl transition-all shadow-lg shadow-red-500/25 hover:shadow-red-500/40 text-lg font-medium hover:-translate-y-1"
                  >
                    <UserGroupIcon className="w-5 h-5 inline mr-2" />
                    Admin Panel
                  </Link>
                )}
              </>
            )}
          </div>

          {/* ==================== USER INFO CARD ==================== */}
          {user && (
            <div className="mt-8 inline-flex items-center gap-4 px-6 py-3 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 animate-fade-in animation-delay-700 hover:border-white/20 transition">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-base shadow-lg shadow-blue-500/25">
                {user.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-white">{user.name}</p>
                <p className="text-xs text-gray-400">{user.email}</p>
              </div>
              <div className="px-3 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full capitalize border border-blue-500/20">
                {user.role?.replace('_', ' ')}
              </div>
            </div>
          )}
        </div>

        {/* ==================== STATS BAR ==================== */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto animate-fade-in animation-delay-1000">
          <div className="text-center group hover:-translate-y-1 transition">
            <div className="flex items-center justify-center gap-2">
              <MapPinIcon className="w-5 h-5 text-blue-400" />
              <p className="text-3xl font-bold text-white">50+</p>
            </div>
            <p className="text-sm text-gray-400">Exam Centers</p>
          </div>
          <div className="text-center group hover:-translate-y-1 transition">
            <div className="flex items-center justify-center gap-2">
              <CalendarIcon className="w-5 h-5 text-purple-400" />
              <p className="text-3xl font-bold text-white">200+</p>
            </div>
            <p className="text-sm text-gray-400">Schedules</p>
          </div>
          <div className="text-center group hover:-translate-y-1 transition">
            <div className="flex items-center justify-center gap-2">
              <UserIcon className="w-5 h-5 text-green-400" />
              <p className="text-3xl font-bold text-white">10K+</p>
            </div>
            <p className="text-sm text-gray-400">Students</p>
          </div>
          <div className="text-center group hover:-translate-y-1 transition">
            <div className="flex items-center justify-center gap-2">
              <StarIcon className="w-5 h-5 text-yellow-400" />
              <p className="text-3xl font-bold text-white">98%</p>
            </div>
            <p className="text-sm text-gray-400">Satisfaction</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;