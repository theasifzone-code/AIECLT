// components/Contact.jsx - ✅ FIXED (EnvelopeIcon)
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  MapPinIcon, 
  EnvelopeIcon, // ✅ Replace MailIcon with EnvelopeIcon
  PhoneIcon, 
  ClockIcon,
  UserIcon,
  ChatBubbleLeftRightIcon,
  PaperAirplaneIcon,
  CheckCircleIcon,
  QuestionMarkCircleIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

const Contact = () => {
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
      description: 'Islamabad, Pakistan',
      color: 'text-blue-400'
    },
    {
      icon: EnvelopeIcon, // ✅ Replace here
      title: 'Email Us',
      description: 'support@ai-eclt.edu',
      color: 'text-purple-400'
    },
    {
      icon: PhoneIcon,
      title: 'Call Us',
      description: '+92 300 1234567',
      color: 'text-green-400'
    },
    {
      icon: ClockIcon,
      title: 'Working Hours',
      description: 'Mon - Fri: 9AM - 5PM',
      color: 'text-yellow-400'
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
    // Here you can integrate your backend API for contact form
    // For now, we'll show a success message
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: '', email: '', subject: '', message: '' });
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* ==================== HERO SECTION ==================== */}
      <section className="relative overflow-hidden pt-24 pb-16 px-4">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300/10 rounded-full blur-3xl"></div>
          <div className="absolute top-0 -right-4 w-72 h-72 bg-blue-300/10 rounded-full blur-3xl"></div>
          <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        </div>

        <div className="container mx-auto max-w-6xl relative">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full mb-6 animate-fade-in">
              <ChatBubbleLeftRightIcon className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-blue-400 font-medium">Get In Touch</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white leading-tight mb-6">
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Let's Connect
              </span>
              <br />
              <span className="text-gray-200">With Us</span>
            </h1>

            <p className="text-lg sm:text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
              Have questions about AI-ECLT? We're here to help! Reach out to us 
              through any of the channels below, or fill out the contact form 
              and we'll get back to you as soon as possible.
            </p>
          </div>
        </div>
      </section>

      {/* ==================== CONTACT INFO CARDS ==================== */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactInfo.map((info, i) => (
              <div key={i} className="bg-white/5 rounded-xl p-6 border border-white/10 hover:border-white/20 transition text-center hover:-translate-y-1">
                <info.icon className={`w-10 h-10 mx-auto mb-4 ${info.color}`} />
                <h3 className="text-lg font-semibold text-white mb-2">{info.title}</h3>
                <p className="text-sm text-gray-400">{info.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== CONTACT FORM & MAP ==================== */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Contact Form */}
            <div className="bg-white/5 rounded-2xl p-8 border border-white/10 hover:border-white/20 transition">
              <h2 className="text-2xl font-bold text-white mb-6">Send Us a Message</h2>

              {submitted ? (
                <div className="bg-green-500/10 border border-green-500/50 rounded-xl p-6 text-center">
                  <CheckCircleIcon className="w-12 h-12 text-green-400 mx-auto mb-4" />
                  <p className="text-lg font-semibold text-green-400 mb-2">Message Sent!</p>
                  <p className="text-gray-400">Thank you for contacting us. We'll get back to you soon.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Your Name</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <UserIcon className="w-5 h-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        placeholder="John Doe"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full bg-white/5 text-white pl-10 pr-4 py-3 rounded-lg border border-white/10 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition placeholder-gray-500"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Your Email</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <EnvelopeIcon className="w-5 h-5 text-gray-400" /> {/* ✅ Replace here */}
                      </div>
                      <input
                        type="email"
                        placeholder="john@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full bg-white/5 text-white pl-10 pr-4 py-3 rounded-lg border border-white/10 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition placeholder-gray-500"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Subject</label>
                    <input
                      type="text"
                      placeholder="How can we help you?"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full bg-white/5 text-white px-4 py-3 rounded-lg border border-white/10 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition placeholder-gray-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Message</label>
                    <textarea
                      rows="5"
                      placeholder="Write your message here..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full bg-white/5 text-white px-4 py-3 rounded-lg border border-white/10 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition placeholder-gray-500 resize-none"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full px-6 py-3.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl transition shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 font-medium flex items-center justify-center gap-2"
                  >
                    <PaperAirplaneIcon className="w-5 h-5" />
                    Send Message
                  </button>
                </form>
              )}
            </div>

            {/* Map & Info */}
            <div className="bg-white/5 rounded-2xl p-8 border border-white/10 hover:border-white/20 transition">
              <h2 className="text-2xl font-bold text-white mb-6">Find Us Here</h2>
              
              {/* Placeholder Map */}
              <div className="bg-gray-800/50 rounded-xl h-64 mb-6 flex items-center justify-center border border-white/5 relative overflow-hidden">
                <div className="text-center text-gray-400">
                  <MapPinIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Map Coming Soon</p>
                </div>
                <div className="absolute inset-0 bg-grid-pattern opacity-10" />
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <MapPinIcon className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Address</p>
                    <p className="text-sm text-gray-400">Islamabad, Pakistan</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-purple-500/20 rounded-lg">
                    <EnvelopeIcon className="w-5 h-5 text-purple-400" /> {/* ✅ Replace here */}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Email</p>
                    <p className="text-sm text-gray-400">support@ai-eclt.edu</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-green-500/20 rounded-lg">
                    <PhoneIcon className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Phone</p>
                    <p className="text-sm text-gray-400">+92 300 1234567</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== FAQ SECTION ==================== */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Frequently Asked Questions</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Quick answers to common questions about AI-ECLT.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-white/5 rounded-xl p-6 border border-white/10 hover:border-white/20 transition">
                <div className="flex items-start gap-3">
                  <QuestionMarkCircleIcon className="w-6 h-6 text-blue-400 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">{faq.question}</h3>
                    <p className="text-gray-400">{faq.answer}</p>
                  </div>
                </div>
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
                to="/about"
                className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-all border border-white/10 hover:border-white/20 text-lg font-medium hover:-translate-y-1"
              >
                About Us
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;