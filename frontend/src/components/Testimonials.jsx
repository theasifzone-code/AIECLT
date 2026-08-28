// components/Testimonials.jsx - ✅ COMPLETE FIXED
import React from 'react';
import { StarIcon } from '@heroicons/react/24/solid';
import { 
  SparklesIcon, 
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import { Quote } from 'lucide-react';

const Testimonials = () => {
  const testimonials = [
    {
      name: 'Dr. Ahmed Khan',
      role: 'Board Official',
      quote: 'AI-ECLT has revolutionized how we manage exam centers. The real-time analytics and scheduling features are game-changing.',
      rating: 5,
      avatar: 'AK',
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-500/10',
      delay: 0,
    },
    {
      name: 'Prof. Sarah Ali',
      role: 'Admin',
      quote: 'The platform is intuitive and powerful. Managing hundreds of students across multiple centers has never been easier.',
      rating: 5,
      avatar: 'SA',
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-500/10',
      delay: 100,
    },
    {
      name: 'Student Representative',
      role: 'Student',
      quote: 'Finding exam schedules and notifications has become so simple. The mobile-responsive design is a huge plus.',
      rating: 5,
      avatar: 'SR',
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-500/10',
      delay: 200,
    },
  ];

  return (
    <section className="py-24 px-4 relative overflow-hidden" id="testimonials">
      {/* Background Effects */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      </div>

      <div className="container mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="text-center mb-16 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-purple-500/10 border border-purple-500/20 rounded-full text-sm text-purple-400 font-medium mb-4">
            <SparklesIcon className="w-4 h-4" />
            Testimonials
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
            What Our{' '}
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Users Say
            </span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            Hear from the people who use AI-ECLT every day to manage exams.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="group relative bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 
                hover:border-white/20 transition-all duration-300 
                hover:-translate-y-2 hover:shadow-2xl hover:shadow-purple-500/5
                animate-fade-in"
              style={{ animationDelay: `${testimonial.delay}ms` }}
            >
              {/* Glow Effect */}
              <div className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r ${testimonial.color} blur-2xl -z-10`} />

              {/* Quote Icon */}
              <div className="absolute top-4 right-4 opacity-10 group-hover:opacity-20 transition">
                <Quote className="w-10 h-10 text-white" />
              </div>

              <div className="flex items-center gap-3 mb-4">
                {/* Avatar */}
                <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${testimonial.color} flex items-center justify-center text-white font-bold text-sm shadow-lg`}>
                  {testimonial.avatar}
                </div>
                <div>
                  <p className="font-medium text-white">{testimonial.name}</p>
                  <p className="text-xs text-gray-400">{testimonial.role}</p>
                </div>
              </div>

              {/* Rating */}
              <div className="flex gap-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <StarIcon key={i} className="w-4 h-4 text-yellow-400" />
                ))}
              </div>

              {/* Quote */}
              <p className="text-sm text-gray-300 leading-relaxed">
                "{testimonial.quote}"
              </p>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12">
          <p className="text-sm text-gray-500 mb-4">
            Join thousands of satisfied users
          </p>
          <button className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl transition shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 text-sm font-medium group">
            Get Started Today
            <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;