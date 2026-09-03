// components/StudentPortal.jsx - Modernized + aligned with admin design system
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
  ChartBarIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';

// Shared design tokens — kept in sync with SuperAdminDashboard.jsx so the
// whole app reads as one product rather than two different styles.
const ui = {
  page: 'bg-[#0B0E14] text-slate-100',
  panel: 'bg-[#12151F] border border-white/[0.06]',
  panelHover: 'hover:border-white/[0.12]',
  input:
    'w-full px-4 py-2.5 bg-[#0B0E14] border border-white/10 rounded-lg text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-teal-500/60 focus:ring-1 focus:ring-teal-500/40 transition',
  label: 'block text-xs font-medium text-slate-400 mb-1.5',
  btnPrimary:
    'inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-teal-500 hover:bg-teal-400 text-[#06110D] text-sm font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed',
  btnGhost:
    'inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-medium transition border border-white/10',
  iconBtn: 'p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-white/5 transition',
};

const statusStyles = {
  upcoming: 'bg-sky-500/10 text-sky-300 ring-1 ring-sky-500/20',
  ongoing: 'bg-emerald-500/10 text-emerald-300 ring-1 ring-emerald-500/20',
  completed: 'bg-slate-500/10 text-slate-300 ring-1 ring-slate-500/20',
  cancelled: 'bg-rose-500/10 text-rose-300 ring-1 ring-rose-500/20',
  postponed: 'bg-amber-500/10 text-amber-300 ring-1 ring-amber-500/20',
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
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

 const fetchSchedules = async () => {
  try {
    console.log('📅 Fetching schedules...');
    const res = await api.get('/schedules/student');
    console.log('📅 Response:', res.data);
    
    // ✅ Get data properly
    const schedulesData = res.data.data || [];
    console.log('📅 Schedules Data:', schedulesData);
    console.log('📅 Schedules Count:', schedulesData.length);
    
    // ✅ Update state
    setSchedules(schedulesData);
    
    // ✅ Verify state update
    setTimeout(() => {
      console.log('📅 After setSchedules, current schedules:', schedules);
    }, 200);
    
  } catch (error) {
    console.error('❌ Error fetching schedules:', error);
    toast.error('Failed to load schedules');
  }
};


  // StudentPortal.jsx - Updated getLocation

const getLocation = () => {
  console.log('📍 Getting location...');
  
  if (!navigator.geolocation) {
    console.warn('❌ Browser does not support geolocation');
    // ✅ Default: Lahore (31.5204, 74.3587)
    setLocation({ lat: 31.5204, lng: 74.3587 }); 
    return;
  }

  navigator.permissions.query({ name: 'geolocation' })
    .then((result) => {
      console.log('📍 Permission status:', result.state);
      
      if (result.state === 'denied') {
        console.warn('❌ Location permission denied');
        // ✅ Default: Lahore
        setLocation({ lat: 31.5204, lng: 74.3587 });
        toast.error('Location permission denied. Using Lahore as default location.');
        return;
      }
      
      const options = {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 60000
      };
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log('✅ Location found:', position.coords);
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          toast.success('Location detected successfully!');
        },
        (error) => {
          console.error('❌ Geolocation error:', error);
          handleLocationError(error);
        },
        options
      );
    })
    .catch((err) => {
      console.error('❌ Permission query error:', err);
      // ✅ Default: Lahore
      setLocation({ lat: 31.5204, lng: 74.3587 });
    });
};

