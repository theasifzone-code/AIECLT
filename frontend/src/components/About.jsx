// components/About.jsx
import React from 'react';
import { Target, Cpu, Users, Award, ShieldCheck, Globe, Zap } from 'lucide-react';

const About = () => {
  const team = [
    { name: "Muhammad Asif", role: "Team Lead / Full Stack Developer" },
    { name: "Muhammad Omer", role: "Frontend Specialist / UI Designer" },
    { name: "Huzaifa Hanif", role: "Backend Architect / OCR Integration" },
    { name: "Anees Ahmad", role: "Data Scientist / Route Optimization" }
  ];

  return (
    <div className="relative min-h-screen pt-24 pb-20 overflow-hidden">
      {/* Background orbs */}
      <div className="orb-blue top-[-10%] left-[-10%]" />
      <div className="orb-cyan bottom-[10%] right-[-5%]" />
      <div className="absolute inset-0 grid-pattern opacity-10 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 md:px-6">
        
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-20 anim-fade-up">
          <div className="sec-label mb-4">Our Mission</div>
          <h1 className="sec-title mb-6">
            Pioneering the Future of <span className="text-gradient">Exam Logistics</span>
          </h1>
          <p className="sec-sub">
            AI-ECLT (Exam Center Location Tracer) is a state-of-the-art platform designed to solve the critical challenges 
            of examination center navigation and administrative management using cutting-edge AI and OCR technologies.
          </p>
        </div>

        {/* Vision & Mission Cards */}
        <div className="grid md:grid-cols-2 gap-8 mb-24">
          <div className="cyber-card p-8 anim-fade-up-2">
            <div className="w-12 h-12 bg-blue-600/20 rounded-xl flex items-center justify-center mb-6 border border-blue-500/30">
              <Target className="text-blue-400" size={24} />
            </div>
            <h3 className="text-xl font-bold text-white mb-4">The Vision</h3>
            <p className="text-slate-400 leading-relaxed">
              To create an ecosystem where every student can reach their examination center with 100% certainty, 
              eliminating the stress of navigation and ensuring punctual attendance through intelligent route 
              optimization and real-time data.
            </p>
          </div>
          <div className="cyber-card p-8 anim-fade-up-2" style={{ animationDelay: '0.1s' }}>
            <div className="w-12 h-12 bg-cyan-600/20 rounded-xl flex items-center justify-center mb-6 border border-cyan-500/30">
              <Zap className="text-cyan-400" size={24} />
            </div>
            <h3 className="text-xl font-bold text-white mb-4">The Innovation</h3>
            <p className="text-slate-400 leading-relaxed">
              By integrating OCR for automated slip reading and AI for dynamic route planning, we provide a 
              seamless experience that replaces traditional, error-prone manual searches with high-precision 
              digital tracing.
            </p>
          </div>
        </div>

        {/* Tech Stack Section */}
        <div className="mb-24 anim-fade-up-3">
          <div className="text-center mb-16">
            <div className="sec-label mb-4">Core Technology</div>
            <h2 className="sec-title">Engineered with Precision</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: <Cpu />, title: "AI Core", desc: "Predictive algorithms" },
              { icon: <ShieldCheck />, title: "Secure OCR", desc: "Data privacy" },
              { icon: <Globe />, title: "Live Maps", desc: "Real-time sync" },
              { icon: <Zap />, title: "Ultra Fast", desc: "Low latency" }
            ].map((tech, i) => (
              <div key={i} className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl text-center hover:border-blue-500/30 transition-colors duration-300">
                <div className="text-blue-400 mb-4 flex justify-center">{tech.icon}</div>
                <h4 className="text-white font-bold mb-1">{tech.title}</h4>
                <p className="text-slate-500 text-xs">{tech.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Team Section */}
        <div className="anim-fade-up-3">
          <div className="text-center mb-16">
            <div className="sec-label mb-4">The Architects</div>
            <h2 className="sec-title">Meet Our Team</h2>
          </div>
          
          {/* Supervisor */}
          <div className="max-w-md mx-auto mb-16">
            <div className="cyber-card p-8 text-center border-blue-500/20 bg-blue-900/5">
              <div className="w-20 h-20 bg-blue-600 rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Award className="text-white" size={32} />
              </div>
              <h3 className="text-xl font-bold text-white">Prof. Ushna Khalid</h3>
              <p className="text-blue-400 text-sm font-medium mb-4">Project Supervisor</p>
              <div className="flex justify-center gap-2">
                <span className="badge-blue">Leadership</span>
                <span className="badge-blue">Academic Excellence</span>
              </div>
            </div>
          </div>

          {/* Members */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map((member, i) => (
              <div key={i} className="cyber-card p-6 text-center group">
                <div className="w-16 h-16 bg-slate-800 rounded-2xl mx-auto mb-4 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                  <Users size={28} />
                </div>
                <h4 className="text-white font-bold">{member.name}</h4>
                <p className="text-slate-500 text-xs mb-4">{member.role}</p>
                <div className="flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer">
                    <Globe size={14} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default About;
