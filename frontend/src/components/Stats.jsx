// components/Stats.jsx - ✅ Production Level Code
import React from 'react';
import { 
  ChartBarIcon, 
  UserGroupIcon, 
  BuildingOfficeIcon, 
  CheckCircleIcon,
  SparklesIcon,
  ArrowTrendingUpIcon,
  CalendarIcon,
  StarIcon
} from '@heroicons/react/24/outline';

const Stats = () => {
  const stats = [
    {
      icon: BuildingOfficeIcon,
      label: 'Exam Centers',
      value: '50+',
      description: 'Across Pakistan',
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-500/10',
      glowColor: 'shadow-blue-500/20',
      delay: 0,
    },
    {
      icon: CalendarIcon,
      label: 'Active Schedules',
      value: '200+',
      description: 'Upcoming exams',
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-500/10',
      glowColor: 'shadow-purple-500/20',
      delay: 100,
    },
    {
      icon: UserGroupIcon,
      label: 'Registered Students',
      value: '10K+',
      description: 'Active learners',
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-500/10',
      glowColor: 'shadow-green-500/20',
      delay: 200,
    },
    {
      icon: CheckCircleIcon,
      label: 'Success Rate',
      value: '98%',
      description: 'Satisfaction rate',
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-500/10',
      glowColor: 'shadow-orange-500/20',
      delay: 300,
    },
  ];

  return (
    <section className="py-20 px-4 relative overflow-hidden" id="stats">
      {/* ==================== BACKGROUND EFFECTS ==================== */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      </div>

      <div className="container mx-auto max-w-6xl">
        {/* ==================== SECTION HEADER ==================== */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full text-sm text-blue-400 font-medium mb-4">
            <SparklesIcon className="w-4 h-4" />
            Our Impact
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
            Trusted by Thousands
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            Numbers that speak for themselves
          </p>
        </div>

        {/* ==================== STATS GRID ==================== */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="group relative bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 
                  hover:border-white/20 transition-all duration-300 
                  hover:-translate-y-2 hover:shadow-2xl hover:shadow-blue-500/5
                  animate-fade-in"
                style={{ animationDelay: `${stat.delay}ms` }}
              >
                {/* Glow Effect */}
                <div className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r ${stat.color} blur-2xl -z-10`} />
                
                <div className="flex flex-col items-center text-center">
                  {/* Icon */}
                  <div className={`p-3 rounded-xl ${stat.bgColor} mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className={`w-6 h-6 bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`} />
                  </div>
                  
                  {/* Value */}
                  <p className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-1 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:${stat.color} group-hover:bg-clip-text transition">
                    {stat.value}
                  </p>
                  
                  {/* Label */}
                  <p className="text-sm text-gray-400 font-medium">
                    {stat.label}
                  </p>
                  
                  {/* Description */}
                  <p className="text-xs text-gray-500 mt-1">
                    {stat.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* ==================== BOTTOM TEXT ==================== */}
        <div className="text-center mt-10">
          <p className="text-sm text-gray-500 flex items-center justify-center gap-2">
            <ArrowTrendingUpIcon className="w-4 h-4 text-green-400" />
            Growing every day
          </p>
        </div>
      </div>
    </section>
  );
};

export default Stats;