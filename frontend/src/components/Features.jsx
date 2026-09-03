
import React from 'react';
import { Link } from 'react-router-dom';

import {
  SparklesIcon,
  MapPinIcon,
  CalendarIcon,
  UserIcon,
  StarIcon,
  ArrowRightIcon,
  CameraIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  RocketLaunchIcon,
  BellIcon,
  CheckCircleIcon,
  ArrowUpRightIcon,
} from '@heroicons/react/24/outline';

import { useTheme } from '../context/ThemeContext';

const Features = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const mainFeatures = [
    {
      icon: CameraIcon,
      title: 'AI-Powered OCR',
      description:
        'Upload your roll number slip and let AI automatically detect your examination center without manual searching.',
      iconColor: 'text-blue-500',
      iconBg: 'bg-blue-500/10',
      border: 'border-blue-500/20',
      glow: 'group-hover:shadow-blue-500/10',
    },
    {
      icon: MapPinIcon,
      title: 'Smart Route Finder',
      description:
        'Get intelligent route suggestions with distance, estimated arrival time, and traffic information.',
      iconColor: 'text-emerald-500',
      iconBg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
      glow: 'group-hover:shadow-emerald-500/10',
    },
    {
      icon: CalendarIcon,
      title: 'Schedule Management',
      description:
        'View and manage examination schedules while administrators can create, update, or cancel schedules.',
      iconColor: 'text-violet-500',
      iconBg: 'bg-violet-500/10',
      border: 'border-violet-500/20',
      glow: 'group-hover:shadow-violet-500/10',
    },
    {
      icon: BellIcon,
      title: 'Instant Notifications',
      description:
        'Stay informed with real-time notifications about exam changes, schedules, and important announcements.',
      iconColor: 'text-amber-500',
      iconBg: 'bg-amber-500/10',
      border: 'border-amber-500/20',
      glow: 'group-hover:shadow-amber-500/10',
    },
    {
      icon: ChartBarIcon,
      title: 'Analytics Dashboard',
      description:
        'Access useful analytics and statistics that help administrators make smarter, data-driven decisions.',
      iconColor: 'text-orange-500',
      iconBg: 'bg-orange-500/10',
      border: 'border-orange-500/20',
      glow: 'group-hover:shadow-orange-500/10',
    },
    {
      icon: ShieldCheckIcon,
      title: 'Secure & Reliable',
      description:
        'Built with secure authentication and protected data handling to keep your examination information safe.',
      iconColor: 'text-rose-500',
      iconBg: 'bg-rose-500/10',
      border: 'border-rose-500/20',
      glow: 'group-hover:shadow-rose-500/10',
    },
  ];

  const howItWorks = [
    {
      step: '01',
      title: 'Upload Slip',
      description:
        'Upload your roll number slip or enter your examination center code manually.',
      icon: CameraIcon,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
    },
    {
      step: '02',
      title: 'AI Detection',
      description:
        'Our AI analyzes the uploaded information and identifies your exam center.',
      icon: SparklesIcon,
      color: 'text-violet-500',
      bg: 'bg-violet-500/10',
    },
    {
      step: '03',
      title: 'Get Route',
      description:
        'Receive route suggestions with distance, estimated time, and navigation details.',
      icon: MapPinIcon,
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10',
    },
    {
      step: '04',
      title: 'Stay Updated',
      description:
        'Receive notifications whenever there are important examination updates.',
      icon: BellIcon,
      color: 'text-amber-500',
      bg: 'bg-amber-500/10',
    },
  ];

  const stats = [
    {
      icon: MapPinIcon,
      value: '50+',
      label: 'Exam Centers',
      color: 'text-blue-500',
    },
    {
      icon: CalendarIcon,
      value: '200+',
      label: 'Schedules',
      color: 'text-violet-500',
    },
    {
      icon: UserIcon,
      value: '10K+',
      label: 'Students',
      color: 'text-emerald-500',
    },
    {
      icon: StarIcon,
      value: '98%',
      label: 'Satisfaction',
      color: 'text-amber-500',
    },
  ];

  return (
    <main
      className={`
        min-h-screen
        overflow-hidden
        transition-colors duration-300
        ${isDark
          ? 'bg-gray-950 text-white'
          : 'bg-white text-slate-900'
        }
      `}
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

        {/* Glow */}
        <div className="absolute -top-40 left-1/4 w-96 h-96 rounded-full bg-blue-600/10 blur-3xl" />
        <div className="absolute top-1/4 -right-40 w-96 h-96 rounded-full bg-violet-600/10 blur-3xl" />
      </div>


      <section className="relative pt-20 sm:pt-24 lg:pt-28 pb-16 sm:pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">

          <div className="flex justify-center">
            <div
              className={`
                inline-flex
                items-center
                gap-2
                px-4 py-2
                rounded-full
                border
                text-xs sm:text-sm
                font-semibold
                ${isDark
                  ? 'bg-blue-500/10 border-blue-500/20 text-blue-400'
                  : 'bg-blue-50 border-blue-200 text-blue-600 shadow-sm'
                }
              `}
            >
              <RocketLaunchIcon className="w-4 h-4" />
              Powerful AI Features
            </div>
          </div>

          <div className="text-center mt-6 sm:mt-7">
            <h1
              className="
                text-4xl
                sm:text-5xl
                md:text-6xl
                lg:text-7xl
                font-black
                tracking-tight
                leading-[1.05]
              "
            >
              <span className="bg-gradient-to-r from-blue-600 via-violet-500 to-pink-500 bg-clip-text text-transparent">
                Everything You Need
              </span>

              <br />

              <span
                className={
                  isDark ? 'text-white' : 'text-slate-900'
                }
              >
                To Ace Your Exams
              </span>
            </h1>

            <p
              className={`
                mt-6
                max-w-3xl
                mx-auto
                text-sm
                sm:text-base
                lg:text-lg
                leading-7
                sm:leading-8
                ${isDark
                  ? 'text-gray-400'
                  : 'text-slate-500'
                }
              `}
            >
              From AI-powered OCR and smart route planning to
              real-time notifications and analytics, AI-ECLT
              brings everything together to simplify the
              examination experience.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-2.5 sm:gap-3 mt-8">
            {[
              'AI Powered',
              'Real-Time',
              'Secure',
              'Easy to Use',
            ].map((item) => (
              <div
                key={item}
                className={`
                  flex items-center gap-1.5
                  px-3 py-1.5
                  rounded-full
                  border
                  text-[11px] sm:text-xs
                  font-medium
                  ${isDark
                    ? 'bg-white/[0.03] border-white/10 text-gray-400'
                    : 'bg-slate-50 border-slate-200 text-slate-500'
                  }
                `}
              >
                <CheckCircleIcon className="w-3.5 h-3.5 text-emerald-500" />
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>


      <section className="relative py-14 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10 sm:mb-12">
            <div className='max-w-6xl mx-auto'>
              <div className="flex justify-center">
                <div
                  className={`
                inline-flex
                items-center
                gap-2
                px-4 py-2
                rounded-full
                border
                text-xs sm:text-sm
                font-semibold
                ${isDark
                      ? 'bg-blue-500/10 border-blue-500/20 text-blue-400'
                      : 'bg-blue-50 border-blue-200 text-blue-600 shadow-sm'
                    }
              `}
                >
                  <RocketLaunchIcon className="w-4 h-4" />
                  Core Features
                </div>
              </div>

              {/* <p
              className={`
                mt-6
                max-w-3xl
                mx-auto
                text-sm
                sm:text-base
                lg:text-lg
                leading-7
                sm:leading-8
                ${isDark
                  ? 'text-gray-400'
                  : 'text-slate-500'
                }
              `}
              >
                Everything is designed to reduce confusion,
                save time, and help students reach the right
                examination center with confidence.
              </p> */}
            </div>


          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {mainFeatures.map((feature, index) => {
              const Icon = feature.icon;

              return (
                <div
                  key={feature.title}
                  className={`
                    group
                    relative
                    overflow-hidden
                    rounded-3xl
                    border
                    p-6
                    sm:p-7
                    transition-all
                    duration-300
                    hover:-translate-y-1.5
                    hover:shadow-xl
                    ${feature.glow}
                    ${isDark
                      ? 'bg-white/[0.025] border-white/10 hover:bg-white/[0.045]'
                      : 'bg-slate-50/80 border-slate-200 hover:bg-white shadow-sm'
                    }
                  `}
                >
                  {/* Number */}
                  <span
                    className={`
                      absolute
                      top-5
                      right-6
                      text-[10px]
                      font-bold
                      ${isDark
                        ? 'text-gray-700'
                        : 'text-slate-300'
                      }
                    `}
                  >
                    0{index + 1}
                  </span>

                  <div
                    className={`
                      absolute
                      -right-10
                      -top-10
                      w-28 h-28
                      rounded-full
                      blur-3xl
                      opacity-0
                      group-hover:opacity-100
                      transition-opacity
                      ${feature.iconColor
                        .replace('text-', 'bg-')
                      }
                    `}
                  />

                  <div
                    className={`
                      relative
                      w-12 h-12
                      rounded-2xl
                      flex items-center justify-center
                      border
                      mb-6
                      ${feature.iconBg}
                      ${feature.border}
                    `}
                  >
                    <Icon
                      className={`w-6 h-6 ${feature.iconColor}`}
                    />
                  </div>

                  <h3
                    className={`
                      text-lg
                      sm:text-xl
                      font-bold
                      mb-2.5
                      ${isDark
                        ? 'text-white'
                        : 'text-slate-900'
                      }
                    `}
                  >
                    {feature.title}
                  </h3>

                  <p
                    className={`
                      text-sm
                      leading-6
                      ${isDark
                        ? 'text-gray-400'
                        : 'text-slate-500'
                      }
                    `}
                  >
                    {feature.description}
                  </p>
                  <div
                    className={`
                      mt-6
                      h-px
                      w-10
                      group-hover:w-full
                      transition-all
                      duration-500
                      ${isDark
                        ? 'bg-white/10'
                        : 'bg-slate-200'
                      }
                    `}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </section>
      <section className="relative py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">

          <div className="text-center mb-12 sm:mb-14">
            <span
              className="
                text-xs
                font-bold
                uppercase
                tracking-[0.2em]
                text-violet-500
              "
            >
              Simple Process
            </span>

            <h2
              className={`
                mt-2
                text-3xl
                sm:text-4xl
                font-black
                tracking-tight
                ${isDark
                  ? 'text-white'
                  : 'text-slate-900'
                }
              `}
            >
              How It Works
            </h2>

            <p
              className={`
                mt-3
                max-w-2xl
                mx-auto
                text-sm sm:text-base
                ${isDark
                  ? 'text-gray-400'
                  : 'text-slate-500'
                }
              `}
            >
              Four simple steps from your roll number slip
              to your examination center.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

            {howItWorks.map((step, index) => {
              const Icon = step.icon;

              return (
                <div
                  key={step.step}
                  className={`
                    relative
                    rounded-3xl
                    border
                    p-6
                    text-center
                    transition-all
                    duration-300
                    hover:-translate-y-1
                    ${isDark
                      ? 'bg-white/[0.025] border-white/10'
                      : 'bg-white border-slate-200 shadow-sm'
                    }
                  `}
                >
                  <div
                    className={`
                      w-12 h-12
                      mx-auto
                      mt-5
                      rounded-2xl
                      flex items-center justify-center
                      ${step.bg}
                    `}
                  >
                    <Icon
                      className={`w-6 h-6 ${step.color}`}
                    />
                  </div>

                  <h3
                    className={`
                      mt-4
                      text-lg
                      font-bold
                      ${isDark
                        ? 'text-white'
                        : 'text-slate-900'
                      }
                    `}
                  >
                    {step.title}
                  </h3>

                  <p
                    className={`
                      mt-2
                      text-xs
                      sm:text-sm
                      leading-6
                      ${isDark
                        ? 'text-gray-500'
                        : 'text-slate-500'
                      }
                    `}
                  >
                    {step.description}
                  </p>
                  {index < howItWorks.length - 1 && (
                    <div
                      className="
                        hidden lg:block
                        absolute
                        top-11
                        -right-4
                        z-10
                        w-8
                        border-t
                        border-dashed
                        border-blue-500/20
                      "
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>
      <section className="py-14 sm:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">

          <div
            className={`
              grid
              grid-cols-2
              lg:grid-cols-4
              overflow-hidden
              rounded-3xl
              border
              ${isDark
                ? 'bg-white/[0.025] border-white/10'
                : 'bg-slate-50 border-slate-200'
              }
            `}
          >
            {stats.map((stat, index) => {
              const Icon = stat.icon;

              return (
                <div
                  key={stat.label}
                  className={`
                    relative
                    p-6
                    sm:p-8
                    text-center
                    transition-colors
                    ${index < 2
                      ? 'border-b'
                      : ''
                    }
                    lg:border-b-0
                    ${index % 2 === 0
                      ? 'border-r'
                      : ''
                    }
                    lg:border-r
                    last:border-r-0
                    ${isDark
                      ? 'border-white/10 hover:bg-white/[0.03]'
                      : 'border-slate-200 hover:bg-white'
                    }
                  `}
                >
                  <Icon
                    className={`w-6 h-6 mx-auto mb-3 ${stat.color}`}
                  />

                  <p
                    className={`
                      text-3xl
                      sm:text-4xl
                      font-black
                      tracking-tight
                      ${isDark
                        ? 'text-white'
                        : 'text-slate-900'
                      }
                    `}
                  >
                    {stat.value}
                  </p>

                  <p
                    className={`
                      mt-1
                      text-xs
                      sm:text-sm
                      font-medium
                      ${isDark
                        ? 'text-gray-500'
                        : 'text-slate-500'
                      }
                    `}
                  >
                    {stat.label}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
      <section className="relative py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">

          <div
            className={`
              relative
              overflow-hidden
              rounded-[2rem]
              sm:rounded-[2.5rem]
              border
              px-6
              py-12
              sm:px-10
              sm:py-16
              lg:px-16
              text-center
              ${isDark
                ? 'bg-gradient-to-br from-blue-950/50 via-gray-900 to-violet-950/40 border-blue-500/10'
                : 'bg-gradient-to-br from-blue-50 via-white to-violet-50 border-blue-100 shadow-xl shadow-blue-100/40'
              }
            `}
          >
            <div
              className="
                absolute
                -top-32
                left-1/2
                -translate-x-1/2
                w-80 h-80
                rounded-full
                bg-blue-500/10
                blur-3xl
              "
            />

            <div className="relative">



              <h2
                className={`
                  mt-6
                  text-3xl
                  sm:text-4xl
                  lg:text-5xl
                  font-black
                  tracking-tight
                  ${isDark
                    ? 'text-white'
                    : 'text-slate-900'
                  }
                `}
              >
                Ready to Experience
                <span className="block text-blue-600">
                  AI-ECLT?
                </span>
              </h2>

              <p
                className={`
                  mt-4
                  max-w-2xl
                  mx-auto
                  text-sm
                  sm:text-base
                  leading-7
                  ${isDark
                    ? 'text-gray-400'
                    : 'text-slate-500'
                  }
                `}
              >
                Join students and institutions using AI-ECLT
                to simplify examination center discovery,
                navigation, scheduling, and management.
              </p>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 mt-8">

                <Link
                  to="/register"
                  className="
                    group
                    inline-flex
                    items-center
                    justify-center
                    gap-2
                    px-7
                    py-3.5
                    rounded-xl
                    bg-blue-600
                    hover:bg-blue-700
                    text-white
                    text-sm
                    font-semibold
                    shadow-lg
                    shadow-blue-600/20
                    transition-all
                    duration-200
                    hover:-translate-y-0.5
                    active:scale-[0.98]
                  "
                >
                  Create Account

                  <ArrowRightIcon
                    className="
                      w-4 h-4
                      transition-transform
                      group-hover:translate-x-1
                    "
                  />
                </Link>

                <Link
                  to="/contact"
                  className={`
                    group
                    inline-flex
                    items-center
                    justify-center
                    gap-2
                    px-7
                    py-3.5
                    rounded-xl
                    border
                    text-sm
                    font-semibold
                    transition-all
                    duration-200
                    hover:-translate-y-0.5
                    ${isDark
                      ? 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm'
                    }
                  `}
                >
                  Contact Us

                  <ArrowUpRightIcon
                    className="
                      w-4 h-4
                      transition-transform
                      group-hover:translate-x-0.5
                      group-hover:-translate-y-0.5
                    "
                  />
                </Link>
              </div>

              {/* Small trust text */}
              <div
                className={`
                  flex
                  flex-wrap
                  justify-center
                  gap-x-5
                  gap-y-2
                  mt-7
                  text-[11px]
                  ${isDark
                    ? 'text-gray-500'
                    : 'text-slate-400'
                  }
                `}
              >
                <span className="flex items-center gap-1.5">
                  <CheckCircleIcon className="w-3.5 h-3.5 text-emerald-500" />
                  Easy to use
                </span>

                <span className="flex items-center gap-1.5">
                  <CheckCircleIcon className="w-3.5 h-3.5 text-emerald-500" />
                  Smart navigation
                </span>

                <span className="flex items-center gap-1.5">
                  <CheckCircleIcon className="w-3.5 h-3.5 text-emerald-500" />
                  Real-time updates
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Features;
