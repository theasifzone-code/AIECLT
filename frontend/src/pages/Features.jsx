// components/Features.jsx - ✅ FIXED (BellIcon Add)
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  SparklesIcon, 
  AcademicCapIcon, 
  BuildingOfficeIcon, 
  UserGroupIcon,
  MapPinIcon,
  CalendarIcon,
  UserIcon,
  StarIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  CameraIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  RocketLaunchIcon,
  Cog6ToothIcon,
  BellIcon // ✅ Add this import
} from '@heroicons/react/24/outline';

const Features = () => {
  const mainFeatures = [
    {
      icon: CameraIcon,
      title: 'AI-Powered OCR',
      description: 'Upload your roll number slip and our AI automatically detects your exam center. No more manual searching!',
      color: 'from-blue-500/20 to-blue-600/5',
      borderColor: 'border-blue-500/20',
      iconColor: 'text-blue-400'
    },
    {
      icon: MapPinIcon,
      title: 'Smart Route Finder',
      description: 'Get real-time route suggestions with distance, ETA, and traffic updates to reach your exam center on time.',
      color: 'from-green-500/20 to-green-600/5',
      borderColor: 'border-green-500/20',
      iconColor: 'text-green-400'
    },
    {
      icon: CalendarIcon,
      title: 'Schedule Management',
      description: 'View and manage exam schedules effortlessly. Board officials can create, update, and cancel schedules with ease.',
      color: 'from-purple-500/20 to-purple-600/5',
      borderColor: 'border-purple-500/20',
      iconColor: 'text-purple-400'
    },
    {
      icon: BellIcon, // ✅ Use BellIcon here
      title: 'Instant Notifications',
      description: 'Get real-time notifications about schedule changes, exam updates, and important announcements.',
      color: 'from-yellow-500/20 to-yellow-600/5',
      borderColor: 'border-yellow-500/20',
      iconColor: 'text-yellow-400'
    },
    {
      icon: ChartBarIcon,
      title: 'Analytics Dashboard',
      description: 'Comprehensive analytics and statistics for administrators to make data-driven decisions.',
      color: 'from-orange-500/20 to-orange-600/5',
      borderColor: 'border-orange-500/20',
      iconColor: 'text-orange-400'
    },
    {
      icon: ShieldCheckIcon,
      title: 'Secure & Reliable',
      description: 'Bank-grade security with encrypted data transmission and secure user authentication.',
      color: 'from-red-500/20 to-red-600/5',
      borderColor: 'border-red-500/20',
      iconColor: 'text-red-400'
    }
  ];

  const howItWorks = [
    {
      step: 1,
      title: 'Upload Slip',
      description: 'Upload your roll number slip or enter your center code manually.',
      icon: CameraIcon,
      color: 'text-blue-400'
    },
    {
      step: 2,
      title: 'AI Detection',
      description: 'Our AI processes the image and detects your exam center instantly.',
      icon: SparklesIcon,
      color: 'text-purple-400'
    },
    {
      step: 3,
      title: 'Get Route',
      description: 'Receive real-time route suggestions, distance, and ETA to your center.',
      icon: MapPinIcon,
      color: 'text-green-400'
    },
    {
      step: 4,
      title: 'Stay Updated',
      description: 'Get notifications about schedule changes and exam updates.',
      icon: BellIcon, // ✅ Use BellIcon here
      color: 'text-yellow-400'
    }
  ];

  const stats = [
    { icon: MapPinIcon, value: '50+', label: 'Exam Centers', color: 'text-blue-400' },
    { icon: CalendarIcon, value: '200+', label: 'Schedules', color: 'text-purple-400' },
    { icon: UserIcon, value: '10K+', label: 'Students', color: 'text-green-400' },
    { icon: StarIcon, value: '98%', label: 'Satisfaction', color: 'text-yellow-400' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* ==================== HERO SECTION ==================== */}
      <section className="relative overflow-hidden pt-24 pb-20 px-4">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300/10 rounded-full blur-3xl"></div>
          <div className="absolute top-0 -right-4 w-72 h-72 bg-blue-300/10 rounded-full blur-3xl"></div>
          <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        </div>

        <div className="container mx-auto max-w-6xl relative">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full mb-6 animate-fade-in">
              <RocketLaunchIcon className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-blue-400 font-medium">Powerful Features</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white leading-tight mb-6">
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Everything You Need
              </span>
              <br />
              <span className="text-gray-200">To Ace Your Exams</span>
            </h1>

            <p className="text-lg sm:text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
              From AI-powered OCR to real-time route suggestions, AI-ECLT provides 
              all the tools you need to streamline exam center management and 
              enhance the student experience.
            </p>
          </div>
        </div>
      </section>

      {/* ==================== MAIN FEATURES ==================== */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {mainFeatures.map((feature, i) => (
              <div key={i} className={`bg-gradient-to-br ${feature.color} rounded-2xl p-6 border ${feature.borderColor} hover:border-white/30 transition hover:-translate-y-1`}>
                <div className={`p-3 bg-white/5 rounded-xl mb-4 inline-block`}>
                  <feature.icon className={`w-8 h-8 ${feature.iconColor}`} />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== HOW IT WORKS ==================== */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">How It Works</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Simple steps to find your exam center and stay updated.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {howItWorks.map((step, i) => (
              <div key={i} className="bg-white/5 rounded-2xl p-6 border border-white/10 hover:border-white/20 transition text-center">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold">
                  {step.step}
                </div>
                <step.icon className={`w-8 h-8 mx-auto mb-3 ${step.color}`} />
                <h3 className="text-lg font-semibold text-white mb-2">{step.title}</h3>
                <p className="text-sm text-gray-400">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== STATS SECTION ==================== */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <div key={i} className="bg-white/5 rounded-xl p-6 border border-white/10 hover:border-white/20 transition text-center hover:-translate-y-1">
                <stat.icon className={`w-8 h-8 mx-auto mb-3 ${stat.color}`} />
                <p className="text-3xl font-bold text-white">{stat.value}</p>
                <p className="text-sm text-gray-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== CTA SECTION ==================== */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl p-8 sm:p-12 border border-blue-500/20 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">Ready to Experience AI-ECLT?</h2>
            <p className="text-gray-400 mb-8 max-w-xl mx-auto">
              Join thousands of students and institutions already using AI-ECLT to streamline their exam management.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                to="/register"
                className="group px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl transition-all shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 flex items-center gap-2 text-lg font-medium hover:-translate-y-1"
              >
                Create Account
                <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/contact"
                className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-all border border-white/10 hover:border-white/20 text-lg font-medium hover:-translate-y-1"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Features;