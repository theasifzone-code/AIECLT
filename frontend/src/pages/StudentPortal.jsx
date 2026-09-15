import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import {
  MapPinIcon,
  MagnifyingGlassIcon,
  ArrowRightOnRectangleIcon,
  AcademicCapIcon,
  BuildingOfficeIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  Bars3Icon,
  BellIcon,
  XMarkIcon,
  CalendarIcon,
  Cog6ToothIcon,
  SparklesIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';

const ui = {
  page: 'bg-[#080A11] text-slate-100',
  panel:
    'bg-gradient-to-b from-[#131725]/80 to-[#0F1320]/80 backdrop-blur-xl border border-white/[0.07] rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)]',
  input:
    'w-full px-4 py-3 bg-[#0A0D16] border border-white/[0.08] rounded-xl text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-teal-400/60 focus:ring-2 focus:ring-teal-400/20 transition-all duration-200',
  label:
    'block text-[11px] font-bold text-slate-400 mb-2 uppercase tracking-widest',
  btnPrimary:
    'inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-teal-500 via-emerald-500 to-teal-500 hover:from-teal-400 hover:via-emerald-400 hover:to-teal-400 text-[#04120D] text-sm font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-teal-500/30 hover:shadow-teal-400/40 active:scale-[0.98]',
  btnGhost:
    'inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.09] text-slate-300 text-xs font-medium transition-all duration-200 border border-white/[0.08] hover:border-white/[0.18]',
  iconBtn:
    'p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-white/[0.06] transition-all duration-200',
};

const statusStyles = {
  upcoming: 'bg-sky-500/15 text-sky-300 ring-1 ring-sky-500/30',
  ongoing: 'bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/30',
  completed: 'bg-slate-500/15 text-slate-300 ring-1 ring-slate-500/30',
  cancelled: 'bg-rose-500/15 text-rose-300 ring-1 ring-rose-500/30',
  postponed: 'bg-amber-500/15 text-amber-300 ring-1 ring-amber-500/30',
};

const StudentPortal = () => {
  const { user, logout, updateUser } = useAuth();
  const fileInputRef = useRef(null);

  const [activeTab, setActiveTab] = useState('search');
  const [notifications, setNotifications] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [centerCode, setCenterCode] = useState('');
  const [center, setCenter] = useState(null);
  const [route, setRoute] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [location, setLocation] = useState(null);
  const [recentCenters, setRecentCenters] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [schedulesLoading, setSchedulesLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    city: user?.city || '',
  });

  useEffect(() => {
    if (!user) {
      window.location.href = '/login';
      return;
    }
    getLocation();
    loadRecentCenters();
    fetchNotifications();
    fetchSchedules();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications/my');
      setNotifications(res.data.notifications || []);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    }
  };

  const fetchSchedules = async () => {
    try {
      setSchedulesLoading(true);
      const res = await api.get('/schedules/student');
      setSchedules(res.data.data || []);
    } catch (err) {
      console.error('Failed to load schedules:', err);
      toast.error('Failed to load schedules');
      setSchedules([]);
    } finally {
      setSchedulesLoading(false);
    }
  };

  const getLocation = () => {
    const DEFAULT_LOCATION = { lat: 31.5204, lng: 74.3587 };

    if (!navigator.geolocation) {
      setLocation(DEFAULT_LOCATION);
      return;
    }

    navigator.permissions
      .query({ name: 'geolocation' })
      .then((result) => {
        if (result.state === 'denied') {
          setLocation(DEFAULT_LOCATION);
          return;
        }

        navigator.geolocation.getCurrentPosition(
          (position) => {
            setLocation({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            });
          },
          () => setLocation(DEFAULT_LOCATION),
          { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 }
        );
      })
      .catch(() => setLocation(DEFAULT_LOCATION));
  };

  const loadRecentCenters = () => {
    const saved = localStorage.getItem('recentCenters');
    if (saved) {
      try {
        setRecentCenters(JSON.parse(saved));
      } catch {
        localStorage.removeItem('recentCenters');
      }
    }
  };

  const saveRecentCenter = (centerData) => {
    const updated = [
      centerData,
      ...recentCenters.filter((c) => c._id !== centerData._id),
    ].slice(0, 5);
    setRecentCenters(updated);
    localStorage.setItem('recentCenters', JSON.stringify(updated));
  };

  const handleFileUpload = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    if (selectedFile.size > 5 * 1024 * 1024) {
      toast.error('File size exceeds 5MB limit');
      return;
    }

    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (!validTypes.includes(selectedFile.type)) {
      toast.error('Please upload a valid image (JPEG, PNG, WEBP)');
      return;
    }

    setLoading(true);
    setError('');
    setCenter(null);
    setRoute(null);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('image', selectedFile);

    try {
      const response = await api.uploadFile(
        '/ocr/extract-center',
        formData,
        (progress) => setUploadProgress(progress)
      );

      setCenter(response.data.center);
      setCenterCode(response.data.centerCode);
      saveRecentCenter(response.data.center);
      toast.success('Center found successfully!');

      if (location) fetchRoute(response.data.center);
    } catch (err) {
      const errorMsg =
        err.response?.data?.message || 'OCR failed. Try manual entry.';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
      setUploadProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleManualSearch = async () => {
    const code = centerCode.trim().toUpperCase();
    if (!code) {
      toast.error('Please enter a center code');
      return;
    }

    setLoading(true);
    setError('');
    setCenter(null);
    setRoute(null);

    try {
      const response = await api.post('/ocr/manual-center', { centerCode: code });
      setCenter(response.data.center);
      saveRecentCenter(response.data.center);
      toast.success('Center found!');

      if (location) fetchRoute(response.data.center);
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Center not found';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoute = async (centerData) => {
    const origin = location || { lat: 31.5204, lng: 74.3587 };

    try {
      const response = await api.post('/route/get-route', {
        originLat: parseFloat(origin.lat),
        originLng: parseFloat(origin.lng),
        destLat: parseFloat(centerData.latitude),
        destLng: parseFloat(centerData.longitude),
      });
      setRoute(response.data.route);
    } catch (err) {
      console.error('Route error:', err);
    }
  };

  const clearSearch = () => {
    setCenter(null);
    setRoute(null);
    setError('');
    setCenterCode('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      const result = await updateUser(profileData);
      if (result.success) {
        toast.success('Profile updated successfully!');
      } else {
        toast.error(result.error || 'Failed to update profile');
      }
    } catch {
      toast.error('Failed to update profile');
    }
  };

  const menuItems = [
    { id: 'search', label: 'Find Center', icon: MapPinIcon, hint: 'Locate exam center' },
    { id: 'schedules', label: 'Exam Schedule', icon: CalendarIcon, hint: 'View timetable' },
    { id: 'notifications', label: 'Notifications', icon: BellIcon, hint: 'Latest updates' },
    { id: 'profile', label: 'Profile Settings', icon: Cog6ToothIcon, hint: 'Manage account' },
  ];

  const getStatusColor = (status) => statusStyles[status] || statusStyles.upcoming;

  const EmptyState = ({ icon: Icon, title, hint }) => (
    <div className="flex flex-col items-center justify-center text-center py-20 px-6">
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-500/20 to-emerald-500/10 rounded-2xl blur-xl" />
        <div className="relative p-5 rounded-2xl bg-gradient-to-br from-white/[0.06] to-white/[0.02] border border-white/[0.08]">
          <Icon className="w-9 h-9 text-slate-500" />
        </div>
      </div>
      <p className="text-base font-bold text-slate-200">{title}</p>
      {hint && <p className="text-sm text-slate-500 mt-2 max-w-sm leading-relaxed">{hint}</p>}
    </div>
  );

  const NavList = ({ onNavigate }) => (
    <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
      {menuItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => {
              setActiveTab(item.id);
              onNavigate?.();
            }}
            className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all duration-300 relative text-sm font-semibold group ${
              isActive
                ? 'bg-gradient-to-r from-teal-500/20 via-emerald-500/10 to-transparent text-teal-200 ring-1 ring-teal-500/30 shadow-[0_0_20px_-5px_rgba(20,184,166,0.3)]'
                : 'text-slate-400 hover:text-slate-100 hover:bg-white/[0.04]'
            }`}
          >
            {isActive && (
              <span className="absolute left-0 top-2 bottom-2 w-1 rounded-full bg-gradient-to-b from-teal-400 to-emerald-400 shadow-[0_0_10px_rgba(20,184,166,0.8)]" />
            )}
            <div
              className={`p-1.5 rounded-lg transition-all duration-300 ${
                isActive
                  ? 'bg-teal-500/20 text-teal-300'
                  : 'bg-white/[0.03] text-slate-500 group-hover:text-slate-300'
              }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
            </div>
            <div className="flex-1 text-left min-w-0">
              <span className="block truncate">{item.label}</span>
            </div>
            {isActive && <ChevronRightIcon className="w-4 h-4 text-teal-400" />}
          </button>
        );
      })}
    </nav>
  );

  const SidebarHeader = () => (
    <div className="p-5 border-b border-white/[0.06]">
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-teal-500/40 to-emerald-500/20 rounded-xl blur-lg" />
          <div className="relative p-2.5 bg-gradient-to-br from-teal-500/25 to-emerald-500/10 rounded-xl ring-1 ring-teal-500/30">
            <AcademicCapIcon className="w-5 h-5 text-teal-300" />
          </div>
        </div>
        <div className="min-w-0">
          <span className="text-slate-100 font-bold block leading-tight truncate text-base">
            Student Portal
          </span>
          <span className="text-[11px] text-slate-500 truncate">
            Exam board system
          </span>
        </div>
      </div>
    </div>
  );

  const UserCard = () => (
    <div className="p-3 m-3 bg-gradient-to-br from-white/[0.05] to-white/[0.02] rounded-xl border border-white/[0.06] flex items-center gap-3 hover:border-white/[0.12] transition-all">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-500/40 to-emerald-500/20 rounded-full blur-md" />
        <div className="relative w-9 h-9 rounded-full bg-gradient-to-br from-teal-500/40 to-emerald-500/25 flex items-center justify-center text-teal-100 font-bold text-sm shrink-0 ring-2 ring-teal-500/30">
          {user?.name?.charAt(0)?.toUpperCase() || 'U'}
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-slate-100 truncate">
          {user?.name || 'Student'}
        </p>
        <p className="text-[11px] text-slate-500 capitalize truncate">
          {user?.role || 'Student'}
        </p>
      </div>
      <button
        onClick={logout}
        title="Logout"
        className="text-slate-500 hover:text-rose-400 p-2 rounded-lg hover:bg-rose-500/10 transition-all"
      >
        <ArrowRightOnRectangleIcon className="w-4 h-4" />
      </button>
    </div>
  );

  return (
    <div className={`h-screen flex overflow-hidden ${ui.page}`}>
      <aside className="hidden lg:flex w-64 bg-gradient-to-b from-[#0D1119] to-[#0A0D16] border-r border-white/[0.06] flex-col shrink-0">
        <SidebarHeader />
        <NavList />
        <UserCard />
      </aside>

      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
            onClick={() => setMobileDrawerOpen(false)}
          />
          <aside className="absolute left-0 top-0 bottom-0 w-72 max-w-[85vw] bg-gradient-to-b from-[#0D1119] to-[#0A0D16] border-r border-white/[0.06] flex flex-col animate-in slide-in-from-left duration-300">
            <div className="p-4 border-b border-white/[0.06] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-gradient-to-br from-teal-500/25 to-emerald-500/10 rounded-xl ring-1 ring-teal-500/30">
                  <AcademicCapIcon className="w-5 h-5 text-teal-300" />
                </div>
                <span className="text-slate-100 font-bold">Student Portal</span>
              </div>
              <button
                onClick={() => setMobileDrawerOpen(false)}
                className={ui.iconBtn}
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
            <NavList onNavigate={() => setMobileDrawerOpen(false)} />
            <div className="p-3 border-t border-white/[0.06]">
              <button
                onClick={logout}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-xl font-semibold text-sm hover:bg-rose-500/15 transition-all"
              >
                <ArrowRightOnRectangleIcon className="w-5 h-5" />
                Logout
              </button>
            </div>
          </aside>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="bg-[#080A11]/80 backdrop-blur-xl border-b border-white/[0.06] sticky top-0 z-30 px-4 sm:px-6 py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setMobileDrawerOpen(true)}
              className={`lg:hidden ${ui.iconBtn}`}
              aria-label="Open menu"
            >
              <Bars3Icon className="w-6 h-6" />
            </button>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl font-bold text-slate-50 truncate">
                {menuItems.find((item) => item.id === activeTab)?.label ||
                  'Dashboard'}
              </h1>
              <p className="text-xs text-slate-500 truncate hidden sm:block">
                {menuItems.find((item) => item.id === activeTab)?.hint || ''}
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2.5 bg-gradient-to-r from-white/[0.05] to-white/[0.02] pl-1.5 pr-4 py-1.5 rounded-full border border-white/[0.06] shrink-0">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500/40 to-emerald-500/25 flex items-center justify-center text-teal-100 font-bold text-xs ring-1 ring-teal-500/30">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-semibold text-slate-100 leading-tight">
                {user?.name}
              </p>
              <p className="text-[11px] text-slate-500 capitalize leading-tight">
                {user?.role}
              </p>
            </div>
          </div>
        </header>

        <div className="p-4 sm:p-6 lg:p-8 flex-1 w-full max-w-[1600px] mx-auto">
          {activeTab === 'search' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-6">
              <div className={`${ui.panel} p-5 sm:p-6`}>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-base font-bold text-slate-100 flex items-center gap-3">
                    <span className="relative p-2 bg-gradient-to-br from-teal-500/25 to-emerald-500/10 text-teal-300 rounded-xl ring-1 ring-teal-500/30">
                      <MapPinIcon className="w-5 h-5" />
                    </span>
                    Find your exam center
                  </h2>
                  {center && (
                    <button onClick={clearSearch} className={ui.btnGhost}>
                      <ArrowPathIcon className="w-3.5 h-3.5" />
                      Clear
                    </button>
                  )}
                </div>

                <div className="space-y-5">
                  <div>
                    <label className={ui.label}>Upload roll number slip</label>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      disabled={loading}
                      className="w-full text-sm p-3 bg-[#0A0D16] border border-white/[0.08] rounded-xl text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-gradient-to-r file:from-teal-500/25 file:to-emerald-500/15 file:text-teal-300 file:text-xs file:font-bold hover:file:from-teal-500/35 hover:file:to-emerald-500/25 cursor-pointer disabled:opacity-50 outline-none transition-all"
                    />
                    <p className="text-slate-500 text-xs mt-2">
                      Upload a clear photo to auto-detect your center via OCR.
                    </p>

                    {loading && uploadProgress > 0 && (
                      <div className="mt-3">
                        <div className="w-full bg-white/[0.05] rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-teal-400 to-emerald-400 h-full rounded-full transition-all duration-300 shadow-[0_0_10px_rgba(20,184,166,0.6)]"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                        <p className="text-xs text-slate-500 mt-1.5 text-right font-medium">
                          {uploadProgress}% uploaded
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
                    <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">
                      or search manually
                    </span>
                    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
                  </div>

                  <div className="flex gap-2.5">
                    <input
                      type="text"
                      placeholder="Center code (e.g. CTR001)"
                      value={centerCode}
                      onChange={(e) => setCenterCode(e.target.value.toUpperCase())}
                      onKeyDown={(e) => e.key === 'Enter' && handleManualSearch()}
                      className={`${ui.input} flex-1 font-mono`}
                    />
                    <button
                      onClick={handleManualSearch}
                      disabled={loading}
                      className={`${ui.btnPrimary} shrink-0`}
                    >
                      <MagnifyingGlassIcon className="w-4 h-4" />
                      <span className="hidden sm:inline">Search</span>
                    </button>
                  </div>
                </div>

                {loading && !uploadProgress && (
                  <div className="mt-5 flex items-center justify-center gap-3 text-teal-300 py-4 bg-gradient-to-r from-teal-500/[0.08] to-emerald-500/[0.06] ring-1 ring-teal-500/20 rounded-xl">
                    <div className="w-4 h-4 border-2 border-teal-400 border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm font-semibold">
                      Processing request...
                    </span>
                  </div>
                )}

                {error && (
                  <div className="mt-5 bg-rose-500/[0.08] ring-1 ring-rose-500/25 text-rose-300 p-4 rounded-xl text-sm flex items-start gap-3">
                    <XCircleIcon className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                {center && (
                  <div className="mt-5 bg-gradient-to-br from-emerald-500/[0.08] to-teal-500/[0.04] ring-1 ring-emerald-500/25 rounded-xl p-5 space-y-3">
                    <div className="flex items-center gap-2.5">
                      <div className="p-1 rounded-full bg-emerald-500/20">
                        <CheckCircleIcon className="w-4 h-4 text-emerald-400" />
                      </div>
                      <h4 className="font-bold text-emerald-300 text-sm">
                        Center identified
                      </h4>
                    </div>
                    <div className="space-y-2 text-sm text-slate-300 pt-3 border-t border-emerald-500/15">
                      <p className="flex justify-between gap-3">
                        <span className="text-slate-500">Code:</span>
                        <strong className="text-slate-100 font-mono text-right">
                          {center.centerCode}
                        </strong>
                      </p>
                      <p className="flex justify-between gap-3">
                        <span className="text-slate-500">Name:</span>
                        <strong className="text-slate-100 font-medium text-right">
                          {center.name}
                        </strong>
                      </p>
                      <p className="flex justify-between gap-3">
                        <span className="text-slate-500">Address:</span>
                        <span className="text-right">{center.address}</span>
                      </p>
                      <p className="flex justify-between gap-3">
                        <span className="text-slate-500">City:</span>
                        <span className="text-right">{center.city}</span>
                      </p>
                    </div>
                  </div>
                )}

                {route && (
                  <div className="mt-4 bg-gradient-to-br from-sky-500/[0.08] to-blue-500/[0.04] ring-1 ring-sky-500/25 rounded-xl p-4">
                    <h4 className="font-bold text-sky-300 text-[11px] mb-2.5 uppercase tracking-widest">
                      Route estimate
                    </h4>
                    <div className="flex gap-6 text-sm text-slate-300">
                      <p>
                        <span className="text-slate-500">Distance:</span>{' '}
                        <strong className="text-slate-100 font-bold">
                          {route.distance} km
                        </strong>
                      </p>
                      <p>
                        <span className="text-slate-500">Time:</span>{' '}
                        <strong className="text-slate-100 font-bold">
                          {route.duration} min
                        </strong>
                      </p>
                    </div>
                  </div>
                )}

                {recentCenters.length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-[11px] font-bold text-slate-500 mb-3 flex items-center gap-2 uppercase tracking-widest">
                      <ClockIcon className="w-3.5 h-3.5" />
                      Recent searches
                    </h4>
                    <div className="space-y-2">
                      {recentCenters.map((c) => (
                        <button
                          key={c._id}
                          onClick={() => {
                            setCenter(c);
                            setCenterCode(c.centerCode);
                            setError('');
                            if (location) fetchRoute(c);
                            toast.success(`Selected: ${c.name}`);
                          }}
                          className="w-full flex items-center justify-between p-3.5 bg-white/[0.02] hover:bg-gradient-to-r hover:from-teal-500/[0.06] hover:to-transparent rounded-xl transition-all duration-300 text-left group border border-white/[0.04] hover:border-teal-500/30"
                        >
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-slate-100 truncate group-hover:text-teal-300 transition-colors">
                              {c.name}
                            </p>
                            <p className="text-xs text-slate-500 font-mono mt-0.5">
                              {c.centerCode} · {c.city}
                            </p>
                          </div>
                          <BuildingOfficeIcon className="w-4 h-4 text-slate-600 group-hover:text-teal-400 transition-colors shrink-0" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className={`${ui.panel} p-5 sm:p-6 flex flex-col`}>
                <h2 className="text-base font-bold text-slate-100 mb-5 flex items-center gap-3">
                  <span className="p-2 bg-gradient-to-br from-violet-500/25 to-purple-500/10 text-violet-300 rounded-xl ring-1 ring-violet-500/30">
                    <BuildingOfficeIcon className="w-5 h-5" />
                  </span>
                  Location preview
                </h2>
                <div className="flex-1 min-h-[340px] bg-gradient-to-br from-[#0A0D16] to-[#0D1220] rounded-xl flex items-center justify-center border border-white/[0.04] overflow-hidden relative">
                  <div
                    className="absolute inset-0 opacity-[0.05]"
                    style={{
                      backgroundImage:
                        'linear-gradient(rgba(20,184,166,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(20,184,166,0.6) 1px, transparent 1px)',
                      backgroundSize: '40px 40px',
                    }}
                  />
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(20,184,166,0.08),transparent_60%)]" />

                  {center ? (
                    <div className="text-center p-6 space-y-3.5 relative z-10">
                      <div className="relative inline-flex">
                        <div className="absolute inset-0 bg-gradient-to-br from-teal-500/40 to-emerald-500/20 rounded-2xl blur-xl" />
                        <div className="relative p-4 rounded-2xl bg-gradient-to-br from-teal-500/25 to-emerald-500/10 text-teal-300 ring-1 ring-teal-500/30">
                          <MapPinIcon className="w-8 h-8" />
                        </div>
                      </div>
                      <h3 className="text-lg font-bold text-slate-100">
                        {center.name}
                      </h3>
                      <p className="text-slate-500 text-xs max-w-xs mx-auto leading-relaxed">
                        {center.address}
                      </p>
                      <p className="text-slate-600 text-[11px] font-mono">
                        {center.latitude}, {center.longitude}
                      </p>
                      {route && (
                        <div className="bg-gradient-to-r from-sky-500/[0.1] to-blue-500/[0.06] ring-1 ring-sky-500/25 rounded-xl py-2.5 px-4 max-w-xs mx-auto">
                          <p className="text-sky-300 text-xs font-bold">
                            {route.distance} km away · {route.duration} min drive
                          </p>
                        </div>
                      )}
                      <button
                        onClick={() => {
                          const originLat = location?.lat || 31.5204;
                          const originLng = location?.lng || 74.3587;
                          const destAddress = encodeURIComponent(
                            center.address || center.name
                          );
                          window.open(
                            `https://www.google.com/maps/dir/?api=1&origin=${originLat},${originLng}&destination=${destAddress}&travelmode=driving`,
                            '_blank'
                          );
                        }}
                        className={`${ui.btnGhost} mt-2`}
                      >
                        <SparklesIcon className="w-3.5 h-3.5" />
                        Open in Google Maps
                      </button>
                    </div>
                  ) : (
                    <div className="text-center text-slate-500 p-6 space-y-3 relative z-10">
                      <div className="relative inline-flex mb-2">
                        <div className="p-4 rounded-2xl bg-gradient-to-br from-white/[0.06] to-white/[0.02] border border-white/[0.08]">
                          <MapPinIcon className="w-8 h-8 text-slate-600" />
                        </div>
                      </div>
                      <p className="text-sm font-semibold text-slate-400">
                        No center selected
                      </p>
                      <p className="text-xs text-slate-600 max-w-xs mx-auto leading-relaxed">
                        Upload your exam slip or enter a center code to preview
                        its location.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'schedules' && (
            <div className={`${ui.panel} p-5 sm:p-6`}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-base font-bold text-slate-100 flex items-center gap-3">
                  <span className="p-2 bg-gradient-to-br from-sky-500/25 to-blue-500/10 text-sky-300 rounded-xl ring-1 ring-sky-500/30">
                    <CalendarIcon className="w-5 h-5" />
                  </span>
                  Upcoming exam schedules
                </h2>
                <button onClick={fetchSchedules} className={ui.btnGhost}>
                  <ArrowPathIcon
                    className={`w-3.5 h-3.5 ${schedulesLoading ? 'animate-spin' : ''}`}
                  />
                  Refresh
                </button>
              </div>

              {schedulesLoading ? (
                <div className="flex items-center justify-center py-16 gap-3">
                  <div className="w-5 h-5 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm text-slate-400">
                    Loading schedules...
                  </span>
                </div>
              ) : (
                <div className="space-y-3">
                  {schedules.length === 0 ? (
                    <EmptyState
                      icon={CalendarIcon}
                      title="No schedules found"
                      hint="Your registered examination dates will appear here."
                    />
                  ) : (
                    schedules.map((schedule) => (
                      <div
                        key={schedule._id}
                        className="relative bg-white/[0.02] hover:bg-gradient-to-r hover:from-white/[0.05] hover:to-white/[0.02] rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-white/[0.04] hover:border-white/[0.1] transition-all duration-300 group overflow-hidden"
                      >
                        <div className="absolute left-0 top-4 bottom-4 w-1 rounded-full bg-gradient-to-b from-sky-400/60 to-blue-500/60 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="min-w-0">
                          <p className="font-bold text-slate-100 text-base">
                            {schedule.subject}
                          </p>
                          <p className="text-xs text-slate-500 mt-1">
                            {schedule.examCenterId?.name || 'Center assigned'} ·{' '}
                            {schedule.examCenterId?.city || 'City'}
                          </p>
                          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-400">
                            <span className="flex items-center gap-1.5 bg-white/[0.04] px-3 py-1.5 rounded-lg border border-white/[0.06]">
                              <ClockIcon className="w-3.5 h-3.5 text-teal-400" />
                              {new Date(schedule.examDate).toLocaleDateString(
                                'en-US',
                                {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                }
                              )}
                            </span>
                            <span className="bg-white/[0.04] px-3 py-1.5 rounded-lg font-mono border border-white/[0.06]">
                              {schedule.examTime}
                            </span>
                            {schedule.roomNumber && (
                              <span className="bg-white/[0.04] px-3 py-1.5 rounded-lg border border-white/[0.06]">
                                Room: {schedule.roomNumber}
                              </span>
                            )}
                          </div>
                        </div>
                        <span
                          className={`self-start sm:self-center px-3 py-1.5 rounded-full text-xs font-bold capitalize shrink-0 ${getStatusColor(
                            schedule.status
                          )}`}
                        >
                          {schedule.status || 'upcoming'}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className={`${ui.panel} p-5 sm:p-6`}>
              <h2 className="text-base font-bold text-slate-100 mb-6 flex items-center gap-3">
                <span className="p-2 bg-gradient-to-br from-amber-500/25 to-orange-500/10 text-amber-300 rounded-xl ring-1 ring-amber-500/30">
                  <BellIcon className="w-5 h-5" />
                </span>
                Portal announcements
              </h2>

              <div className="space-y-3">
                {notifications.length === 0 ? (
                  <EmptyState
                    icon={BellIcon}
                    title="No new notifications"
                    hint="Important notifications and alerts will appear here."
                  />
                ) : (
                  notifications.map((notification) => (
                    <div
                      key={notification._id}
                      className="relative bg-white/[0.02] hover:bg-gradient-to-r hover:from-amber-500/[0.04] hover:to-transparent rounded-xl p-4 flex items-start gap-3.5 border border-white/[0.04] hover:border-amber-500/20 transition-all duration-300"
                    >
                      <div className="p-2 bg-gradient-to-br from-amber-500/25 to-orange-500/10 text-amber-300 rounded-lg mt-0.5 shrink-0 ring-1 ring-amber-500/25">
                        <BellIcon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-slate-100 text-sm">
                          {notification.title}
                        </p>
                        <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                          {notification.message}
                        </p>
                        <p className="text-[11px] text-slate-600 mt-2.5 font-mono">
                          {new Date(notification.createdAt).toLocaleDateString(
                            'en-US',
                            {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            }
                          )}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'profile' && (
            <div className={`${ui.panel} p-5 sm:p-6 max-w-2xl`}>
              <h2 className="text-base font-bold text-slate-100 mb-6 flex items-center gap-3">
                <span className="p-2 bg-gradient-to-br from-teal-500/25 to-emerald-500/10 text-teal-300 rounded-xl ring-1 ring-teal-500/30">
                  <Cog6ToothIcon className="w-5 h-5" />
                </span>
                Profile settings
              </h2>

              <form onSubmit={handleProfileUpdate} className="space-y-5">
                <div>
                  <label className={ui.label}>Full name</label>
                  <input
                    type="text"
                    value={profileData.name}
                    onChange={(e) =>
                      setProfileData({ ...profileData, name: e.target.value })
                    }
                    className={ui.input}
                  />
                </div>
                <div>
                  <label className={ui.label}>Email address</label>
                  <input
                    type="email"
                    value={profileData.email}
                    disabled
                    className={`${ui.input} text-slate-500 cursor-not-allowed opacity-70`}
                  />
                </div>
                <div>
                  <label className={ui.label}>Phone number</label>
                  <input
                    type="text"
                    value={profileData.phone}
                    onChange={(e) =>
                      setProfileData({ ...profileData, phone: e.target.value })
                    }
                    className={ui.input}
                  />
                </div>
                <div>
                  <label className={ui.label}>City</label>
                  <input
                    type="text"
                    value={profileData.city}
                    onChange={(e) =>
                      setProfileData({ ...profileData, city: e.target.value })
                    }
                    className={ui.input}
                  />
                </div>

                {user?.examCenter && (
                  <div className="bg-gradient-to-br from-emerald-500/[0.08] to-teal-500/[0.04] ring-1 ring-emerald-500/20 rounded-xl p-4">
                    <p className="text-[11px] font-bold text-emerald-300 uppercase tracking-widest mb-2">
                      Your Exam Center
                    </p>
                    <p className="text-sm font-bold text-slate-100">
                      {typeof user.examCenter === 'object'
                        ? user.examCenter.name
                        : 'Linked'}
                    </p>
                    {typeof user.examCenter === 'object' && (
                      <>
                        <p className="text-xs text-slate-400 mt-1">
                          {user.examCenter.centerCode} · {user.examCenter.city}
                        </p>
                      </>
                    )}
                    {user.rollNumber && (
                      <p className="text-xs text-slate-400 mt-1 font-mono">
                        Roll No: {user.rollNumber}
                      </p>
                    )}
                    {user.grade && (
                      <p className="text-xs text-slate-400 mt-1">
                        Grade: {user.grade}th Class
                      </p>
                    )}
                  </div>
                )}

                <button type="submit" className={`${ui.btnPrimary} w-full mt-2`}>
                  Save changes
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentPortal;