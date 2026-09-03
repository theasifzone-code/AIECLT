import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  MapPinIcon, 
  EnvelopeIcon, 
  PhoneIcon, 
  ClockIcon,
  UserIcon,
  ChatBubbleLeftRightIcon,
  PaperAirplaneIcon,
  CheckCircleIcon,
  QuestionMarkCircleIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import { useTheme } from '../context/ThemeContext';

const Contact = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const contactInfo = [
    {
      icon: MapPinIcon,
      title: 'Our Location',
      description: 'Lahore, Pakistan',
      color: 'text-blue-500'
    },
    {
      icon: EnvelopeIcon,
      title: 'Email Us',
      description: 'support@ai-eclt.edu',
      color: 'text-purple-500'
    },
    {
      icon: PhoneIcon,
      title: 'Call Us',
      description: '+92 300 1234567',
      color: 'text-emerald-500'
    },
    {
      icon: ClockIcon,
      title: 'Working Hours',
      description: 'Mon - Fri: 9AM - 5PM',
      color: 'text-amber-500'
    }
  ];

  const faqs = [
    {
      question: 'How does AI-ECLT work?',
      answer: 'AI-ECLT uses AI-powered OCR to detect exam centers from roll number slips, and provides real-time route suggestions and schedules for students and administrators.'
    },
    {
      question: 'Is AI-ECLT free to use?',
      answer: 'Yes, AI-ECLT is completely free for students. Institutions can contact us for customized enterprise solutions.'
    },
    {
      question: 'Can I manage multiple exam centers?',
      answer: 'Absolutely! Our platform is designed to handle multiple centers, schedules, and notifications efficiently.'
    },
    {
      question: 'How do I get support?',
      answer: 'You can contact us through this form, email us at support@ai-eclt.edu, or call us at +92 300 1234567.'
    }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: '', email: '', subject: '', message: '' });
    }, 3000);
  };

  return (
    <div className={`min-h-screen overflow-x-hidden transition-colors duration-300 ${
      isDark
        ? 'bg-slate-950 text-white'
        : 'bg-slate-50 text-slate-900'
    }`}>
      <section className="relative isolate overflow-hidden px-4 pb-14 pt-24 sm:px-6 sm:pb-20 sm:pt-28 lg:px-8">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className={`absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full blur-3xl ${
            isDark ? 'bg-blue-600/15' : 'bg-blue-300/30'
          }`} />
          <div className={`absolute -left-24 top-24 h-64 w-64 rounded-full blur-3xl ${
            isDark ? 'bg-purple-600/10' : 'bg-purple-300/20'
          }`} />
          <div className={`absolute -right-24 top-16 h-64 w-64 rounded-full blur-3xl ${
            isDark ? 'bg-cyan-600/10' : 'bg-cyan-300/20'
          }`} />
          <div className={`absolute inset-x-0 top-0 h-px ${
            isDark ? 'bg-white/10' : 'bg-slate-200'
          }`} />
        </div>

        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-3xl text-center">
            <div className={`mx-auto mb-5 inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-bold tracking-wide shadow-sm backdrop-blur ${
              isDark
                ? 'border-blue-400/20 bg-blue-500/10 text-blue-300'
                : 'border-blue-200 bg-white/80 text-blue-700'
            }`}>
              <span className="flex h-2 w-2 rounded-full bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.8)]" />
              AI-ECLT Support Center
            </div>

            <h1 className={`text-4xl font-black leading-[1.05] tracking-tight sm:text-5xl md:text-6xl lg:text-7xl ${
              isDark ? 'text-white' : 'text-slate-950'
            }`}>
              Let's build a better
              <span className="block bg-gradient-to-r from-blue-600 via-violet-500 to-fuchsia-500 bg-clip-text text-transparent">
                exam experience.
              </span>
            </h1>

            <p className={`mx-auto mt-6 max-w-2xl text-sm leading-7 sm:text-base sm:leading-8 ${
              isDark ? 'text-slate-400' : 'text-slate-600'
            }`}>
              Have a question, need support, or want to learn more about AI-ECLT?
              Send us a message and our team will help you get moving.
            </p>
          </div>
        </div>
      </section>

      <section className="px-4 py-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {contactInfo.map((info, i) => (
              <div
                key={i}
                className={`group rounded-2xl border p-5 transition-all duration-300 hover:-translate-y-1 ${
                  isDark
                    ? 'border-white/10 bg-white/[0.04] hover:border-blue-400/20 hover:bg-white/[0.06]'
                    : 'border-slate-200/80 bg-white shadow-sm hover:border-blue-200 hover:shadow-lg hover:shadow-blue-100/50'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                    isDark ? 'bg-white/[0.06]' : 'bg-slate-100'
                  }`}>
                    <info.icon className={`h-5 w-5 ${info.color}`} />
                  </div>
                  <div className="min-w-0">
                    <h3 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {info.title}
                    </h3>
                    <p className={`mt-0.5 truncate text-xs sm:text-sm ${
                      isDark ? 'text-slate-400' : 'text-slate-600'
                    }`}>
                      {info.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="grid items-stretch gap-6 lg:grid-cols-[1.08fr_.92fr]">
            {/* Contact Form */}
            <div className={`relative overflow-hidden rounded-3xl border p-6 sm:p-8 lg:p-10 ${
              isDark
                ? 'border-white/10 bg-white/[0.04]'
                : 'border-slate-200 bg-white shadow-xl shadow-slate-200/50'
            }`}>
              <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-blue-500/10 blur-3xl" />

              <div className="relative">
                <div className="mb-7">
                  <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-blue-500">
                    Contact our team
                  </p>
                  <h2 className={`text-2xl font-black tracking-tight sm:text-3xl ${
                    isDark ? 'text-white' : 'text-slate-950'
                  }`}>
                    Send us a message
                  </h2>
                  <p className={`mt-2 max-w-lg text-sm leading-6 ${
                    isDark ? 'text-slate-400' : 'text-slate-500'
                  }`}>
                    Tell us what you need. We’ll get back to you as soon as possible.
                  </p>
                </div>

                {submitted ? (
                  <div className="flex min-h-[360px] flex-col items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-8 text-center">
                    <div className="mb-4 rounded-full bg-emerald-500/15 p-3">
                      <CheckCircleIcon className="h-10 w-10 text-emerald-500" />
                    </div>
                    <p className="text-lg font-bold text-emerald-500">Message Sent!</p>
                    <p className={`mt-2 max-w-sm text-sm leading-6 ${
                      isDark ? 'text-slate-400' : 'text-slate-600'
                    }`}>
                      Thank you for contacting us. We’ll get back to you soon.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid gap-5 sm:grid-cols-2">
                      <div>
                        <label className={`mb-2 block text-xs font-bold ${
                          isDark ? 'text-slate-300' : 'text-slate-700'
                        }`}>
                          Your Name
                        </label>
                        <div className="relative">
                          <UserIcon className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                          <input
                            type="text"
                            placeholder="John Doe"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className={`w-full rounded-xl border py-3.5 pl-11 pr-4 text-sm outline-none transition-all placeholder:text-slate-400 focus:ring-4 ${
                              isDark
                                ? 'border-white/10 bg-slate-950/60 text-white focus:border-blue-500 focus:ring-blue-500/10'
                                : 'border-slate-200 bg-slate-50 text-slate-900 focus:border-blue-500 focus:bg-white focus:ring-blue-500/10'
                            }`}
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className={`mb-2 block text-xs font-bold ${
                          isDark ? 'text-slate-300' : 'text-slate-700'
                        }`}>
                          Your Email
                        </label>
                        <div className="relative">
                          <EnvelopeIcon className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                          <input
                            type="email"
                            placeholder="john@example.com"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className={`w-full rounded-xl border py-3.5 pl-11 pr-4 text-sm outline-none transition-all placeholder:text-slate-400 focus:ring-4 ${
                              isDark
                                ? 'border-white/10 bg-slate-950/60 text-white focus:border-blue-500 focus:ring-blue-500/10'
                                : 'border-slate-200 bg-slate-50 text-slate-900 focus:border-blue-500 focus:bg-white focus:ring-blue-500/10'
                            }`}
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className={`mb-2 block text-xs font-bold ${
                        isDark ? 'text-slate-300' : 'text-slate-700'
                      }`}>
                        Subject
                      </label>
                      <input
                        type="text"
                        placeholder="How can we help you?"
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        className={`w-full rounded-xl border px-4 py-3.5 text-sm outline-none transition-all placeholder:text-slate-400 focus:ring-4 ${
                          isDark
                            ? 'border-white/10 bg-slate-950/60 text-white focus:border-blue-500 focus:ring-blue-500/10'
                            : 'border-slate-200 bg-slate-50 text-slate-900 focus:border-blue-500 focus:bg-white focus:ring-blue-500/10'
                        }`}
                        required
                      />
                    </div>

                    <div>
                      <label className={`mb-2 block text-xs font-bold ${
                        isDark ? 'text-slate-300' : 'text-slate-700'
                      }`}>
                        Message
                      </label>
                      <textarea
                        rows="5"
                        placeholder="Write your message here..."
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        className={`w-full resize-none rounded-xl border px-4 py-3.5 text-sm outline-none transition-all placeholder:text-slate-400 focus:ring-4 ${
                          isDark
                            ? 'border-white/10 bg-slate-950/60 text-white focus:border-blue-500 focus:ring-blue-500/10'
                            : 'border-slate-200 bg-slate-50 text-slate-900 focus:border-blue-500 focus:bg-white focus:ring-blue-500/10'
                        }`}
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-600/25 focus:outline-none focus:ring-4 focus:ring-blue-500/20"
                    >
                      <PaperAirplaneIcon className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                      Send Message
                    </button>
                  </form>
                )}
              </div>
            </div>

            {/* Location / Contact details */}
            <div className={`relative overflow-hidden rounded-3xl border p-6 sm:p-8 lg:p-10 ${
              isDark
                ? 'border-white/10 bg-gradient-to-br from-blue-500/[0.08] to-violet-500/[0.06]'
                : 'border-slate-200 bg-gradient-to-br from-blue-50 via-white to-violet-50 shadow-xl shadow-slate-200/40'
            }`}>
              <div className="relative flex h-full flex-col">
                <div>
                  <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-blue-500">
                    Visit & connect
                  </p>
                  <h2 className={`text-2xl font-black tracking-tight sm:text-3xl ${
                    isDark ? 'text-white' : 'text-slate-950'
                  }`}>
                    Find us here
                  </h2>
                </div>

                <div className={`relative mt-7 flex h-56 items-center justify-center overflow-hidden rounded-2xl border ${
                  isDark
                    ? 'border-white/10 bg-slate-950/50'
                    : 'border-slate-200 bg-white/70'
                }`}>
                  <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(to_right,currentColor_1px,transparent_1px),linear-gradient(to_bottom,currentColor_1px,transparent_1px)] [background-size:28px_28px] text-slate-300 dark:text-slate-700" />
                  <div className="relative text-center">
                    <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10">
                      <MapPinIcon className="h-7 w-7 text-blue-500" />
                    </div>
                    <p className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                      Lahore, Pakistan
                    </p>
                    <p className="mt-1 text-xs text-slate-400">Map integration coming soon</p>
                  </div>
                </div>

                <div className={`my-7 h-px ${isDark ? 'bg-white/10' : 'bg-slate-200'}`} />

                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="rounded-xl bg-blue-500/10 p-3">
                      <MapPinIcon className="h-5 w-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Address</p>
                      <p className={`mt-1 text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        Lahore, Pakistan
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="rounded-xl bg-violet-500/10 p-3">
                      <EnvelopeIcon className="h-5 w-5 text-violet-500" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Email</p>
                      <p className={`mt-1 truncate text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        support@ai-eclt.edu
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="rounded-xl bg-emerald-500/10 p-3">
                      <PhoneIcon className="h-5 w-5 text-emerald-500" />
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Phone</p>
                      <p className={`mt-1 text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        +92 300 1234567
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="mx-auto mb-10 max-w-2xl text-center">
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-blue-500">
              Need quick answers?
            </p>
            <h2 className={`text-3xl font-black tracking-tight sm:text-4xl ${
              isDark ? 'text-white' : 'text-slate-950'
            }`}>
              Frequently asked questions
            </h2>
            <p className={`mt-3 text-sm leading-6 sm:text-base ${
              isDark ? 'text-slate-400' : 'text-slate-600'
            }`}>
              Quick answers to common questions about AI-ECLT.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className={`group rounded-2xl border p-5 transition-all duration-300 sm:p-6 ${
                  isDark
                    ? 'border-white/10 bg-white/[0.035] hover:border-blue-400/20 hover:bg-white/[0.05]'
                    : 'border-slate-200 bg-white shadow-sm hover:border-blue-200 hover:shadow-md'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="mt-0.5 rounded-xl bg-blue-500/10 p-2">
                    <QuestionMarkCircleIcon className="h-5 w-5 text-blue-500" />
                  </div>
                  <div className="min-w-0">
                    <h3 className={`text-sm font-bold sm:text-base ${
                      isDark ? 'text-white' : 'text-slate-900'
                    }`}>
                      {faq.question}
                    </h3>
                    <p className={`mt-2 text-sm leading-6 ${
                      isDark ? 'text-slate-400' : 'text-slate-600'
                    }`}>
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 pb-16 pt-2 sm:px-6 sm:pb-24 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className={`relative overflow-hidden rounded-[2rem] border px-6 py-12 text-center sm:px-10 sm:py-16 ${
            isDark
              ? 'border-blue-400/10 bg-gradient-to-br from-blue-600/15 via-violet-600/10 to-fuchsia-600/10'
              : 'border-blue-100 bg-gradient-to-br from-blue-50 via-white to-violet-50'
          }`}>
            <div className="pointer-events-none absolute left-1/2 top-0 h-40 w-72 -translate-x-1/2 rounded-full bg-blue-500/10 blur-3xl" />

            <div className="relative mx-auto max-w-2xl">
              <h2 className={`text-2xl font-black tracking-tight sm:text-4xl ${
                isDark ? 'text-white' : 'text-slate-950'
              }`}>
                Ready to get started?
              </h2>
              <p className={`mx-auto mt-3 max-w-xl text-sm leading-6 sm:text-base ${
                isDark ? 'text-slate-400' : 'text-slate-600'
              }`}>
                Join students and institutions using AI-ECLT to streamline their exam management experience.
              </p>

              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition-all hover:-translate-y-0.5 hover:bg-blue-700"
                >
                  Create Account
                  <ArrowRightIcon className="h-4 w-4" />
                </Link>
                <Link
                  to="/about"
                  className={`inline-flex items-center justify-center rounded-xl border px-7 py-3.5 text-sm font-bold transition-all hover:-translate-y-0.5 ${
                    isDark
                      ? 'border-white/10 bg-white/5 text-white hover:bg-white/10'
                      : 'border-slate-200 bg-white text-slate-800 shadow-sm hover:bg-slate-50'
                  }`}
                >
                  About Us
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;