const handleLocationError = (error) => {
  let message = 'Using default location';
  
  switch(error.code) {
    case error.PERMISSION_DENIED:
      message = 'Location permission denied. Please allow location access.';
      toast.error(message);
      break;
    case error.POSITION_UNAVAILABLE:
      message = 'Location information unavailable. Using default location.';
      toast.warning(message);
      break;
    case error.TIMEOUT:
      message = 'Location request timed out. Using default location.';
      toast.warning(message);
      break;
    default:
      message = 'Location error: ' + error.message;
      toast.warning(message);
  }
  
  // ✅ Default location: Lahore (31.5204, 74.3587)
  setLocation({ lat: 31.5204, lng: 74.3587 });
  console.log('📍 Using default location (Lahore):', { lat: 31.5204, lng: 74.3587 });
};

  const loadRecentCenters = () => {
    const saved = localStorage.getItem('recentCenters');
    if (saved) setRecentCenters(JSON.parse(saved));
  };

  const saveRecentCenter = (centerData) => {
    const updated = [centerData, ...recentCenters.filter((c) => c._id !== centerData._id)].slice(0, 5);
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
      const response = await api.uploadFile('/ocr/extract-center', formData, (progress) => {
        setUploadProgress(progress);
      });

      setCenter(response.data.center);
      setCenterCode(response.data.centerCode);
      saveRecentCenter(response.data.center);
      toast.success('Center found successfully!');

      if (location) fetchRoute(response.data.center);
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'OCR failed. Try manual entry.';
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
  // ✅ Agar location null hai, toh default (Lahore) use karein
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
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  const menuItems = [
    { id: 'search', label: 'Find Center', icon: MapPinIcon },
    { id: 'schedules', label: 'Exam Schedule', icon: CalendarIcon },
    { id: 'notifications', label: 'Notifications', icon: BellIcon },
    { id: 'profile', label: 'Profile Settings', icon: Cog6ToothIcon },
  ];

  const getStatusColor = (status) => statusStyles[status] || statusStyles.upcoming;

  const EmptyState = ({ icon: Icon, title, hint }) => (
    <div className={`${ui.panel} rounded-xl p-10 text-center`}>
      <Icon className="w-9 h-9 mx-auto mb-3 text-slate-600" />
      <p className="text-sm font-medium text-slate-300">{title}</p>
      {hint && <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">{hint}</p>}
    </div>
  );

  const NavList = ({ onNavigate }) => (
    <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
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
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg transition relative text-sm font-medium ${
              isActive ? 'bg-teal-500/10 text-teal-300' : 'text-slate-400 hover:text-slate-100 hover:bg-white/5'
            }`}
          >
            {isActive && <span className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-full bg-teal-400" />}
            <Icon className="w-5 h-5 flex-shrink-0" />
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );

  return (
    <div className={`h-screen flex overflow-hidden ${ui.page}`}>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 bg-[#0F1219] border-r border-white/[0.06] flex-col shrink-0">
        <div className="p-5 border-b border-white/[0.06] flex items-center gap-3">
          <div className="p-2 bg-teal-500/15 rounded-lg">
            <AcademicCapIcon className="w-5 h-5 text-teal-400" />
          </div>
          <div>
            <span className="text-slate-100 font-semibold block leading-tight">Student Portal</span>
            <span className="text-xs text-slate-500">Exam board system</span>
          </div>
        </div>

        <NavList />

        <div className="p-3 m-3 bg-white/[0.03] rounded-xl border border-white/[0.06] flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-teal-500/15 flex items-center justify-center text-teal-300 font-semibold text-sm shrink-0">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-100 truncate">{user?.name || 'Student'}</p>
            <p className="text-xs text-slate-500 capitalize truncate">{user?.role || 'Student'}</p>
          </div>
          <button onClick={logout} title="Logout" className="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-500/10 transition">
            <ArrowRightOnRectangleIcon className="w-5 h-5" />
          </button>
        </div>
      </aside>

      {/* Mobile drawer */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setMobileDrawerOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-72 max-w-[85vw] bg-[#0F1219] border-r border-white/[0.06] flex flex-col">
            <div className="p-4 border-b border-white/[0.06] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-teal-500/15 rounded-lg">
                  <AcademicCapIcon className="w-5 h-5 text-teal-400" />
                </div>
                <span className="text-slate-100 font-semibold">Student Portal</span>
              </div>
              <button onClick={() => setMobileDrawerOpen(false)} className={ui.iconBtn}><XMarkIcon className="w-5 h-5" /></button>
            </div>
            <NavList onNavigate={() => setMobileDrawerOpen(false)} />
            <div className="p-3 border-t border-white/[0.06]">
              <button
                onClick={logout}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-lg font-medium text-sm hover:bg-rose-500/15 transition"
              >
                <ArrowRightOnRectangleIcon className="w-5 h-5" />
                Logout
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="bg-[#0B0E14]/95 backdrop-blur-md border-b border-white/[0.06] sticky top-0 z-10 px-4 sm:px-6 py-3.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button onClick={() => setMobileDrawerOpen(true)} className={`lg:hidden ${ui.iconBtn}`}>
              <Bars3Icon className="w-6 h-6" />
            </button>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl font-bold text-slate-50 truncate">{menuItems.find((item) => item.id === activeTab)?.label || 'Dashboard'}</h1>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 bg-white/[0.04] pl-1.5 pr-3 py-1.5 rounded-lg shrink-0">
            <div className="w-7 h-7 rounded-full bg-teal-500/15 flex items-center justify-center text-teal-300 font-semibold text-xs">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div>
              <p className="text-sm font-medium text-slate-100 leading-tight">{user?.name}</p>
              <p className="text-xs text-slate-500 capitalize leading-tight">{user?.role}</p>
            </div>
          </div>
        </header>

        <div className="p-4 sm:p-6 flex-1 w-full mx-auto">
          {/* SEARCH TAB */}
          {activeTab === 'search' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {/* Left: controls */}
              <div className={`${ui.panel} rounded-xl p-5 sm:p-6`}>
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2.5">
                    <span className="p-1.5 bg-teal-500/10 text-teal-400 rounded-lg"><MapPinIcon className="w-5 h-5" /></span>
                    Find your exam center
                  </h2>
                  {center && (
                    <button onClick={clearSearch} className={ui.btnGhost}>
                      <ArrowPathIcon className="w-3.5 h-3.5" /> Clear
                    </button>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <label className={ui.label}>Upload roll number slip</label>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      disabled={loading}
                      className="w-full text-sm p-3 bg-[#0B0E14] border border-white/10 rounded-lg text-slate-400 file:mr-4 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:bg-teal-500/15 file:text-teal-300 file:text-xs file:font-medium hover:file:bg-teal-500/25 cursor-pointer disabled:opacity-50 outline-none transition"
                    />
                    <p className="text-slate-500 text-xs mt-1.5">Upload a clear photo to auto-detect your center via OCR.</p>

                    {loading && uploadProgress > 0 && (
                      <div className="mt-3">
                        <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                          <div className="bg-teal-500 h-full rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                        </div>
                        <p className="text-xs text-slate-500 mt-1 text-right">{uploadProgress}% uploaded</p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-px bg-white/[0.06]" />
                    <span className="text-slate-500 text-xs font-medium">or search manually</span>
                    <div className="flex-1 h-px bg-white/[0.06]" />
                  </div>

                  <div className="flex gap-2.5">
                    <input
                      type="text"
                      placeholder="Center code (e.g. CTR001)"
                      value={centerCode}
                      onChange={(e) => setCenterCode(e.target.value.toUpperCase())}
                      onKeyDown={(e) => e.key === 'Enter' && handleManualSearch()}
                      className={`${ui.input} flex-1`}
                    />
                    <button onClick={handleManualSearch} disabled={loading} className={`${ui.btnPrimary} shrink-0`}>
                      <MagnifyingGlassIcon className="w-4 h-4" />
                      <span className="hidden sm:inline">Search</span>
                    </button>
                  </div>
                </div>

                {loading && !uploadProgress && (
                  <div className="mt-4 flex items-center justify-center gap-2.5 text-teal-300 py-3.5 bg-teal-500/10 rounded-lg">
                    <div className="w-4 h-4 border-2 border-teal-400 border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm font-medium">Processing request...</span>
                  </div>
                )}

                {error && (
                  <div className="mt-4 bg-rose-500/10 ring-1 ring-rose-500/20 text-rose-300 p-3.5 rounded-lg text-sm flex items-start gap-2.5">
                    <XCircleIcon className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                {center && (
                  <div className="mt-5 bg-emerald-500/[0.06] ring-1 ring-emerald-500/20 rounded-lg p-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <CheckCircleIcon className="w-5 h-5 text-emerald-400" />
                      <h4 className="font-semibold text-emerald-300 text-sm">Center identified</h4>
                    </div>
                    <div className="space-y-1 text-sm text-slate-300 pt-2 border-t border-emerald-500/15">
                      <p><span className="text-slate-500">Code:</span> <strong className="text-slate-100 font-medium">{center.centerCode}</strong></p>
                      <p><span className="text-slate-500">Name:</span> <strong className="text-slate-100 font-medium">{center.name}</strong></p>
                      <p><span className="text-slate-500">Address:</span> {center.address}</p>
                      <p><span className="text-slate-500">City:</span> {center.city}</p>
                    </div>
                  </div>
                )}

                {route && (
                  <div className="mt-4 bg-sky-500/[0.06] ring-1 ring-sky-500/20 rounded-lg p-4">
                    <h4 className="font-semibold text-sky-300 text-xs mb-1.5">Route estimate</h4>
                    <div className="flex gap-5 text-sm text-slate-300">
                      <p><span className="text-slate-500">Distance:</span> <strong className="text-slate-100 font-medium">{route.distance} km</strong></p>
                      <p><span className="text-slate-500">Time:</span> <strong className="text-slate-100 font-medium">{route.duration} min</strong></p>
                    </div>
                  </div>
                )}

                {recentCenters.length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-xs font-medium text-slate-500 mb-3 flex items-center gap-1.5">
                      <ClockIcon className="w-3.5 h-3.5" /> Recent searches
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
                          className="w-full flex items-center justify-between p-3 bg-white/[0.03] hover:bg-white/[0.06] rounded-lg transition text-left group"
                        >
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-slate-100 truncate group-hover:text-teal-300 transition">{c.name}</p>
                            <p className="text-xs text-slate-500 font-mono mt-0.5">{c.centerCode} · {c.city}</p>
                          </div>
                          <BuildingOfficeIcon className="w-4 h-4 text-slate-600 group-hover:text-teal-400 transition shrink-0" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right: map preview */}
              <div className={`${ui.panel} rounded-xl p-5 sm:p-6 flex flex-col`}>
                <h2 className="text-base font-semibold text-slate-100 mb-4 flex items-center gap-2.5">
                  <span className="p-1.5 bg-violet-500/10 text-violet-400 rounded-lg"><BuildingOfficeIcon className="w-5 h-5" /></span>
                  Location preview
                </h2>
                <div className="flex-1 min-h-[320px] bg-[#0B0E14] rounded-lg flex items-center justify-center border border-white/[0.04]">
                  {center ? (
                    <div className="text-center p-6 space-y-3">
                      <div className="inline-flex p-3 rounded-full bg-teal-500/10 text-teal-400">
                        <MapPinIcon className="w-7 h-7" />
                      </div>
                      <h3 className="text-lg font-semibold text-slate-100">{center.name}</h3>
                      <p className="text-slate-500 text-xs max-w-xs mx-auto">{center.address}</p>
                      <p className="text-slate-600 text-[11px] font-mono">{center.latitude}, {center.longitude}</p>
                      {route && (
                        <div className="bg-sky-500/[0.06] ring-1 ring-sky-500/20 rounded-lg py-2 px-4 max-w-xs mx-auto">
                          <p className="text-sky-300 text-xs font-medium">{route.distance} km away · {route.duration} min drive</p>
                        </div>
                      )}
                     <button
  onClick={() => {
    // ✅ Student ki exact location (browser se mili hui)
    const originLat = location?.lat || 31.5204; 
    const originLng = location?.lng || 74.3587;

    // ✅ Center ka ADDRESS (exact location ke liye address use karein)
    // Agar database mein address hai, toh encoded address pass karein
    const destAddress = encodeURIComponent(center.address || center.name);

    // ✅ "dir" (Directions) API use karein
    // Origin = Student ki exact coordinates
    // Destination = Center ka address (Google Maps khud us address ko dhoondhega)
    window.open(
      `https://www.google.com/maps/dir/?api=1&origin=${originLat},${originLng}&destination=${destAddress}&travelmode=driving`,
      '_blank'
    );
  }}
  className={`${ui.btnGhost} mt-1`}
