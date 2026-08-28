// App.jsx - ✅ FIXED (Header Sirf Public Routes Par)
import React, { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Header from './components/Header';
import Hero from './components/Hero';
import Stats from './components/Stats';
import Testimonials from './components/Testimonials';
import CTASection from './components/CTASection';
import StudentPortal from './components/StudentPortal';
import BoardOfficialDashboard from './components/BoardOfficialDashboard';
import SuperAdminDashboard from './components/SuperAdminDashboard';
import Footer from './components/Footer';
import Login from './components/Login';
import Register from './components/Register';
import About from './pages/About';
import Contact from './pages/Contact';
import Features from './pages/Features';

// Main App Content
function AppContent() {
  const { user, loading, login, logout } = useAuth();
  const [activeSection, setActiveSection] = useState('home');
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogin = async (formData) => {
    const result = await login(formData);
    
    if (result.success) {
      const loggedInUser = result.user || result.data?.user;
      if (loggedInUser?.role === 'admin') {
        navigate('/admin');
      } else if (loggedInUser?.role === 'board_official') {
        navigate('/board');
      } else {
        navigate('/student');
      }
    }
    return result;
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const hasAccess = (allowedRoles) => {
    if (!user) return false;
    return allowedRoles.includes(user.role);
  };

  // ✅ Header/Footer Sirf Public Routes par Dikhega
  const isPublicRoute = ['/', '/login', '/register', '/about', '/features', '/contact'].includes(location.pathname);

  // ✅ Agar loading hai, toh loading screen dikhao
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* ✅ Header Sirf Public Routes par Dikhega */}
      {isPublicRoute && (
        <Header activeSection={activeSection} setActiveSection={setActiveSection} user={user} onLogout={handleLogout} />
      )}

      <Routes>
        {/* 🔓 PUBLIC ROUTES */}
        <Route path="/" element={
          <>
            <Hero onNavigate={setActiveSection} user={user} />
            <Stats />
            <Features />
            <Testimonials />
            <CTASection onNavigate={setActiveSection} user={user} />
            <Footer activeSection={activeSection} setActiveSection={setActiveSection} />
          </>
        } />
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/register" element={<Register />} />
        <Route path="/about" element={<About />} />
        <Route path="/features" element={<Features/>} />
        <Route path="/contact" element={<Contact />} />

        {/* 🔐 PRIVATE ROUTES (No Header/Footer) */}
        <Route path="/student" element={
          hasAccess(['student', 'board_official']) ? <StudentPortal /> : <Navigate to="/login" />
        } />
        <Route path="/board" element={
          hasAccess(['board_official', 'admin']) ? <BoardOfficialDashboard /> : <Navigate to="/login" />
        } />
        <Route path="/admin" element={
          hasAccess(['admin']) ? <SuperAdminDashboard /> : <Navigate to="/login" />
        } />
      </Routes>

      {/* ✅ Footer Sirf Public Routes par Dikhega */}
      {isPublicRoute && (
        <Footer activeSection={activeSection} setActiveSection={setActiveSection} />
      )}
    </div>
  );
}

// ✅ Main App - Router + ThemeProvider + AuthProvider
function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;