// components/CTASection.jsx - ✅ Production Level Code
import React from 'react';
import { 
  ArrowRightIcon, 
  SparklesIcon,
  CheckBadgeIcon,
  RocketLaunchIcon,
  UserGroupIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

const CTASection = ({ onNavigate, user }) => {
  const features = [
    {
      icon: CheckBadgeIcon,
      text: '100% Secure',
      color: 'text-green-400',
    },
    {
      icon: RocketLaunchIcon,
      text: 'Fast & Reliable',
      color: 'text-blue-400',
    },
    {
      icon: UserGroupIcon,
      text: '24/7 Support',
      color: 'text-purple-400',
    },
    {
      icon: ShieldCheckIcon,
      text: 'Data Privacy',
      color: 'text-orange-400',
    },
  ];

  return (
    <section className="py-24 px-4 relative overflow-hidden" id="cta">
      {/* ==================== BACKGROUND EFFECTS ==================== */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-blob" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-pink-500/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto max-w-5xl">
        {/* ==================== MAIN CTA CARD ==================== */}
        <div className="relative bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 rounded-3xl p-8 md:p-12 border border-white/10 backdrop-blur-sm shadow-2xl shadow-blue-500/5 animate-fade-in">
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-0 left-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl" />
          </div>
          
          <div className="text-center relative">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/20 border border-blue-500/30 rounded-full mb-6 animate-float">
              <SparklesIcon className="w-4 h-4 text-blue-400 animate-pulse" />
              <span className="text-sm text-blue-400 font-medium">Ready to Get Started?</span>
            </div>
            
            {/* Heading */}
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
              Join Thousands of{' '}
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Users
              </span>
            </h2>
            
            {/* Description */}
            <p className="text-gray-300 max-w-2xl mx-auto mb-8 text-lg leading-relaxed">
              Start managing exam centers efficiently with AI-ECLT. 
              Sign up today and transform your exam management process 
              with AI-powered tools.
            </p>

            {/* Features List */}
            <div className="flex flex-wrap items-center justify-center gap-6 mb-8">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div key={index} className="flex items-center gap-2">
                    <Icon className={`w-4 h-4 ${feature.color}`} />
                    <span className="text-sm text-gray-300">{feature.text}</span>
                  </div>
                );
              })}
            </div>
            
            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-4">
              {!user ? (
                <>
                  <button
                    onClick={() => onNavigate('register')}
                    className="group px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl transition-all shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 flex items-center gap-2 text-lg font-medium hover:-translate-y-1"
                  >
                    Get Started Now
                    <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                  <button
                    onClick={() => onNavigate('login')}
                    className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-all border border-white/10 hover:border-white/20 text-lg font-medium hover:-translate-y-1"
                  >
                    Sign In
                  </button>
                </>
              ) : (
                <button
                  onClick={() => onNavigate('student')}
                  className="group px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl transition-all shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 flex items-center gap-2 text-lg font-medium hover:-translate-y-1"
                >
                  Go to Dashboard
                  <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              )}
            </div>

            {/* Trust Badge */}
            <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <CheckBadgeIcon className="w-3 h-3 text-green-400" />
                Trusted by 50+ institutions
              </span>
              <span className="w-px h-3 bg-gray-700" />
              <span>⭐ 4.9/5 average rating</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;