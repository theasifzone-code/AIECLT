
import React from 'react';
import { Link } from 'react-router-dom';
import {
  MapPin,
  Mail,
  Phone,
  Facebook,
  Twitter,
  Linkedin,
  Github,
  ArrowUpRight,
  Heart,
} from 'lucide-react';

import { useTheme } from '../context/ThemeContext';

const Footer = () => {
  const { theme } = useTheme();
  const currentYear = new Date().getFullYear();

  const isDark = theme === 'dark';

  const quickLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Student Portal', path: '/student' },
    { name: 'Features', path: '/features' },
    { name: 'Contact', path: '/contact' },
  ];

  const features = [
    'AI Route Suggestions',
    'Live Traffic Updates',
    'OCR Technology',
    'Centralized Management',
  ];

  const socialLinks = [
    {
      Icon: Facebook,
      href: '#',
      label: 'Facebook',
    },
    {
      Icon: Twitter,
      href: '#',
      label: 'Twitter',
    },
    {
      Icon: Linkedin,
      href: '#',
      label: 'LinkedIn',
    },
    {
      Icon: Github,
      href: '#',
      label: 'GitHub',
    },
  ];

  return (
    <footer
      className={`
        relative overflow-hidden
        border-t
        transition-colors duration-300
        ${
          isDark
            ? 'bg-gray-950 border-white/10 text-gray-300'
            : 'bg-slate-50 border-slate-200 text-slate-600'
        }
      `}
    >

      <div
        className={`
          absolute inset-0
          pointer-events-none
          opacity-[0.035]
          ${
            isDark
              ? 'bg-[linear-gradient(rgba(255,255,255,.8)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.8)_1px,transparent_1px)]'
              : 'bg-[linear-gradient(rgba(37,99,235,.8)_1px,transparent_1px),linear-gradient(90deg,rgba(37,99,235,.8)_1px,transparent_1px)]'
          }
          [background-size:40px_40px]
        `}
      />

      <div
        className="
          absolute
          -top-32
          left-1/4
          w-72 h-72
          bg-blue-600/10
          rounded-full
          blur-3xl
          pointer-events-none
        "
      />

      <div
        className="
          absolute
          bottom-0
          right-0
          w-80 h-80
          bg-indigo-600/10
          rounded-full
          blur-3xl
          pointer-events-none
        "
      />



      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="py-12 sm:py-14 lg:py-16">

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8">
            <div className="sm:col-span-2 lg:col-span-5">

              <Link
                to="/"
                className="inline-flex items-center gap-3 group"
              >
                <div
                  className="
                    relative
                    w-11 h-11
                    rounded-2xl
                    flex items-center justify-center
                    bg-gradient-to-br
                    from-blue-600
                    via-indigo-600
                    to-violet-600
                    shadow-lg
                    shadow-blue-600/20
                    group-hover:scale-105
                    transition-transform duration-300
                  "
                >
                  <MapPin className="w-6 h-6 text-white" />

                  <span
                    className="
                      absolute
                      -bottom-1
                      -right-1
                      w-3.5 h-3.5
                      rounded-full
                      bg-cyan-400
                      border-2
                      border-white
                      dark:border-gray-950
                    "
                  />
                </div>

                <div className="leading-none">
                  <div className="flex items-center gap-2">
                    <span
                      className={`
                        text-xl
                        font-black
                        tracking-tight
                        ${
                          isDark
                            ? 'text-white'
                            : 'text-slate-900'
                        }
                      `}
                    >
                      AI-ECLT
                    </span>

                    <span
                      className="
                        px-1.5 py-0.5
                        rounded-md
                        bg-blue-500/10
                        text-blue-500
                        text-[8px]
                        font-bold
                        tracking-wider
                      "
                    >
                      AI
                    </span>
                  </div>

                  <span
                    className={`
                      block
                      mt-1
                      text-[9px]
                      font-medium
                      tracking-wide
                      ${
                        isDark
                          ? 'text-gray-500'
                          : 'text-slate-500'
                      }
                    `}
                  >
                    Exam Center Tracer
                  </span>
                </div>
              </Link>
              <p
                className={`
                  mt-5
                  max-w-md
                  text-sm
                  leading-7
                  ${
                    isDark
                      ? 'text-gray-400'
                      : 'text-slate-500'
                  }
                `}
              >
                AI-powered Examination Center Location Tracer
                designed to make exam-center discovery,
                navigation, and management simpler for students
                and administrators.
              </p>
              <div className="flex items-center gap-2 mt-6">
                {socialLinks.map(
                  ({ Icon, href, label }) => (
                    <a
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={label}
                      className={`
                        group
                        w-10 h-10
                        rounded-xl
                        border
                        flex items-center justify-center
                        transition-all duration-200
                        hover:-translate-y-1
                        ${
                          isDark
                            ? 'bg-white/[0.04] border-white/10 text-gray-500 hover:text-white hover:border-blue-500/50 hover:bg-blue-500/10'
                            : 'bg-white border-slate-200 text-slate-500 hover:text-blue-600 hover:border-blue-300 shadow-sm'
                        }
                      `}
                    >
                      <Icon
                        size={17}
                        className="transition-transform group-hover:scale-110"
                      />
                    </a>
                  )
                )}
              </div>
            </div>

            <div className="lg:col-span-2">

              <h3
                className={`
                  mb-5
                  text-[11px]
                  font-black
                  uppercase
                  tracking-[0.18em]
                  ${
                    isDark
                      ? 'text-blue-400'
                      : 'text-blue-600'
                  }
                `}
              >
                Quick Links
              </h3>

              <ul className="space-y-3">
                {quickLinks.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.path}
                      className={`
                        group
                        inline-flex
                        items-center
                        gap-1
                        text-sm
                        transition-all duration-200
                        hover:translate-x-1
                        ${
                          isDark
                            ? 'text-gray-400 hover:text-white'
                            : 'text-slate-500 hover:text-slate-900'
                        }
                      `}
                    >
                      <span>{link.name}</span>

                      <ArrowUpRight
                        className="
                          w-3.5 h-3.5
                          opacity-0
                          -translate-y-0.5
                          -translate-x-1
                          transition-all
                          group-hover:opacity-100
                          group-hover:translate-x-0
                        "
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="lg:col-span-2">

              <h3
                className={`
                  mb-5
                  text-[11px]
                  font-black
                  uppercase
                  tracking-[0.18em]
                  ${
                    isDark
                      ? 'text-blue-400'
                      : 'text-blue-600'
                  }
                `}
              >
                Features
              </h3>

              <ul className="space-y-3">
                {features.map((feature) => (
                  <li
                    key={feature}
                    className={`
                      flex
                      items-start
                      gap-2.5
                      text-sm
                      ${
                        isDark
                          ? 'text-gray-400'
                          : 'text-slate-500'
                      }
                    `}
                  >
                    <span
                      className="
                        mt-2
                        w-1.5 h-1.5
                        rounded-full
                        bg-blue-500
                        shrink-0
                      "
                    />

                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="lg:col-span-3">
              <h3
                className={`
                  mb-5
                  text-[11px]
                  font-black
                  uppercase
                  tracking-[0.18em]
                  ${
                    isDark
                      ? 'text-blue-400'
                      : 'text-blue-600'
                  }
                `}
              >
                Contact
              </h3>

              <div className="space-y-3">

                {/* Email */}
                <a
                  href="mailto:support@ai-eclt.edu"
                  className={`
                    group
                    flex
                    items-center
                    gap-3
                    p-2.5
                    rounded-xl
                    transition-all
                    ${
                      isDark
                        ? 'hover:bg-white/[0.04]'
                        : 'hover:bg-white'
                    }
                  `}
                >
                  <div
                    className={`
                      w-9 h-9
                      rounded-lg
                      flex items-center justify-center
                      border
                      shrink-0
                      ${
                        isDark
                          ? 'bg-white/[0.04] border-white/10 text-gray-500 group-hover:text-blue-400'
                          : 'bg-white border-slate-200 text-slate-500 shadow-sm group-hover:text-blue-600'
                      }
                    `}
                  >
                    <Mail size={15} />
                  </div>

                  <div className="min-w-0">
                    <span
                      className={`
                        block
                        text-[10px]
                        font-semibold
                        uppercase
                        tracking-wider
                        ${
                          isDark
                            ? 'text-gray-600'
                            : 'text-slate-400'
                        }
                      `}
                    >
                      Email
                    </span>

                    <span
                      className={`
                        block
                        text-sm
                        truncate
                        ${
                          isDark
                            ? 'text-gray-300'
                            : 'text-slate-600'
                        }
                      `}
                    >
                      support@ai-eclt.edu
                    </span>
                  </div>
                </a>

                {/* Phone */}
                <a
                  href="tel:+923001234567"
                  className={`
                    group
                    flex
                    items-center
                    gap-3
                    p-2.5
                    rounded-xl
                    transition-all
                    ${
                      isDark
                        ? 'hover:bg-white/[0.04]'
                        : 'hover:bg-white'
                    }
                  `}
                >
                  <div
                    className={`
                      w-9 h-9
                      rounded-lg
                      flex items-center justify-center
                      border
                      shrink-0
                      ${
                        isDark
                          ? 'bg-white/[0.04] border-white/10 text-gray-500 group-hover:text-blue-400'
                          : 'bg-white border-slate-200 text-slate-500 shadow-sm group-hover:text-blue-600'
                      }
                    `}
                  >
                    <Phone size={15} />
                  </div>

                  <div>
                    <span
                      className={`
                        block
                        text-[10px]
                        font-semibold
                        uppercase
                        tracking-wider
                        ${
                          isDark
                            ? 'text-gray-600'
                            : 'text-slate-400'
                        }
                      `}
                    >
                      Phone
                    </span>

                    <span
                      className={`
                        block
                        text-sm
                        ${
                          isDark
                            ? 'text-gray-300'
                            : 'text-slate-600'
                        }
                      `}
                    >
                      +92 300 1234567
                    </span>
                  </div>
                </a>

                {/* Location */}
                <div
                  className={`
                    flex
                    items-center
                    gap-3
                    p-2.5
                    rounded-xl
                    ${
                      isDark
                        ? 'hover:bg-white/[0.04]'
                        : 'hover:bg-white'
                    }
                  `}
                >
                  <div
                    className={`
                      w-9 h-9
                      rounded-lg
                      flex items-center justify-center
                      border
                      shrink-0
                      ${
                        isDark
                          ? 'bg-white/[0.04] border-white/10 text-gray-500'
                          : 'bg-white border-slate-200 text-slate-500 shadow-sm'
                      }
                    `}
                  >
                    <MapPin size={15} />
                  </div>

                  <div>
                    <span
                      className={`
                        block
                        text-[10px]
                        font-semibold
                        uppercase
                        tracking-wider
                        ${
                          isDark
                            ? 'text-gray-600'
                            : 'text-slate-400'
                        }
                      `}
                    >
                      Location
                    </span>

                    <span
                      className={`
                        block
                        text-sm
                        ${
                          isDark
                            ? 'text-gray-300'
                            : 'text-slate-600'
                        }
                      `}
                    >
                      Islamabad, Pakistan
                    </span>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
        <div
          className={`
            border-t
            py-6
            ${
              isDark
                ? 'border-white/10'
                : 'border-slate-200'
            }
          `}
        >
          <div
            className="
              flex
              flex-col
              md:flex-row
              items-center
              justify-between
              gap-4
            "
          >
            <p
              className={`
                text-[11px]
                sm:text-xs
                text-center
                md:text-left
                leading-relaxed
                ${
                  isDark
                    ? 'text-gray-500'
                    : 'text-slate-400'
                }
              `}
            >
              © {currentYear} AI-ECLT. All rights reserved.
            </p>

            {/* Team */}
            <p
              className={`
                text-[11px]
                sm:text-xs
                text-center
                ${
                  isDark
                    ? 'text-gray-500'
                    : 'text-slate-400'
                }
              `}
            >
              Developed with{' '}
              <Heart
                className="
                  inline
                  w-3 h-3
                  mx-0.5
                  text-red-500
                  fill-current
                "
              />{' '}
              by{' '}
              <span
                className={`
                  font-semibold
                  ${
                    isDark
                      ? 'text-gray-300'
                      : 'text-slate-600'
                  }
                `}
              >
                Muhammad Asif, Muhammad Omer,
                Huzaifa Hanif & Anees Ahmad
              </span>
            </p>

            {/* Supervisor */}
            <p
              className={`
                text-[11px]
                sm:text-xs
                text-center
                md:text-right
                ${
                  isDark
                    ? 'text-gray-500'
                    : 'text-slate-400'
                }
              `}
            >
              Supervised by{' '}
              <span
                className={`
                  font-semibold
                  ${
                    isDark
                      ? 'text-gray-300'
                      : 'text-slate-600'
                  }
                `}
              >
                Prof. Ushna Khalid
              </span>
            </p>

          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