>
  Open in Google Maps
</button>
                    </div>
                  ) : (
                    <div className="text-center text-slate-500 p-6 space-y-2">
                      <MapPinIcon className="w-9 h-9 mx-auto text-slate-700" />
                      <p className="text-sm font-medium text-slate-400">No center selected</p>
                      <p className="text-xs text-slate-600 max-w-xs mx-auto">Upload your exam slip or enter a center code to preview its location.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* SCHEDULES TAB */}
       {activeTab === 'schedules' && (
  <div className={`${ui.panel} rounded-xl p-5 sm:p-6`}>
   

    <h2 className="text-base font-semibold text-slate-100 mb-5 flex items-center gap-2.5">
      <span className="p-1.5 bg-sky-500/10 text-sky-400 rounded-lg">
        <CalendarIcon className="w-5 h-5" />
      </span>
      Upcoming exam schedules
    </h2>

    <div className="space-y-3">
      {schedules.length === 0 ? (
        <EmptyState 
          icon={CalendarIcon} 
          title="No schedules found" 
          hint="Your registered examination dates will appear here." 
        />
      ) : (
        schedules.map((schedule) => (
          <div key={schedule._id} className="bg-white/[0.03] rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="font-medium text-slate-100">{schedule.subject}</p>
              <p className="text-xs text-slate-500 mt-0.5">
                {schedule.examCenterId?.name || 'Center assigned'} · {schedule.examCenterId?.city || 'City'}
              </p>
              <div className="mt-2.5 flex flex-wrap items-center gap-2 text-xs text-slate-400">
                <span className="flex items-center gap-1.5 bg-white/[0.04] px-2.5 py-1 rounded-md">
                  <ClockIcon className="w-3.5 h-3.5 text-teal-400" />
                  {new Date(schedule.examDate).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric', 
                    year: 'numeric' 
                  })}
                </span>
                <span className="bg-white/[0.04] px-2.5 py-1 rounded-md font-mono">
                  {schedule.examTime}
                </span>
              </div>
            </div>
            <span className={`self-start sm:self-center px-2.5 py-1 rounded-full text-xs font-medium capitalize shrink-0 ${getStatusColor(schedule.status)}`}>
              {schedule.status || 'upcoming'}
            </span>
          </div>
        ))
      )}
    </div>
  </div>
)}

         

          {/* NOTIFICATIONS TAB */}
          {activeTab === 'notifications' && (
            <div className={`${ui.panel} rounded-xl p-5 sm:p-6`}>
              <h2 className="text-base font-semibold text-slate-100 mb-5 flex items-center gap-2.5">
                <span className="p-1.5 bg-amber-500/10 text-amber-400 rounded-lg"><BellIcon className="w-5 h-5" /></span>
                Portal announcements
              </h2>

              <div className="space-y-3">
                {notifications.length === 0 ? (
                  <EmptyState icon={BellIcon} title="No new notifications" hint="Important notifications and alerts will appear here." />
                ) : (
                  notifications.map((notification) => (
                    <div key={notification._id} className="bg-white/[0.03] rounded-lg p-4 flex items-start gap-3">
                      <div className="p-1.5 bg-amber-500/10 text-amber-400 rounded-lg mt-0.5 shrink-0">
                        <BellIcon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-slate-100 text-sm">{notification.title}</p>
                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">{notification.message}</p>
                        <p className="text-[11px] text-slate-600 mt-2 font-mono">
                          {new Date(notification.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* PROFILE TAB */}
          {activeTab === 'profile' && (
            <div className={`${ui.panel} rounded-xl p-5 sm:p-6 max-w-xl`}>
              <h2 className="text-base font-semibold text-slate-100 mb-5 flex items-center gap-2.5">
                <span className="p-1.5 bg-teal-500/10 text-teal-400 rounded-lg"><Cog6ToothIcon className="w-5 h-5" /></span>
                Profile settings
              </h2>

              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div>
                  <label className={ui.label}>Full name</label>
                  <input type="text" value={profileData.name} onChange={(e) => setProfileData({ ...profileData, name: e.target.value })} className={ui.input} />
                </div>
                <div>
                  <label className={ui.label}>Email address</label>
                  <input type="email" value={profileData.email} disabled className={`${ui.input} text-slate-500 cursor-not-allowed opacity-70`} />
                </div>
                <div>
                  <label className={ui.label}>Phone number</label>
                  <input type="text" value={profileData.phone} onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })} className={ui.input} />
                </div>
                <div>
                  <label className={ui.label}>City</label>
                  <input type="text" value={profileData.city} onChange={(e) => setProfileData({ ...profileData, city: e.target.value })} className={ui.input} />
                </div>
                <button type="submit" className={`${ui.btnPrimary} w-full mt-1`}>
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