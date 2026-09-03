import React from 'react';
import { 
  EyeIcon, 
  CpuChipIcon, 
  UsersIcon, 
  AcademicCapIcon, 
  ShieldCheckIcon, 
  GlobeAltIcon, 
  BoltIcon 
} from '@heroicons/react/24/outline';
import { useTheme } from '../context/ThemeContext';

const About = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const team = [
    { name: "Muhammad Asif", role: "Team Lead / Full Stack Developer" },
    { name: "Muhammad Omer", role: "Frontend Specialist / UI Designer" },
    { name: "Huzaifa Hanif", role: "Backend Architect / OCR Integration" },
    { name: "Anees Ahmad", role: "Data Scientist / Route Optimization" }
  ];

  return (
    <div className={`min-h-screen overflow-x-hidden transition-colors duration-300 ${
      isDark ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'
    }`}>
      {/* Ambient background */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className={`absolute -left-32 top-20 h-80 w-80 rounded-full blur-3xl ${
          isDark ? 'bg-blue-600/10' : 'bg-blue-300/25'
        }`} />
        <div className={`absolute -right-32 top-[40%] h-96 w-96 rounded-full blur-3xl ${
          isDark ? 'bg-violet-600/10' : 'bg-violet-300/20'
        }`} />
        <div className={`absolute bottom-0 left-1/3 h-72 w-72 rounded-full blur-3xl ${
          isDark ? 'bg-cyan-600/10' : 'bg-cyan-300/15'
        }`} />
      </div>

      <main className="relative mx-auto max-w-7xl px-4 pb-20 pt-24 sm:px-6 sm:pb-24 sm:pt-28 lg:px-8">
        {/* Hero */}
        <section className="mx-auto max-w-4xl text-center">
          <div className={`mb-5 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-bold tracking-wide ${
            isDark
              ? 'border-blue-400/20 bg-blue-500/10 text-blue-300'
              : 'border-blue-200 bg-white text-blue-700 shadow-sm'
          }`}>
            <span className="h-2 w-2 rounded-full bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,.8)]" />
            Our Mission
          </div>

          <h1 className={`text-4xl font-black leading-[1.05] tracking-tight sm:text-5xl md:text-6xl lg:text-7xl ${
            isDark ? 'text-white' : 'text-slate-950'
          }`}>
            Pioneering the Future of
            <span className="block bg-gradient-to-r from-blue-600 via-violet-500 to-fuchsia-500 bg-clip-text text-transparent">
              Exam Logistics
            </span>
          </h1>

          <p className={`mx-auto mt-6 max-w-3xl text-sm leading-7 sm:text-base sm:leading-8 ${
            isDark ? 'text-slate-400' : 'text-slate-600'
          }`}>
            AI-ECLT (Exam Center Location Tracer) is a state-of-the-art platform designed to solve
            the critical challenges of examination center navigation and administrative management
            using cutting-edge AI and OCR technologies.
          </p>
        </section>

        <section className="mt-14 sm:mt-20">
          <div className="grid gap-5 md:grid-cols-2">
            <article className={`group relative overflow-hidden rounded-3xl border p-7 transition-all duration-300 hover:-translate-y-1 sm:p-9 ${
              isDark
                ? 'border-white/10 bg-white/[0.04] hover:border-blue-400/20'
                : 'border-slate-200 bg-white shadow-lg shadow-slate-200/40 hover:border-blue-200 hover:shadow-xl'
            }`}>
              <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-blue-500/10 blur-3xl" />
              <div className="relative">
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 ring-1 ring-blue-500/20">
                  <EyeIcon className="h-6 w-6 text-blue-500" />
                </div>
                <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-blue-500">Our Vision</p>
                <h2 className={`text-2xl font-black tracking-tight ${
                  isDark ? 'text-white' : 'text-slate-950'
                }`}>
                  Confidence at every step
                </h2>
                <p className={`mt-4 text-sm leading-7 sm:text-base ${
                  isDark ? 'text-slate-400' : 'text-slate-600'
                }`}>
                  To create an ecosystem where every student can reach their examination center with
                  100% certainty, eliminating the stress of navigation and ensuring punctual
                  attendance through intelligent route optimization and real-time data.
                </p>
              </div>
            </article>

            <article className={`group relative overflow-hidden rounded-3xl border p-7 transition-all duration-300 hover:-translate-y-1 sm:p-9 ${
              isDark
                ? 'border-white/10 bg-white/[0.04] hover:border-cyan-400/20'
                : 'border-slate-200 bg-white shadow-lg shadow-slate-200/40 hover:border-cyan-200 hover:shadow-xl'
            }`}>
              <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-cyan-500/10 blur-3xl" />
              <div className="relative">
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/10 ring-1 ring-cyan-500/20">
                  <BoltIcon className="h-6 w-6 text-cyan-500" />
                </div>
                <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-cyan-500">Innovation</p>
                <h2 className={`text-2xl font-black tracking-tight ${
                  isDark ? 'text-white' : 'text-slate-950'
                }`}>
                  Intelligence behind the scenes
                </h2>
                <p className={`mt-4 text-sm leading-7 sm:text-base ${
                  isDark ? 'text-slate-400' : 'text-slate-600'
                }`}>
                  By integrating OCR for automated slip reading and AI for dynamic route planning,
                  we provide a seamless experience that replaces traditional, error-prone manual
                  searches with high-precision digital tracing.
                </p>
              </div>
            </article>
          </div>
        </section>

        <section className="mt-20 sm:mt-28">
          <div className="mx-auto max-w-2xl text-center">
            <div className={`mb-4 inline-flex rounded-full border px-4 py-2 text-xs font-bold ${
              isDark
                ? 'border-blue-400/20 bg-blue-500/10 text-blue-300'
                : 'border-blue-200 bg-white text-blue-700 shadow-sm'
            }`}>
              Core Technology
            </div>
            <h2 className={`text-3xl font-black tracking-tight sm:text-4xl ${
              isDark ? 'text-white' : 'text-slate-950'
            }`}>
              Engineered with Precision
            </h2>
            <p className={`mt-3 text-sm sm:text-base ${
              isDark ? 'text-slate-400' : 'text-slate-600'
            }`}>
              Built around the technologies that make AI-ECLT fast, intelligent and dependable.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: <CpuChipIcon className="h-6 w-6" />, title: "AI Core", desc: "Predictive algorithms" },
              { icon: <ShieldCheckIcon className="h-6 w-6" />, title: "Secure OCR", desc: "Data privacy" },
              { icon: <GlobeAltIcon className="h-6 w-6" />, title: "Live Maps", desc: "Real-time sync" },
              { icon: <BoltIcon className="h-6 w-6" />, title: "Ultra Fast", desc: "Low latency" }
            ].map((tech, i) => (
              <div
                key={i}
                className={`group rounded-2xl border p-5 text-center transition-all duration-300 hover:-translate-y-1 sm:p-6 ${
                  isDark
                    ? 'border-white/10 bg-white/[0.04] hover:border-blue-400/20 hover:bg-white/[0.06]'
                    : 'border-slate-200 bg-white shadow-sm hover:border-blue-200 hover:shadow-lg'
                }`}
              >
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500 transition-transform duration-300 group-hover:scale-110">
                  {tech.icon}
                </div>
                <h3 className={`text-sm font-black sm:text-base ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}>
                  {tech.title}
                </h3>
                <p className={`mt-1 text-xs ${
                  isDark ? 'text-slate-400' : 'text-slate-500'
                }`}>
                  {tech.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-20 sm:mt-28">
          <div className="mx-auto max-w-2xl text-center">
            <div className={`mb-4 inline-flex rounded-full border px-4 py-2 text-xs font-bold ${
              isDark
                ? 'border-blue-400/20 bg-blue-500/10 text-blue-300'
                : 'border-blue-200 bg-white text-blue-700 shadow-sm'
            }`}>
              The Architects
            </div>
            <h2 className={`text-3xl font-black tracking-tight sm:text-4xl ${
              isDark ? 'text-white' : 'text-slate-950'
            }`}>
              Meet Our Team
            </h2>
            <p className={`mt-3 text-sm sm:text-base ${
              isDark ? 'text-slate-400' : 'text-slate-600'
            }`}>
              The people behind the vision, product and technology.
            </p>
          </div>

          <div className="mx-auto mt-10 max-w-lg">
            <div className={`relative overflow-hidden rounded-3xl border p-7 text-center sm:p-8 ${
              isDark
                ? 'border-blue-400/20 bg-gradient-to-br from-blue-500/10 to-violet-500/5'
                : 'border-blue-200 bg-gradient-to-br from-blue-50 to-white shadow-lg shadow-blue-100/40'
            }`}>
              <div className="absolute left-1/2 top-0 h-24 w-40 -translate-x-1/2 rounded-full bg-blue-500/10 blur-3xl" />
              <div className="relative">
                <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-600 to-violet-600 shadow-xl shadow-blue-600/20">
                  <AcademicCapIcon className="h-10 w-10 text-white" />
                </div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-500">Project Supervisor</p>
                <h3 className={`mt-2 text-xl font-black ${
                  isDark ? 'text-white' : 'text-slate-950'
                }`}>
                  Prof. Ushna Khalid
                </h3>
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  <span className={`rounded-full px-3 py-1.5 text-xs font-bold ${
                    isDark ? 'bg-blue-500/15 text-blue-300' : 'bg-blue-100 text-blue-700'
                  }`}>
                    Leadership
                  </span>
                  <span className={`rounded-full px-3 py-1.5 text-xs font-bold ${
                    isDark ? 'bg-blue-500/15 text-blue-300' : 'bg-blue-100 text-blue-700'
                  }`}>
                    Academic Excellence
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Members */}
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {team.map((member, i) => (
              <div
                key={i}
                className={`group rounded-2xl border p-6 text-center transition-all duration-300 hover:-translate-y-1 ${
                  isDark
                    ? 'border-white/10 bg-white/[0.04] hover:border-blue-400/20'
                    : 'border-slate-200 bg-white shadow-sm hover:border-blue-200 hover:shadow-lg'
                }`}
              >
                <div className={`mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl transition-all duration-300 ${
                  isDark
                    ? 'bg-slate-900 text-slate-400 group-hover:bg-blue-600 group-hover:text-white'
                    : 'bg-slate-100 text-slate-500 group-hover:bg-blue-600 group-hover:text-white'
                }`}>
                  <UsersIcon className="h-7 w-7" />
                </div>
                <h3 className={`text-base font-black ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}>
                  {member.name}
                </h3>
                <p className={`mt-2 text-xs leading-5 ${
                  isDark ? 'text-slate-400' : 'text-slate-500'
                }`}>
                  {member.role}
                </p>
                <div className="mt-5 flex justify-center">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-lg transition-all ${
                    isDark
                      ? 'bg-white/5 text-slate-400 group-hover:bg-blue-500/10 group-hover:text-blue-400'
                      : 'bg-slate-100 text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-600'
                  }`}>
                    <GlobeAltIcon className="h-4 w-4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
};

export default About;