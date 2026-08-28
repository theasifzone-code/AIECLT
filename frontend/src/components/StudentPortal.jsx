// components/StudentPortal.jsx - ✅ FULL STUDENT PORTAL (All Features)
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import {
  MapPinIcon,
  CameraIcon,
  MagnifyingGlassIcon,
  ArrowRightOnRectangleIcon,
  AcademicCapIcon,
  BuildingOfficeIcon,
  ClockIcon,
  UserIcon,
  SparklesIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  Bars3Icon,
  BellIcon,
  HomeIcon,
  XMarkIcon,
  PaperAirplaneIcon,
  CalendarIcon,
  DocumentTextIcon,
  ChartBarIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';

const StudentPortal = () => {
  const { user, logout, updateUser } = useAuth();
  const fileInputRef = useRef(null);
  const [activeTab, setActiveTab] = useState('search'); 
  const [notifications, setNotifications] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [results, setResults] = useState([]);
  const [file, setFile] = useState(null);
  const [centerCode, setCenterCode] = useState('');
  const [center, setCenter] = useState(null);
  const [route, setRoute] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [location, setLocation] = useState(null);
  const [recentCenters, setRecentCenters] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [fileName, setFileName] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    city: user?.city || ''
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
    fetchResults();
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
      const res = await api.get('/schedules/student');
      setSchedules(res.data.schedules || []);
    } catch (error) {
      console.error('Error fetching schedules:', error);
    }
  };

  const fetchResults = async () => {
    try {
      const res = await api.get('/results/student');
      setResults(res.data.results || []);
    } catch (error) {
      console.error('Error fetching results:', error);
    }
  };

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        },
        (err) => {
          console.warn('Geolocation error:', err.message);
          setLocation({ lat: 24.8607, lng: 67.0011 });
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    } else {
      setLocation({ lat: 24.8607, lng: 67.0011 });
    }
  };

  const loadRecentCenters = () => {
    const saved = localStorage.getItem('recentCenters');
    if (saved) {
      setRecentCenters(JSON.parse(saved));
    }
  };

  const saveRecentCenter = (centerData) => {
    const updated = [centerData, ...recentCenters.filter(c => c._id !== centerData._id)].slice(0, 5);
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

    setFile(selectedFile);
    setFileName(selectedFile.name);
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
      toast.success('Center found successfully! 🎉');

      if (location) fetchRoute(response.data.center);
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'OCR failed. Try manual entry.';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
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
      toast.success('Center found! 🎉');

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
    if (!location) return;

    try {
      const response = await api.post('/route/get-route', {
        originLat: parseFloat(location.lat),
        originLng: parseFloat(location.lng),
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
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
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

  const displayName = user?.name && user.name !== 'api.js' ? user.name : 'Student';

  const menuItems = [
    { id: 'search', label: 'Find Center', icon: MapPinIcon },
    { id: 'schedules', label: 'Exam Schedule', icon: CalendarIcon },
    { id: 'results', label: 'My Results', icon: ChartBarIcon },
    { id: 'notifications', label: 'Notifications', icon: BellIcon },
    { id: 'profile', label: 'Profile Settings', icon: Cog6ToothIcon },
  ];

  const getStatusColor = (status) => {
    const colors = {
      'upcoming': 'bg-blue-500/20 text-blue-400',
      'ongoing': 'bg-green-500/20 text-green-400',
      'completed': 'bg-gray-500/20 text-gray-400',
      'cancelled': 'bg-red-500/20 text-red-400',
      'postponed': 'bg-yellow-500/20 text-yellow-400'
    };
    return colors[status] || colors['upcoming'];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 pb-20 lg:pb-0">
      {/* ==================== MAIN CONTENT ==================== */}
      <main className="lg:ml-64 min-h-screen overflow-y-auto">
        <header className="bg-white/5 backdrop-blur-md border-b border-white/10 sticky top-0 z-10 px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-white">{menuItems.find(item => item.id === activeTab)?.label || 'Dashboard'}</h1>
              <p className="text-sm text-gray-400">Welcome back, {user?.name}</p>
            </div>
            <div className="hidden md:flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">{user?.name?.charAt(0)?.toUpperCase() || 'U'}</div>
              <div>
                <p className="text-sm font-medium text-white">{user?.name}</p>
                <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
              </div>
            </div>
          </div>
        </header>

        <div className="p-4 sm:p-6">
          {/* ==================== SEARCH TAB ==================== */}
          {activeTab === 'search' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Panel - Controls */}
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-4 sm:p-6 hover:border-white/20 transition">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                    <MapPinIcon className="w-5 h-5 text-blue-400" />
                    Find Your Exam Center
                  </h2>
                  {center && (
                    <button onClick={clearSearch} className="text-sm text-gray-400 hover:text-white transition flex items-center gap-1">
                      <ArrowPathIcon className="w-4 h-4" />
                      Clear
                    </button>
                  )}
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Upload Roll Number Slip</label>
                  <div className="relative group">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      disabled={loading}
                      className="w-full p-3 bg-white/5 border border-white/10 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-500/20 file:text-blue-400 hover:file:bg-blue-500/30 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus:ring-2 focus:ring-blue-500/20 outline-none"
                    />
                    <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                      <CameraIcon className="w-5 h-5 text-gray-400 group-hover:text-blue-400 transition" />
                    </div>
                  </div>
                  <p className="text-gray-500 text-xs mt-1">Upload roll number slip to auto-detect center</p>

                  {loading && uploadProgress > 0 && (
                    <div className="mt-2">
                      <div className="w-full bg-white/5 rounded-full h-1.5">
                        <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-1.5 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                      </div>
                      <p className="text-xs text-gray-400 mt-1">{uploadProgress}% uploaded</p>
                    </div>
                  )}
                </div>

                <div className="text-center text-gray-500 text-sm my-4">— OR —</div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter Center Code (e.g., CTR001)"
                    value={centerCode}
                    onChange={(e) => setCenterCode(e.target.value.toUpperCase())}
                    className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-white placeholder-gray-500 transition"
                    onKeyDown={(e) => e.key === 'Enter' && handleManualSearch()}
                  />
                  <button
                    onClick={handleManualSearch}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 sm:px-6 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg transition disabled:opacity-50 font-medium shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40"
                  >
                    <MagnifyingGlassIcon className="w-4 h-4" />
                    <span className="hidden sm:inline">Search</span>
                  </button>
                </div>

                {loading && (
                  <div className="mt-4 flex items-center justify-center gap-2 text-blue-400 animate-pulse">
                    <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                    <span>Processing...</span>
                  </div>
                )}

                {error && (
                  <div className="mt-4 bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg text-sm flex items-start gap-2 animate-slide-down">
                    <XCircleIcon className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                {center && (
                  <div className="mt-6 bg-green-500/10 border border-green-500/50 rounded-xl p-4 animate-fade-in">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircleIcon className="w-5 h-5 text-green-400" />
                      <h4 className="font-semibold text-green-400">Center Found!</h4>
                    </div>
                    <div className="space-y-1 text-sm text-gray-300">
                      <p><span className="text-gray-400">Code:</span> {center.centerCode}</p>
                      <p><span className="text-gray-400">Name:</span> {center.name}</p>
                      <p><span className="text-gray-400">Address:</span> {center.address}</p>
                      <p><span className="text-gray-400">City:</span> {center.city}</p>
                    </div>
                  </div>
                )}

                {route && (
                  <div className="mt-4 bg-blue-500/10 border border-blue-500/50 rounded-xl p-4 animate-fade-in">
                    <h4 className="font-semibold text-blue-400 mb-2 flex items-center gap-2">🚗 Route Information</h4>
                    <div className="space-y-1 text-sm text-gray-300">
                      <p><span className="text-gray-400">Distance:</span> {route.distance} km</p>
                      <p><span className="text-gray-400">ETA:</span> {route.duration} min</p>
                    </div>
                  </div>
                )}

                {recentCenters.length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">
                      <ClockIcon className="w-4 h-4" />
                      Recent Centers
                    </h4>
                    <div className="space-y-2">
                      {recentCenters.map((c) => (
                        <button
                          key={c._id}
                          onClick={() => { setCenter(c); setCenterCode(c.centerCode); setError(''); if (location) fetchRoute(c); toast.success(`Selected: ${c.name}`); }}
                          className="w-full flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 rounded-lg transition text-left group"
                        >
                          <div>
                            <p className="text-sm font-medium text-white group-hover:text-blue-400 transition">{c.name}</p>
                            <p className="text-xs text-gray-400">{c.centerCode}</p>
                          </div>
                          <BuildingOfficeIcon className="w-4 h-4 text-gray-400 group-hover:text-blue-400 transition" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Panel - Map */}
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-4 sm:p-6 hover:border-white/20 transition">
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">🗺️ Map View</h2>
                <div className="bg-white/5 rounded-xl h-96 flex items-center justify-center border border-white/5 relative overflow-hidden">
                  {center ? (
                    <div className="text-center p-6 animate-fade-in">
                      <div className="text-6xl mb-4 animate-float">📍</div>
                      <h3 className="text-xl font-semibold text-white">{center.name}</h3>
                      <p className="text-gray-400 text-sm mt-1">{center.address}</p>
                      <p className="text-gray-500 text-xs mt-2">Coordinates: {center.latitude}, {center.longitude}</p>
                      {route && (
                        <div className="mt-4 bg-blue-500/20 rounded-lg p-3 border border-blue-500/20">
                          <p className="text-blue-400 text-sm font-medium flex items-center justify-center gap-2">
                            <span>🚗</span>
                            {route.distance} km • {route.duration} min
                          </p>
                        </div>
                      )}
                      <button
                        onClick={() => window.open(`https://www.google.com/maps?q=${center.latitude},${center.longitude}`, '_blank')}
                        className="mt-4 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition text-sm font-medium hover:scale-105"
                      >
                        Open in Google Maps
                      </button>
                    </div>
                  ) : (
                    <div className="text-center text-gray-400">
                      <div className="text-6xl mb-4 opacity-50">🗺️</div>
                      <p className="text-lg">No center selected</p>
                      <p className="text-sm">Search for a center to see location</p>
                      <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-500">
                        <SparklesIcon className="w-3 h-3 text-blue-400" />
                        Upload slip or enter code above
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ==================== SCHEDULES TAB ==================== */}
          {activeTab === 'schedules' && (
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5 text-blue-400" />
                  Exam Schedule
                </h2>
              </div>

              <div className="space-y-4">
                {schedules.length === 0 ? (
                  <div className="bg-white/5 rounded-lg p-8 border border-white/5 text-center text-gray-400">
                    <CalendarIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg">No schedules found</p>
                    <p className="text-sm">Your exam schedule will appear here.</p>
                  </div>
                ) : (
                  schedules.map((schedule) => (
                    <div key={schedule._id} className="bg-white/5 rounded-lg p-4 border border-white/5 hover:border-white/10 transition">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-white">{schedule.subject}</p>
                          <p className="text-sm text-gray-400 mt-1">
                            {schedule.examCenterId?.name} • {schedule.examCenterId?.city}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(schedule.status)}`}>
                          {schedule.status || 'upcoming'}
                        </span>
                      </div>
                      <div className="mt-3 flex items-center gap-4 text-sm text-gray-400">
                        <span className="flex items-center gap-1">
                          <ClockIcon className="w-4 h-4" />
                          {new Date(schedule.examDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                        <span>{schedule.examTime}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ==================== RESULTS TAB ==================== */}
          {activeTab === 'results' && (
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                  <ChartBarIcon className="w-5 h-5 text-green-400" />
                  My Results
                </h2>
              </div>

              <div className="space-y-4">
                {results.length === 0 ? (
                  <div className="bg-white/5 rounded-lg p-8 border border-white/5 text-center text-gray-400">
                    <ChartBarIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg">No results yet</p>
                    <p className="text-sm">Your exam results will appear here.</p>
                  </div>
                ) : (
                  results.map((result) => (
                    <div key={result._id} className="bg-white/5 rounded-lg p-4 border border-white/5 hover:border-white/10 transition">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-white">{result.subject}</p>
                          <p className="text-sm text-gray-400 mt-1">Grade: {result.grade || 'N/A'}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-green-400">{result.marks || '0'}</p>
                          <p className="text-xs text-gray-400">Marks</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ==================== NOTIFICATIONS TAB ==================== */}
          {activeTab === 'notifications' && (
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                  <BellIcon className="w-5 h-5 text-yellow-400" />
                  My Notifications
                </h2>
              </div>

              <div className="space-y-4">
                {notifications.length === 0 ? (
                  <div className="bg-white/5 rounded-lg p-8 border border-white/5 text-center text-gray-400">
                    <BellIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg">No notifications yet</p>
                    <p className="text-sm">You'll see exam updates and announcements here.</p>
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <div key={notification._id} className="bg-white/5 rounded-lg p-4 border border-white/5 hover:border-white/10 transition">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-semibold text-white">{notification.title}</p>
                          <p className="text-sm text-gray-400 mt-1">{notification.message}</p>
                          <p className="text-xs text-gray-500 mt-2">
                            {new Date(notification.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                        <BellIcon className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ==================== PROFILE TAB ==================== */}
          {activeTab === 'profile' && (
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                  <Cog6ToothIcon className="w-5 h-5 text-blue-400" />
                  Profile Settings
                </h2>
              </div>

              <form onSubmit={handleProfileUpdate} className="max-w-lg space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-white placeholder-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                  <input
                    type="email"
                    value={profileData.email}
                    disabled
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-400 placeholder-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-white placeholder-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">City</label>
                  <input
                    type="text"
                    value={profileData.city}
                    onChange={(e) => setProfileData({ ...profileData, city: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-white placeholder-gray-500"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg transition font-medium"
                >
                  Update Profile
                </button>
              </form>
            </div>
          )}
        </div>
      </main>

      {/* ==================== DESKTOP SIDEBAR ==================== */}
      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-64 bg-gray-800/50 backdrop-blur-md border-r border-white/10 flex-col">
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg shadow-blue-500/25"><AcademicCapIcon className="w-5 h-5 text-white" /></div>
            <span className="text-white font-bold text-lg">Student Portal</span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button key={item.id} onClick={() => setActiveTab(item.id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${activeTab === item.id ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-400' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">{user?.name?.charAt(0)?.toUpperCase() || 'U'}</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.name}</p>
              <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
            </div>
            <button onClick={logout} className="text-red-400 hover:text-red-300 p-2 rounded-lg transition"><ArrowRightOnRectangleIcon className="w-5 h-5" /></button>
          </div>
        </div>
      </aside>

      {/* ==================== MOBILE BOTTOM NAVIGATION (Fixed) ==================== */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-gray-900/90 backdrop-blur-md border-t border-white/10">
        <div className="flex items-center justify-around py-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center gap-1 px-4 py-1 rounded-lg transition ${activeTab === item.id ? 'text-blue-400' : 'text-gray-400'
                  }`}
              >
                <Icon className="w-6 h-6" />
                <span className="text-[10px] font-medium">{item.label}</span>
              </button>
            );
          })}
          <button
            onClick={logout}
            className="flex flex-col items-center gap-1 px-4 py-1 rounded-lg transition text-red-400"
          >
            <ArrowRightOnRectangleIcon className="w-6 h-6" />
            <span className="text-[10px] font-medium">Logout</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default StudentPortal;