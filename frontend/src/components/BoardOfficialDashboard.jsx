// components/BoardOfficialDashboard.jsx - ✅ 100% MOBILE RESPONSIVE
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { 
  BuildingOfficeIcon,
  CalendarIcon,
  BellIcon,
  PlusIcon,
  XMarkIcon,
  TrashIcon,
  ClockIcon,
  UserGroupIcon,
  ArrowRightOnRectangleIcon,
  MagnifyingGlassIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  HomeIcon,
  Bars3Icon,
  PencilIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  PaperAirplaneIcon
} from '@heroicons/react/24/outline';

const BoardOfficialDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('centers');
  const [centers, setCenters] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCenterForm, setShowCenterForm] = useState(false);
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true); // Desktop
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false); // Mobile
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('centerCode');
  const [sortDirection, setSortDirection] = useState('asc');
  const [editingCenter, setEditingCenter] = useState(null);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [stats, setStats] = useState({
    totalCenters: 0,
    totalSchedules: 0,
    upcomingExams: 0,
    totalStudents: 0
  });

  const [formData, setFormData] = useState({
    centerCode: '',
    name: '',
    address: '',
    latitude: '',
    longitude: '',
    city: '',
    capacity: '',
    contactNumber: '',
    contactEmail: ''
  });

  const [scheduleData, setScheduleData] = useState({
    examCenterId: '',
    examDate: '',
    examTime: '',
    subject: '',
    totalStudents: '',
    status: 'upcoming'
  });

  const [notificationData, setNotificationData] = useState({
    title: '',
    message: '',
    targetRole: 'all',
    type: 'general',
    priority: 'medium'
  });

  useEffect(() => {
    if (!user || (user.role !== 'board_official' && user.role !== 'admin')) {
      window.location.href = '/login';
      return;
    }
    fetchData();
    fetchNotifications();
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [centersRes, schedulesRes] = await Promise.all([
        api.get('/admin/centers'),
        api.get('/admin/schedules'),
      ]);
      setCenters(centersRes.data.centers || []);
      setSchedules(schedulesRes.data.schedules || []);
      
      const now = new Date();
      const upcoming = (schedulesRes.data.schedules || []).filter(s => 
        new Date(s.examDate) > now && s.status !== 'cancelled'
      );
      
      setStats({
        totalCenters: centersRes.data.centers?.length || 0,
        totalSchedules: schedulesRes.data.schedules?.length || 0,
        upcomingExams: upcoming.length,
        totalStudents: (schedulesRes.data.schedules || []).reduce((sum, s) => sum + (parseInt(s.totalStudents) || 0), 0)
      });
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/admin/notifications');
      setNotifications(res.data.notifications || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const handleNotificationSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/admin/notifications', notificationData);
      toast.success('Notification sent successfully!');
      setNotificationData({
        title: '',
        message: '',
        targetRole: 'all',
        type: 'general',
        priority: 'medium'
      });
      fetchNotifications();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error sending notification');
    }
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleCenterSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCenter) {
        await api.put(`/admin/centers/${editingCenter._id}`, formData);
        toast.success('Center updated successfully!');
      } else {
        await api.post('/admin/centers', formData);
        toast.success('Center created successfully!');
      }
      setShowCenterForm(false);
      setEditingCenter(null);
      setFormData({
        centerCode: '',
        name: '',
        address: '',
        latitude: '',
        longitude: '',
        city: '',
        capacity: '',
        contactNumber: '',
        contactEmail: ''
      });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error saving center');
    }
  };

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingSchedule) {
        await api.put(`/admin/schedules/${editingSchedule._id}`, scheduleData);
        toast.success('Schedule updated successfully!');
      } else {
        await api.post('/admin/schedules', scheduleData);
        toast.success('Schedule created successfully!');
      }
      setShowScheduleForm(false);
      setEditingSchedule(null);
      setScheduleData({
        examCenterId: '',
        examDate: '',
        examTime: '',
        subject: '',
        totalStudents: '',
        status: 'upcoming'
      });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error saving schedule');
    }
  };

  const deleteCenter = async (id) => {
    if (!confirm('Are you sure you want to delete this center?')) return;
    try {
      await api.delete(`/admin/centers/${id}`);
      toast.success('Center deleted successfully!');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error deleting center');
    }
  };

  const deleteSchedule = async (id) => {
    if (!confirm('Are you sure you want to delete this schedule?')) return;
    try {
      await api.delete(`/admin/schedules/${id}`);
      toast.success('Schedule deleted successfully!');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error deleting schedule');
    }
  };

  const editCenter = (center) => {
    setEditingCenter(center);
    setFormData({
      centerCode: center.centerCode || '',
      name: center.name || '',
      address: center.address || '',
      latitude: center.latitude || '',
      longitude: center.longitude || '',
      city: center.city || '',
      capacity: center.capacity || '',
      contactNumber: center.contactNumber || '',
      contactEmail: center.contactEmail || ''
    });
    setShowCenterForm(true);
  };

  const editSchedule = (schedule) => {
    setEditingSchedule(schedule);
    setScheduleData({
      examCenterId: schedule.examCenterId?._id || schedule.examCenterId || '',
      examDate: schedule.examDate ? new Date(schedule.examDate).toISOString().split('T')[0] : '',
      examTime: schedule.examTime || '',
      subject: schedule.subject || '',
      totalStudents: schedule.totalStudents || '',
      status: schedule.status || 'upcoming'
    });
    setShowScheduleForm(true);
  };

  const cancelCenterForm = () => {
    setShowCenterForm(false);
    setEditingCenter(null);
    setFormData({
      centerCode: '',
      name: '',
      address: '',
      latitude: '',
      longitude: '',
      city: '',
      capacity: '',
      contactNumber: '',
      contactEmail: ''
    });
  };

  const cancelScheduleForm = () => {
    setShowScheduleForm(false);
    setEditingSchedule(null);
    setScheduleData({
      examCenterId: '',
      examDate: '',
      examTime: '',
      subject: '',
      totalStudents: '',
      status: 'upcoming'
    });
  };

  const filteredCenters = (centers || [])
    .filter(center => 
      center.centerCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      center.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      center.city?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      let aVal = a[sortField] || '';
      let bVal = b[sortField] || '';
      if (typeof aVal === 'string') aVal = aVal.toLowerCase();
      if (typeof bVal === 'string') bVal = bVal.toLowerCase();
      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

  const filteredSchedules = (schedules || [])
    .filter(s => 
      s.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.examCenterId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.examCenterId?.centerCode?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortField === 'examDate') {
        return sortDirection === 'asc' 
          ? new Date(a.examDate) - new Date(b.examDate)
          : new Date(b.examDate) - new Date(a.examDate);
      }
      let aVal = a[sortField] || '';
      let bVal = b[sortField] || '';
      if (typeof aVal === 'string') aVal = aVal.toLowerCase();
      if (typeof bVal === 'string') bVal = bVal.toLowerCase();
      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

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

  const menuItems = [
    { id: 'centers', label: 'Exam Centers', icon: BuildingOfficeIcon },
    { id: 'schedules', label: 'Schedules', icon: CalendarIcon },
    { id: 'notifications', label: 'Notifications', icon: BellIcon },
  ];

  return (
    <div className="flex h-screen bg-gray-900">
      {/* ✅ MOBILE SIDEBAR (Off-canvas) */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileSidebarOpen(false)}></div>
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-gray-800 border-r border-white/10 flex flex-col animate-slide-in">
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl"><BuildingOfficeIcon className="w-5 h-5 text-white" /></div>
                <span className="text-white font-bold text-lg">Board Official</span>
              </div>
              <button onClick={() => setMobileSidebarOpen(false)} className="text-gray-400 hover:text-white transition"><XMarkIcon className="w-5 h-5" /></button>
            </div>
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button key={item.id} onClick={() => { setActiveTab(item.id); setMobileSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${activeTab === item.id ? 'bg-gradient-to-r from-blue-500/20 to-indigo-500/20 text-blue-400' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </button>
                );
              })}
            </nav>
            <div className="p-4 border-t border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">{user?.name?.charAt(0)?.toUpperCase() || 'U'}</div>
                <div className="flex-1 min-w-0"><p className="text-sm font-medium text-white truncate">{user?.name}</p><p className="text-xs text-gray-400 capitalize truncate">{user?.role?.replace('_', ' ')}</p></div>
                <button onClick={logout} className="text-red-400 hover:text-red-300 p-2 rounded-lg transition"><ArrowRightOnRectangleIcon className="w-5 h-5" /></button>
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* ✅ DESKTOP SIDEBAR */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} hidden lg:flex bg-gray-800/50 backdrop-blur-md border-r border-white/10 transition-all duration-300 flex-col`}>
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-lg shadow-blue-500/25">
              <BuildingOfficeIcon className="w-5 h-5 text-white" />
            </div>
            {sidebarOpen && (
              <span className="text-white font-bold text-lg">Board Official</span>
            )}
          </div>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-400 hover:text-white transition">
            <Bars3Icon className="w-5 h-5" />
          </button>
        </div>

        {sidebarOpen && (
          <div className="p-4 border-b border-white/10 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Centers</span>
              <span className="text-white font-bold">{stats.totalCenters}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Schedules</span>
              <span className="text-white font-bold">{stats.totalSchedules}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Upcoming</span>
              <span className="text-green-400 font-bold">{stats.upcomingExams}</span>
            </div>
          </div>
        )}

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button key={item.id} onClick={() => setActiveTab(item.id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${activeTab === item.id ? 'bg-gradient-to-r from-blue-500/20 to-indigo-500/20 text-blue-400' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
                <Icon className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && (
                  <span className="text-sm font-medium">{item.label}</span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user?.name}</p>
                <p className="text-xs text-gray-400 capitalize truncate">{user?.role?.replace('_', ' ')}</p>
              </div>
            )}
            <button onClick={logout} className="text-red-400 hover:text-red-300 hover:bg-red-500/10 p-2 rounded-lg transition flex-shrink-0" title="Logout">
              <ArrowRightOnRectangleIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <header className="bg-white/5 backdrop-blur-md border-b border-white/10 sticky top-0 z-10 px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* ✅ Mobile Hamburger Button */}
              <button onClick={() => setMobileSidebarOpen(true)} className="lg:hidden text-gray-400 hover:text-white transition p-2 hover:bg-white/5 rounded-lg">
                <Bars3Icon className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-white">
                  {menuItems.find(item => item.id === activeTab)?.label || 'Dashboard'}
                </h1>
                <p className="text-sm text-gray-400">Welcome back, {user?.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-4 py-2 text-sm bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none w-full sm:w-48 text-white placeholder-gray-400"
                />
              </div>
              {activeTab !== 'notifications' && (
                <button
                  onClick={() => {
                    if (activeTab === 'centers') {
                      setShowCenterForm(true);
                      setEditingCenter(null);
                    } else {
                      setShowScheduleForm(true);
                      setEditingSchedule(null);
                    }
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg transition shadow-sm text-sm font-medium"
                >
                  <PlusIcon className="w-4 h-4" />
                  <span className="hidden sm:inline">
                    Add {activeTab === 'centers' ? 'Center' : 'Schedule'}
                  </span>
                </button>
              )}
            </div>
          </div>
        </header>

        <div className="p-4 sm:p-6">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-400">Loading data...</p>
              </div>
            </div>
          ) : (
            <>
              {/* Centers Tab */}
              {activeTab === 'centers' && (
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden">
                  {showCenterForm && (
                    <div className="p-4 sm:p-6 border-b border-white/10">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-white">
                          {editingCenter ? '✏️ Edit Center' : '➕ New Center'}
                        </h3>
                        <button onClick={cancelCenterForm} className="p-1.5 hover:bg-white/10 rounded-lg transition">
                          <XMarkIcon className="w-5 h-5 text-gray-400" />
                        </button>
                      </div>
                      <form onSubmit={handleCenterSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input type="text" name="centerCode" placeholder="Center Code *" value={formData.centerCode} onChange={(e) => setFormData({ ...formData, centerCode: e.target.value })} className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-white placeholder-gray-400" required />
                        <input type="text" name="name" placeholder="Center Name *" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-white placeholder-gray-400" required />
                        <input type="text" name="address" placeholder="Address *" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className="md:col-span-2 px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-white placeholder-gray-400" required />
                        <input type="number" name="latitude" placeholder="Latitude" value={formData.latitude} onChange={(e) => setFormData({ ...formData, latitude: e.target.value })} className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-white placeholder-gray-400" step="any" />
                        <input type="number" name="longitude" placeholder="Longitude" value={formData.longitude} onChange={(e) => setFormData({ ...formData, longitude: e.target.value })} className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-white placeholder-gray-400" step="any" />
                        <input type="text" name="city" placeholder="City *" value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-white placeholder-gray-400" required />
                        <input type="number" name="capacity" placeholder="Capacity" value={formData.capacity} onChange={(e) => setFormData({ ...formData, capacity: e.target.value })} className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-white placeholder-gray-400" />
                        <input type="text" name="contactNumber" placeholder="Contact Number" value={formData.contactNumber} onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })} className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-white placeholder-gray-400" />
                        <input type="email" name="contactEmail" placeholder="Contact Email" value={formData.contactEmail} onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })} className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-white placeholder-gray-400" />
                        <div className="md:col-span-2 flex gap-3">
                          <button type="submit" className="flex-1 px-6 py-2.5 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg transition shadow-sm font-medium">{editingCenter ? 'Update Center' : 'Create Center'}</button>
                          <button type="button" onClick={cancelCenterForm} className="px-6 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-lg transition font-medium">Cancel</button>
                        </div>
                      </form>
                    </div>
                  )}

                  <div className="p-4 sm:p-6">
                    {filteredCenters.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                        <BuildingOfficeIcon className="w-16 h-16 mb-4 opacity-20" />
                        <p className="text-lg">No centers found</p>
                        <p className="text-sm">Add your first exam center</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-white/5">
                            <tr>
                              {['centerCode', 'name', 'city', 'address', 'capacity', 'actions'].map((col) => (
                                <th key={col} className={`px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white transition ${col === 'actions' ? 'text-center' : ''}`} onClick={() => col !== 'actions' && handleSort(col)}>
                                  <div className="flex items-center gap-1">
                                    {col === 'actions' ? 'Actions' : col.replace(/([A-Z])/g, ' $1').trim()}
                                    {col !== 'actions' && sortField === col && (sortDirection === 'asc' ? <ChevronUpIcon className="w-3 h-3" /> : <ChevronDownIcon className="w-3 h-3" />)}
                                  </div>
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                            {filteredCenters.map((center) => (
                              <tr key={center._id} className="hover:bg-white/5 transition">
                                <td className="px-4 py-3 font-mono text-xs font-medium text-white">{center.centerCode}</td>
                                <td className="px-4 py-3 font-medium text-white">{center.name}</td>
                                <td className="px-4 py-3 text-gray-300">{center.city}</td>
                                <td className="px-4 py-3 text-xs text-gray-400 max-w-[200px] truncate">{center.address}</td>
                                <td className="px-4 py-3 text-center">
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400">{center.capacity || 'N/A'}</span>
                                </td>
                                <td className="px-4 py-3">
                                  <div className="flex items-center justify-center gap-2">
                                    <button onClick={() => editCenter(center)} className="p-1.5 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg transition" title="Edit"><PencilIcon className="w-4 h-4" /></button>
                                    <button onClick={() => deleteCenter(center._id)} className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition" title="Delete"><TrashIcon className="w-4 h-4" /></button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Schedules Tab */}
              {activeTab === 'schedules' && (
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden">
                  {showScheduleForm && (
                    <div className="p-4 sm:p-6 border-b border-white/10">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-white">{editingSchedule ? '✏️ Edit Schedule' : '➕ New Schedule'}</h3>
                        <button onClick={cancelScheduleForm} className="p-1.5 hover:bg-white/10 rounded-lg transition"><XMarkIcon className="w-5 h-5 text-gray-400" /></button>
                      </div>
                      <form onSubmit={handleScheduleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <select name="examCenterId" value={scheduleData.examCenterId} onChange={(e) => setScheduleData({ ...scheduleData, examCenterId: e.target.value })} className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-white" required>
                          <option value="">Select Center *</option>
                          {centers.map((c) => (<option key={c._id} value={c._id} className="bg-gray-800">{c.centerCode} - {c.name}</option>))}
                        </select>
                        <input type="date" name="examDate" value={scheduleData.examDate} onChange={(e) => setScheduleData({ ...scheduleData, examDate: e.target.value })} className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-white" required />
                        <input type="time" name="examTime" value={scheduleData.examTime} onChange={(e) => setScheduleData({ ...scheduleData, examTime: e.target.value })} className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-white" required />
                        <input type="text" name="subject" placeholder="Subject *" value={scheduleData.subject} onChange={(e) => setScheduleData({ ...scheduleData, subject: e.target.value })} className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-white placeholder-gray-400" required />
                        <input type="number" name="totalStudents" placeholder="Total Students" value={scheduleData.totalStudents} onChange={(e) => setScheduleData({ ...scheduleData, totalStudents: e.target.value })} className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-white placeholder-gray-400" />
                        <select name="status" value={scheduleData.status} onChange={(e) => setScheduleData({ ...scheduleData, status: e.target.value })} className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-white">
                          <option value="upcoming" className="bg-gray-800">Upcoming</option>
                          <option value="ongoing" className="bg-gray-800">Ongoing</option>
                          <option value="completed" className="bg-gray-800">Completed</option>
                          <option value="cancelled" className="bg-gray-800">Cancelled</option>
                          <option value="postponed" className="bg-gray-800">Postponed</option>
                        </select>
                        <div className="md:col-span-2 flex gap-3">
                          <button type="submit" className="flex-1 px-6 py-2.5 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg transition shadow-sm font-medium">{editingSchedule ? 'Update Schedule' : 'Create Schedule'}</button>
                          <button type="button" onClick={cancelScheduleForm} className="px-6 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-lg transition font-medium">Cancel</button>
                        </div>
                      </form>
                    </div>
                  )}

                  <div className="p-4 sm:p-6">
                    {filteredSchedules.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                        <CalendarIcon className="w-16 h-16 mb-4 opacity-20" />
                        <p className="text-lg">No schedules found</p>
                        <p className="text-sm">Add your first schedule</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-white/5">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Center</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white" onClick={() => handleSort('subject')}>
                                <div className="flex items-center gap-1">
                                  Subject
                                  {sortField === 'subject' && (sortDirection === 'asc' ? <ChevronUpIcon className="w-3 h-3" /> : <ChevronDownIcon className="w-3 h-3" />)}
                                </div>
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white" onClick={() => handleSort('examDate')}>
                                <div className="flex items-center gap-1">
                                  Date
                                  {sortField === 'examDate' && (sortDirection === 'asc' ? <ChevronUpIcon className="w-3 h-3" /> : <ChevronDownIcon className="w-3 h-3" />)}
                                </div>
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Time</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Students</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                              <th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                            {filteredSchedules.map((s) => (
                              <tr key={s._id} className="hover:bg-white/5 transition">
                                <td className="px-4 py-3">
                                  <div className="flex flex-col">
                                    <span className="font-medium text-white text-xs">{s.examCenterId?.centerCode}</span>
                                    <span className="text-xs text-gray-400">{s.examCenterId?.name}</span>
                                  </div>
                                </td>
                                <td className="px-4 py-3 font-medium text-white">{s.subject}</td>
                                <td className="px-4 py-3 text-gray-300">
                                  {new Date(s.examDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </td>
                                <td className="px-4 py-3 text-gray-300">{s.examTime}</td>
                                <td className="px-4 py-3 text-center">
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-500/20 text-purple-400">{s.totalStudents || 0}</span>
                                </td>
                                <td className="px-4 py-3">
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(s.status)}`}>{s.status || 'upcoming'}</span>
                                </td>
                                <td className="px-4 py-3">
                                  <div className="flex items-center justify-center gap-2">
                                    <button onClick={() => editSchedule(s)} className="p-1.5 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg transition" title="Edit"><PencilIcon className="w-4 h-4" /></button>
                                    <button onClick={() => deleteSchedule(s._id)} className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition" title="Delete"><TrashIcon className="w-4 h-4" /></button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
                  <div className="max-w-2xl mx-auto">
                    <div className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-xl p-6 border border-blue-500/20">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-blue-500/20 rounded-xl">
                          <BellIcon className="w-6 h-6 text-blue-400" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-white">Send Notification</h3>
                          <p className="text-sm text-gray-400">Send announcements to students and staff</p>
                        </div>
                      </div>

                      <form onSubmit={handleNotificationSubmit} className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">Notification Title *</label>
                          <input type="text" placeholder="Enter notification title" value={notificationData.title} onChange={(e) => setNotificationData({ ...notificationData, title: e.target.value })} className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-white placeholder-gray-400" required />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">Message *</label>
                          <textarea placeholder="Write your notification message..." rows="5" value={notificationData.message} onChange={(e) => setNotificationData({ ...notificationData, message: e.target.value })} className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-white placeholder-gray-400 resize-none" required />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">Target Audience</label>
                          <select value={notificationData.targetRole} onChange={(e) => setNotificationData({ ...notificationData, targetRole: e.target.value })} className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-white">
                            <option value="all" className="bg-gray-800">All Users</option>
                            {user?.role === 'admin' ? (
                              <>
                                <option value="students" className="bg-gray-800">Students Only</option>
                                <option value="board_official" className="bg-gray-800">Board Officials Only</option>
                                <option value="admin" className="bg-gray-800">Admins Only</option>
                              </>
                            ) : (
                              <option value="students" className="bg-gray-800">Students Only</option>
                            )}
                          </select>
                        </div>
                        <button type="submit" className="w-full px-6 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg transition shadow-sm font-medium flex items-center justify-center gap-2">
                          <PaperAirplaneIcon className="w-4 h-4" />
                          Send Notification
                        </button>
                      </form>
                    </div>

                    <div className="mt-6">
                      <h4 className="text-sm font-medium text-gray-400 mb-3">Recent Notifications</h4>
                      <div className="space-y-3">
                        {notifications.length === 0 ? (
                          <div className="bg-white/5 rounded-lg p-4 border border-white/5 text-center text-gray-400">
                            <BellIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p>No notifications sent yet.</p>
                          </div>
                        ) : (
                          notifications.map((notification) => (
                            <div key={notification._id} className="bg-white/5 rounded-lg p-4 border border-white/5 hover:border-white/10 transition">
                              <div className="flex items-start justify-between">
                                <div>
                                  <p className="font-medium text-white text-sm">{notification.title}</p>
                                  <p className="text-sm text-gray-400 mt-1">{notification.message}</p>
                                </div>
                                <span className="text-xs text-gray-500">
                                  {new Date(notification.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default BoardOfficialDashboard;