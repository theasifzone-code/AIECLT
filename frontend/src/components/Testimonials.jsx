import React from 'react';
import { StarIcon } from '@heroicons/react/24/solid';
import {
  SparklesIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';
import { Quote } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const Testimonials = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const testimonials = [
    {
      name: 'Dr. Ahmed Khan',
      role: 'Board Official',
      quote:
        'AI-ECLT has revolutionized how we manage exam centers. The real-time analytics and scheduling features are game-changing.',
      avatar: 'AK',
      color: 'from-blue-500 to-indigo-600',
    },
    {
      name: 'Prof. Sarah Ali',
      role: 'Admin',
      quote:
        'The platform is intuitive and powerful. Managing hundreds of students across multiple centers has never been easier.',
      avatar: 'SA',
      color: 'from-purple-500 to-pink-600',
    },
    {
      name: 'Student Representative',
      role: 'Student',
      quote:
        'Finding exam schedules and notifications has become so simple. The mobile-responsive design is a huge plus.',
      avatar: 'SR',
      color: 'from-emerald-500 to-teal-600',
    },
  ];

  return (
    <section
      id="testimonials"
      className={`relative overflow-hidden py-20 sm:py-24 lg:py-28 px-4 sm:px-6 lg:px-8 transition-colors duration-300 ${
        isDark
          ? 'bg-gray-950 text-white'
          : 'bg-white text-slate-900'
      }`}
    >
    <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
        {/* Grid */}
        <div
          className={`
            absolute inset-0
            opacity-[0.035]
            ${
              isDark
                ? 'bg-[linear-gradient(rgba(255,255,255,.8)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.8)_1px,transparent_1px)]'
                : 'bg-[linear-gradient(rgba(37,99,235,.8)_1px,transparent_1px),linear-gradient(90deg,rgba(37,99,235,.8)_1px,transparent_1px)]'
            }
            [background-size:40px_40px]
          `}
        />

        {/* Glow */}
        <div className="absolute -top-40 left-1/4 w-96 h-96 rounded-full bg-blue-600/10 blur-3xl" />
        <div className="absolute top-1/4 -right-40 w-96 h-96 rounded-full bg-violet-600/10 blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto">

        <div className="max-w-3xl mx-auto text-center mb-14 sm:mb-16">
          <div
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-xs sm:text-sm font-semibold mb-5 ${
              isDark
                ? 'bg-purple-500/10 border-purple-500/20 text-purple-400'
                : 'bg-purple-50 border-purple-200 text-purple-600'
            }`}
          >
            <SparklesIcon className="w-4 h-4" />
            Real User Experiences
          </div>

          <h2
            className={`text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}
          >
            What Our{' '}
            <span className="bg-gradient-to-r from-purple-500 via-fuchsia-500 to-pink-500 bg-clip-text text-transparent">
              Users Say
            </span>
          </h2>

          <p
            className={`mt-5 text-sm sm:text-base lg:text-lg leading-relaxed ${
              isDark ? 'text-gray-400' : 'text-slate-600'
            }`}
          >
            See how AI-ECLT is making exam management easier,
            smarter, and more convenient for everyone.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {testimonials.map((testimonial, index) => (
            <article
              key={testimonial.name}
              className={`group relative overflow-hidden rounded-3xl p-6 sm:p-7 border transition-all duration-300 hover:-translate-y-2 ${
                isDark
                  ? 'bg-white/[0.03] border-white/10 hover:border-purple-500/30 hover:bg-white/[0.05]'
                  : 'bg-white border-slate-200 hover:border-purple-200 hover:shadow-2xl hover:shadow-purple-100/60'
              }`}
            >
              <div
                className={`absolute -top-20 -right-20 w-40 h-40 rounded-full bg-gradient-to-br ${testimonial.color} opacity-0 group-hover:opacity-10 blur-3xl transition-opacity duration-500`}
              />

              {/* Quote */}
              <div
                className={`absolute top-6 right-6 ${
                  isDark ? 'text-white/10' : 'text-slate-100'
                }`}
              >
                <Quote className="w-12 h-12" />
              </div>

              <div className="relative flex items-center gap-4 mb-6">
                <div
                  className={`w-12 h-12 sm:w-14 sm:h-14 shrink-0 rounded-2xl bg-gradient-to-br ${testimonial.color} flex items-center justify-center text-white font-bold text-sm sm:text-base shadow-lg`}
                >
                  {testimonial.avatar}
                </div>

                <div className="min-w-0">
                  <h3
                    className={`font-bold text-sm sm:text-base truncate ${
                      isDark ? 'text-white' : 'text-slate-900'
                    }`}
                  >
                    {testimonial.name}
                  </h3>

                  <p
                    className={`text-xs sm:text-sm mt-0.5 ${
                      isDark ? 'text-gray-500' : 'text-slate-500'
                    }`}
                  >
                    {testimonial.role}
                  </p>
                </div>
              </div>

              {/* Stars */}
              <div className="flex items-center gap-1 mb-5">
                {[...Array(5)].map((_, starIndex) => (
                  <StarIcon
                    key={starIndex}
                    className="w-4 h-4 text-yellow-400"
                  />
                ))}

                <span
                  className={`ml-2 text-xs font-medium ${
                    isDark ? 'text-gray-500' : 'text-slate-400'
                  }`}
                >
                  5.0
                </span>
              </div>

              <p
                className={`relative text-sm sm:text-base leading-7 ${
                  isDark ? 'text-gray-300' : 'text-slate-600'
                }`}
              >
                “{testimonial.quote}”
              </p>

              {/* Bottom Accent */}
              <div
                className={`absolute bottom-0 left-6 right-6 h-px bg-gradient-to-r ${testimonial.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
              />
            </article>
          ))}
        </div>

        <div className="mt-14 sm:mt-16 text-center">
          <p
            className={`text-xs sm:text-sm mb-5 ${
              isDark ? 'text-gray-500' : 'text-slate-500'
            }`}
          >
            Join thousands of students and exam professionals
          </p>

          <button
            type="button"
            className="group inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold text-sm sm:text-base shadow-xl shadow-purple-500/20 hover:shadow-purple-500/30 hover:-translate-y-0.5 transition-all duration-300"
          >
            Get Started Today
            <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

      </div>
    </section>
  );
};

export default Testimonials;
