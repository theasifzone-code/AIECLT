// components/Footer.jsx - ✅ Simple Footer
import React from 'react';
import { MapPin, Mail, Phone, Facebook, Twitter, Linkedin, Github } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="relative border-t border-slate-800/80 bg-gradient-to-b from-transparent to-gray-900/50">
      {/* Grid Pattern Background */}
      <div className="absolute inset-0 grid-pattern opacity-20 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 md:px-6 pt-14 pb-8">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10 mb-12">
          
          {/* Brand Section */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <MapPin size={16} className="text-white" />
              </div>
              <span className="text-white font-bold tracking-tight text-lg">AI-ECLT</span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              AI-powered Examination Center Location Tracer designed to enhance student experience and administrative efficiency.
            </p>
            <div className="flex items-center gap-2">
              {[Facebook, Twitter, Linkedin, Github].map((Icon, i) => (
                <a 
                  key={i} 
                  href="#" 
                  className="w-8 h-8 rounded-lg bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-slate-500 hover:text-white hover:border-slate-500 transition-all duration-200"
                >
                  <Icon size={14} />
                </a>
              ))}
            </div>
          </div>

          {/* Navigation Links */}
          <div>
            <h3 className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-4">Quick Links</h3>
            <ul className="space-y-2.5">
              {['Home', 'Student Portal', 'Features', 'Help Center'].map((link) => (
                <li key={link}>
                  <a 
                    href="#" 
                    className="text-slate-400 hover:text-white text-sm transition-colors duration-200 hover:translate-x-1 inline-block"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Features */}
          <div>
            <h3 className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-4">Features</h3>
            <ul className="space-y-2.5">
              {['AI Route Suggestions', 'Live Traffic Updates', 'OCR Technology', 'Centralized Management'].map((feature) => (
                <li key={feature} className="text-slate-400 text-sm">
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-4">Contact</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 bg-slate-800 rounded-md flex items-center justify-center border border-slate-700/60 flex-shrink-0">
                  <Mail size={11} className="text-slate-400" />
                </div>
                <span className="text-slate-400 text-sm">support@ai-eclt.edu</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 bg-slate-800 rounded-md flex items-center justify-center border border-slate-700/60 flex-shrink-0">
                  <Phone size={11} className="text-slate-400" />
                </div>
                <span className="text-slate-400 text-sm">+92 300 1234567</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 bg-slate-800 rounded-md flex items-center justify-center border border-slate-700/60 flex-shrink-0">
                  <MapPin size={11} className="text-slate-400" />
                </div>
                <span className="text-slate-400 text-sm">Islamabad, Pakistan</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-800/80 pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-slate-600 text-xs text-center md:text-left">
            © 2025 AI-ECLT · Muhammad Asif, Muhammad Omer, Huzaifa Hanif, Anees Ahmad
          </p>
          <p className="text-slate-600 text-xs text-center md:text-right">
            Supervised by <span className="text-slate-400">Prof. Ushna Khalid</span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;