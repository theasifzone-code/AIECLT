
import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';

// Components
import Header from './components/Header';
import Hero from './components/Hero';
import Testimonials from './components/Testimonials';
import CTASection from './components/CTASection';
import Footer from './components/Footer';
import Login from './components/Login';
import Register from './components/Register';

// Pages
import StudentPortal from './pages/StudentPortal';
import BoardOfficialDashboard from './pages/BoardOfficialDashboard';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import About from './pages/About';
import Contact from './pages/Contact';
import Features from './components/Features';

function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();

  if (loading) return null; 

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

// Main App Content
function AppContent() {
  const { user, loading, login, logout } = useAuth();
  const [activeSection, setActiveSection] = useState('home');
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogin = async (formData) => {
    const result = await login(formData);

    if (result?.success) {
      const loggedInUser = result.user || result.data?.user;
      if (loggedInUser?.role === 'admin') {
        navigate('/admin', { replace: true });
      } else if (loggedInUser?.role === 'board_official') {
        navigate('/board', { replace: true });
      } else {
        navigate('/student', { replace: true });
      }
    }
    return result;
  };

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };


  const publicRoutes = ['/', '/login', '/register', '/about', '/features', '/contact'];
  const isPublicRoute = publicRoutes.includes(location.pathname);

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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {isPublicRoute && (
        <Header activeSection={activeSection} setActiveSection={setActiveSection} user={user} onLogout={handleLogout} />
      )}

      <Routes>
        {/* PUBLIC ROUTES */}
        <Route path="/" element={
          <>
            <Hero onNavigate={setActiveSection} user={user} />
            <Features />
            <Testimonials />
            <CTASection onNavigate={setActiveSection} user={user} />
          </>
        } />
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/register" element={<Register />} />
        <Route path="/about" element={<About />} />
        <Route path="/features" element={<Features />} />
        <Route path="/contact" element={<Contact />} />

        {/* PRIVATE / PROTECTED ROUTES */}
        <Route path="/student" element={
          <ProtectedRoute allowedRoles={['student', 'board_official', 'admin']}>
            <StudentPortal />
          </ProtectedRoute>
        } />
        <Route path="/board" element={
          <ProtectedRoute allowedRoles={['board_official', 'admin']}>
            <BoardOfficialDashboard />
          </ProtectedRoute>
        } />
        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <SuperAdminDashboard />
          </ProtectedRoute>
        } />

        {/* Catch-all Route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {isPublicRoute && (
        <Footer activeSection={activeSection} setActiveSection={setActiveSection} />
      )}
    </div>
  );
}

// Main App Component
export default function App() {
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