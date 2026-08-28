// components/About.jsx - ✅ FIXED (RocketLaunchIcon)
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
  HeartIcon,
  RocketLaunchIcon // ✅ Replace RocketIcon with RocketLaunchIcon
} from '@heroicons/react/24/outline';

const About = () => {
  const teamMembers = [
    {
      name: 'Muhammad Asif',
      role: 'Lead Developer',
      image: null,
      description: 'Full-stack developer with expertise in AI and modern web technologies.',
    },
    {
      name: 'Muhammad Omer',
      role: 'Backend Engineer',
      image: null,
      description: 'Specializes in scalable backend systems and API architecture.',
    },
    {
      name: 'Huzaifa Hanif',
      role: 'Frontend Developer',
      image: null,
      description: 'Creative frontend developer focused on user experience and responsive design.',
    },
    {
      name: 'Anees Ahmad',
      role: 'AI/ML Engineer',
      image: null,
      description: 'AI enthusiast working on OCR and intelligent systems for exam management.',
    },
  ];

  const stats = [
    { icon: MapPinIcon, value: '50+', label: 'Exam Centers', color: 'text-blue-400' },
    { icon: CalendarIcon, value: '200+', label: 'Schedules', color: 'text-purple-400' },
    { icon: UserIcon, value: '10K+', label: 'Students', color: 'text-green-400' },
    { icon: StarIcon, value: '98%', label: 'Satisfaction', color: 'text-yellow-400' },
  ];

  const values = [
    { icon: SparklesIcon, title: 'Innovation', description: 'Leveraging AI to transform exam management.' },
    { icon: CheckCircleIcon, title: 'Accuracy', description: 'Precision-driven solutions for reliable results.' },
    { icon: UserGroupIcon, title: 'Collaboration', description: 'Working together to empower educational institutions.' },
    { icon: HeartIcon, title: 'Student First', description: 'Prioritizing student experience in every feature.' },
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
              <RocketLaunchIcon className="w-4 h-4 text-blue-400" /> {/* ✅ Replace here */}
              <span className="text-sm text-blue-400 font-medium">About AI-ECLT</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white leading-tight mb-6">
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Empowering Education
              </span>
              <br />
              <span className="text-gray-200">Through Technology</span>
            </h1>

            <p className="text-lg sm:text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
              AI-ECLT (AI-powered Examination Center Location Tracer) is designed to 
              revolutionize how educational institutions manage exam centers, schedules, 
              and student notifications. Our platform combines cutting-edge AI with 
              intuitive design to streamline the entire examination process.
            </p>
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

      {/* ==================== MISSION & VISION ==================== */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Mission */}
            <div className="bg-white/5 rounded-2xl p-8 border border-white/10 hover:border-white/20 transition">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl">
                  <SparklesIcon className="w-6 h-6 text-blue-400" />
                </div>
                <h2 className="text-2xl font-bold text-white">Our Mission</h2>
              </div>
              <p className="text-gray-400 leading-relaxed">
                To provide educational institutions with an intelligent, user-friendly 
                platform that simplifies exam center management, reduces administrative 
                burden, and enhances the overall experience for students, board officials, 
                and administrators.
              </p>
            </div>

            {/* Vision */}
            <div className="bg-white/5 rounded-2xl p-8 border border-white/10 hover:border-white/20 transition">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-gradient-to-r from-green-500/20 to-teal-500/20 rounded-xl">
                  <AcademicCapIcon className="w-6 h-6 text-green-400" />
                </div>
                <h2 className="text-2xl font-bold text-white">Our Vision</h2>
              </div>
              <p className="text-gray-400 leading-relaxed">
                To become the leading AI-powered examination management platform, 
                setting the standard for educational technology by continuously 
                innovating and adapting to the evolving needs of the academic community.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== VALUES SECTION ==================== */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Our Core Values</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              The principles that guide every decision we make and every feature we build.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, i) => (
              <div key={i} className="bg-white/5 rounded-xl p-6 border border-white/10 hover:border-white/20 transition text-center hover:-translate-y-1">
                <value.icon className="w-10 h-10 mx-auto mb-4 text-blue-400" />
                <h3 className="text-lg font-semibold text-white mb-2">{value.title}</h3>
                <p className="text-sm text-gray-400">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== TEAM SECTION ==================== */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Meet Our Team</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              The passionate individuals behind AI-ECLT, dedicated to transforming education.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {teamMembers.map((member, i) => (
              <div key={i} className="bg-white/5 rounded-2xl p-6 border border-white/10 hover:border-white/20 transition text-center hover:-translate-y-1">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-blue-500/25">
                  {member.name.charAt(0)}
                </div>
                <h3 className="text-lg font-semibold text-white">{member.name}</h3>
                <p className="text-sm text-blue-400 mb-2">{member.role}</p>
                <p className="text-sm text-gray-400">{member.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== CTA SECTION ==================== */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl p-8 sm:p-12 border border-blue-500/20 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">Ready to Get Started?</h2>
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

export default About;