// components/Register.jsx - ✅ FIXED (Sirf Students Register Karein)
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  UserIcon,
  EnvelopeIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
  AcademicCapIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  ArrowRightIcon,
  CheckBadgeIcon,
  SparklesIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

function Register() {
  const { register, error, loading } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student' // ✅ Sirf Student
  });
  const [localError, setLocalError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    setSuccess('');

    if (!acceptTerms) {
      setLocalError('Please accept the terms and conditions');
      return;
    }

    const result = await register(formData);

    if (result.success) {
      setSuccess('🎉 Registration successful! Redirecting...');
      setTimeout(() => navigate('/student'), 1500); // ✅ Student portal par le jao
    } else {
      setLocalError(result.error || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-green-300/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 -right-4 w-72 h-72 bg-blue-300/10 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      </div>

      <div className="w-full max-w-md animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-3">
            <div className="p-2.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-lg shadow-blue-500/25">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <span className="text-2xl font-bold text-white">AI-ECLT</span>
          </div>
          <p className="text-gray-400 text-sm">Create your student account</p>
        </div>

        {/* Register Card */}
        <div className="bg-white/5 backdrop-blur-sm p-8 rounded-2xl border border-white/10 shadow-2xl hover:border-white/20 transition">
          <div className="flex items-center gap-2 mb-6">
            <h2 className="text-xl font-semibold text-white">Create Account</h2>
            <span className="text-xl">🚀</span>
          </div>

          {/* Admin/Board Official Message */}
          <div className="bg-blue-500/10 border border-blue-500/30 text-blue-400 p-4 rounded-lg mb-4 text-sm flex items-start gap-2">
            <ExclamationTriangleIcon className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Note:</p>
              <p className="text-gray-400">Board Officials and Admins are created by the Super Admin. Only students can register here.</p>
            </div>
          </div>

          {/* Error Message */}
          {(localError || error) && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg mb-4 text-sm flex items-center gap-2 animate-slide-down">
              <span className="text-lg">❌</span>
              <span>{localError || error}</span>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="bg-green-500/10 border border-green-500/50 text-green-400 p-3 rounded-lg mb-4 text-sm flex items-center gap-2 animate-slide-down">
              <span className="text-lg">✅</span>
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Name */}
            <div className="mb-4">
              <label className="text-gray-300 block mb-2 text-sm font-medium">Full Name</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserIcon className="h-5 w-5 text-gray-400 group-focus-within:text-blue-400 transition" />
                </div>
                <input
                  type="text"
                  placeholder="Muhammad Asif"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-white/5 text-white pl-10 pr-4 py-3 rounded-lg border border-white/10 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition placeholder-gray-500 group-focus-within:border-blue-500"
                  required
                  autoComplete="name"
                />
              </div>
            </div>

            {/* Email */}
            <div className="mb-4">
              <label className="text-gray-300 block mb-2 text-sm font-medium">Email Address</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <EnvelopeIcon className="h-5 w-5 text-gray-400 group-focus-within:text-blue-400 transition" />
                </div>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-white/5 text-white pl-10 pr-4 py-3 rounded-lg border border-white/10 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition placeholder-gray-500 group-focus-within:border-blue-500"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div className="mb-4">
              <label className="text-gray-300 block mb-2 text-sm font-medium">Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LockClosedIcon className="h-5 w-5 text-gray-400 group-focus-within:text-blue-400 transition" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min 6 characters"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full bg-white/5 text-white pl-10 pr-12 py-3 rounded-lg border border-white/10 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition placeholder-gray-500 group-focus-within:border-blue-500"
                  required
                  minLength="6"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white transition"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
              <p className="text-gray-500 text-xs mt-1">Password must be at least 6 characters</p>
            </div>

            {/* Terms */}
            <div className="mb-6">
              <label className="flex items-start gap-2 text-sm text-gray-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="w-4 h-4 rounded border-white/20 bg-white/5 text-blue-500 focus:ring-blue-500 focus:ring-offset-0 mt-0.5"
                />
                <span>
                  I agree to the{' '}
                  <button
                    type="button"
                    className="text-blue-400 hover:text-blue-300 hover:underline"
                  >
                    Terms of Service
                  </button>
                  {' '}and{' '}
                  <button
                    type="button"
                    className="text-blue-400 hover:text-blue-300 hover:underline"
                  >
                    Privacy Policy
                  </button>
                </span>
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-3.5 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed font-medium text-lg shadow-lg shadow-green-500/25 hover:shadow-green-500/40 flex items-center justify-center gap-2 group"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating Account...
                </span>
              ) : (
                <>
                  Create Account
                  <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-transparent text-gray-500">or</span>
            </div>
          </div>

          {/* Login Link */}
          <p className="text-gray-400 text-center text-sm">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-blue-400 hover:text-blue-300 font-medium transition hover:underline"
            >
              Sign In
            </Link>
          </p>

          {/* Trust Badge */}
          <div className="mt-4 flex items-center justify-center gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <CheckBadgeIcon className="w-3 h-3 text-green-400" />
              Secure Registration
            </span>
            <span className="w-px h-3 bg-gray-700" />
            <span className="flex items-center gap-1">
              <SparklesIcon className="w-3 h-3 text-blue-400" />
              Free Account
            </span>
          </div>
        </div>

        <p className="text-center text-gray-600 text-xs mt-6">
          © 2025 AI-ECLT. All rights reserved.
        </p>
      </div>
    </div>
  );
}

export default Register;