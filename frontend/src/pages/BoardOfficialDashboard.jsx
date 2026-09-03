// components/BoardOfficialDashboard.jsx - Modernized + aligned with shared design system
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
  ArrowRightOnRectangleIcon,
  MagnifyingGlassIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  Bars3Icon,
  PencilIcon,
  PaperAirplaneIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';

// Shared design tokens — kept in sync with SuperAdminDashboard.jsx / StudentPortal.jsx
const ui = {
  page: 'bg-[#0B0E14] text-slate-100',
  panel: 'bg-[#12151F] border border-white/[0.06]',
  panelHover: 'hover:border-white/[0.12]',
  input:
    'w-full px-4 py-2.5 bg-[#0B0E14] border border-white/10 rounded-lg text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-teal-500/60 focus:ring-1 focus:ring-teal-500/40 transition',
  label: 'block text-xs font-medium text-slate-400 mb-1.5',
  btnPrimary:
    'inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-teal-500 hover:bg-teal-400 text-[#06110D] text-sm font-semibold transition',
  btnGhost:
    'inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-200 text-sm font-medium transition border border-white/10',
  iconBtn: 'p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-white/5 transition',
};

const statusStyles = {
  upcoming: 'bg-sky-500/10 text-sky-300 ring-1 ring-sky-500/20',
  ongoing: 'bg-emerald-500/10 text-emerald-300 ring-1 ring-emerald-500/20',
  completed: 'bg-slate-500/10 text-slate-300 ring-1 ring-slate-500/20',
  cancelled: 'bg-rose-500/10 text-rose-300 ring-1 ring-rose-500/20',
  postponed: 'bg-amber-500/10 text-amber-300 ring-1 ring-amber-500/20',
};

const BoardOfficialDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('centers');
  const [centers, setCenters] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCenterForm, setShowCenterForm] = useState(false);
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('centerCode');
  const [sortDirection, setSortDirection] = useState('asc');
  const [editingCenter, setEditingCenter] = useState(null);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [stats, setStats] = useState({
    totalCenters: 0,
    totalSchedules: 0,
    upcomingExams: 0,
    totalStudents: 0,
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
    contactEmail: '',
  });

  const [scheduleData, setScheduleData] = useState({
    examCenterId: '',
    examDate: '',
    examTime: '',
    subject: '',
    totalStudents: '',
    status: 'upcoming',
  });

  const [notificationData, setNotificationData] = useState({
    title: '',
    message: '',
    targetRole: 'all',
    type: 'general',
    priority: 'medium',
  });

  useEffect(() => {
    if (!user || (user.role !== 'board_official' && user.role !== 'admin')) {
      window.location.href = '/login';
      return;
    }
    fetchData();
    fetchNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [centersRes, schedulesRes] = await Promise.all([api.get('/admin/centers'), api.get('/admin/schedules')]);
      setCenters(centersRes.data.centers || []);
      setSchedules(schedulesRes.data.schedules || []);

      const now = new Date();
      const upcoming = (schedulesRes.data.schedules || []).filter((s) => new Date(s.examDate) > now && s.status !== 'cancelled');

      setStats({
        totalCenters: centersRes.data.centers?.length || 0,
        totalSchedules: schedulesRes.data.schedules?.length || 0,
        upcomingExams: upcoming.length,
        totalStudents: (schedulesRes.data.schedules || []).reduce((sum, s) => sum + (parseInt(s.totalStudents) || 0), 0),
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
      await api.post('/admin/notifications', notificationData);
      toast.success('Notification sent successfully!');
      setNotificationData({ title: '', message: '', targetRole: 'all', type: 'general', priority: 'medium' });
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
      cancelCenterForm();
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
      cancelScheduleForm();
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
      contactEmail: center.contactEmail || '',
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
      status: schedule.status || 'upcoming',
    });
    setShowScheduleForm(true);
  };

  const cancelCenterForm = () => {
    setShowCenterForm(false);
    setEditingCenter(null);
    setFormData({ centerCode: '', name: '', address: '', latitude: '', longitude: '', city: '', capacity: '', contactNumber: '', contactEmail: '' });
  };

  const cancelScheduleForm = () => {
    setShowScheduleForm(false);
    setEditingSchedule(null);
    setScheduleData({ examCenterId: '', examDate: '', examTime: '', subject: '', totalStudents: '', status: 'upcoming' });
  };

  const filteredCenters = (centers || [])
    .filter(
      (center) =>
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
    .filter(
      (s) =>
        s.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.examCenterId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.examCenterId?.centerCode?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortField === 'examDate') {
        return sortDirection === 'asc' ? new Date(a.examDate) - new Date(b.examDate) : new Date(b.examDate) - new Date(a.examDate);
      }
      let aVal = a[sortField] || '';
      let bVal = b[sortField] || '';
      if (typeof aVal === 'string') aVal = aVal.toLowerCase();
      if (typeof bVal === 'string') bVal = bVal.toLowerCase();
      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

  const getStatusColor = (status) => statusStyles[status] || statusStyles.upcoming;

  const menuItems = [
    { id: 'centers', label: 'Exam Centers', icon: BuildingOfficeIcon },
    { id: 'schedules', label: 'Schedules', icon: CalendarIcon },
    { id: 'notifications', label: 'Notifications', icon: BellIcon },
  ];

  const SortHeader = ({ field, children, className = '' }) => (
    <th className={`px-4 py-3 text-left text-xs font-medium text-slate-500 cursor-pointer hover:text-slate-200 transition ${className}`} onClick={() => handleSort(field)}>
      <div className="flex items-center gap-1">
        {children}
        {sortField === field && (sortDirection === 'asc' ? <ChevronUpIcon className="w-3 h-3" /> : <ChevronDownIcon className="w-3 h-3" />)}
      </div>
    </th>
  );

  const EmptyState = ({ icon: Icon, title, hint }) => (
    <div className={`${ui.panel} rounded-xl p-10 text-center`}>
      <Icon className="w-9 h-9 mx-auto mb-3 text-slate-600" />
      <p className="text-sm font-medium text-slate-300">{title}</p>
      {hint && <p className="text-xs text-slate-500 mt-1">{hint}</p>}
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
    <div className={`flex h-screen ${ui.page}`}>
      {/* Mobile sidebar */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setMobileSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-72 max-w-[85vw] bg-[#0F1219] border-r border-white/[0.06] flex flex-col">
            <div className="p-4 border-b border-white/[0.06] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-teal-500/15 rounded-lg"><BuildingOfficeIcon className="w-5 h-5 text-teal-400" /></div>
                <span className="text-slate-100 font-semibold">Board Official</span>
              </div>
              <button onClick={() => setMobileSidebarOpen(false)} className={ui.iconBtn}><XMarkIcon className="w-5 h-5" /></button>
            </div>
            <NavList onNavigate={() => setMobileSidebarOpen(false)} />
            <div className="p-3 border-t border-white/[0.06]">
              <div className="flex items-center gap-3 p-2">
                <div className="w-9 h-9 rounded-full bg-teal-500/15 flex items-center justify-center text-teal-300 font-semibold text-sm shrink-0">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-100 truncate">{user?.name}</p>
                  <p className="text-xs text-slate-500 capitalize truncate">{user?.role?.replace('_', ' ')}</p>
                </div>
                <button onClick={logout} className="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg transition"><ArrowRightOnRectangleIcon className="w-5 h-5" /></button>
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className={`${sidebarOpen ? 'w-60' : 'w-[76px]'} hidden lg:flex bg-[#0F1219] border-r border-white/[0.06] transition-all duration-200 flex-col`}>
        <div className="p-4 border-b border-white/[0.06] flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 bg-teal-500/15 rounded-lg shrink-0"><BuildingOfficeIcon className="w-5 h-5 text-teal-400" /></div>
            {sidebarOpen && <span className="text-slate-100 font-semibold truncate">Board Official</span>}
          </div>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className={`${ui.iconBtn} shrink-0`}><Bars3Icon className="w-5 h-5" /></button>
        </div>

        <NavList collapsed={!sidebarOpen} />

        <div className="p-3 border-t border-white/[0.06]">
          <div className="flex items-center gap-3 p-1">
            <div className="w-9 h-9 rounded-full bg-teal-500/15 flex items-center justify-center text-teal-300 font-semibold text-sm shrink-0">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-100 truncate">{user?.name}</p>
                <p className="text-xs text-slate-500 capitalize truncate">{user?.role?.replace('_', ' ')}</p>
              </div>
            )}
            <button onClick={logout} className="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg transition shrink-0" title="Logout">
              <ArrowRightOnRectangleIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto min-w-0">
        <header className="bg-[#0B0E14]/95 backdrop-blur-md border-b border-white/[0.06] sticky top-0 z-10 px-4 sm:px-6 py-3.5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <button onClick={() => setMobileSidebarOpen(true)} className={`lg:hidden ${ui.iconBtn}`}>
                <Bars3Icon className="w-6 h-6" />
              </button>
              <div className="min-w-0">
                <h1 className="text-lg sm:text-xl font-bold text-slate-50 truncate">{menuItems.find((item) => item.id === activeTab)?.label || 'Dashboard'}</h1>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              {activeTab !== 'notifications' && (
                <div className="relative flex-1 sm:flex-none">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 pr-3 py-2 text-sm bg-white/[0.04] border border-white/10 rounded-lg focus:ring-1 focus:ring-teal-500/40 focus:border-teal-500/60 outline-none w-full sm:w-48 text-slate-100 placeholder-slate-500 transition"
                  />
                </div>
              )}
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
                  className={`${ui.btnPrimary} shrink-0`}
                >
                  <PlusIcon className="w-4 h-4" />
                  <span className="hidden sm:inline">Add {activeTab === 'centers' ? 'Center' : 'Schedule'}</span>
                </button>
              )}
            </div>
          </div>
        </header>

        <div className="p-4 sm:p-6">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="flex flex-col items-center gap-3">
                <div className="w-9 h-9 border-[3px] border-teal-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-slate-500 text-sm">Loading data...</p>
              </div>
            </div>
          ) : (
            <>
              {/* Centers Tab */}
              {activeTab === 'centers' && (
                <div>
                  {showCenterForm && (
                    <div className={`mb-6 ${ui.panel} rounded-xl p-5 sm:p-6`}>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-base font-semibold text-slate-100">{editingCenter ? 'Edit center' : 'New center'}</h3>
                        <button onClick={cancelCenterForm} className={ui.iconBtn}><XMarkIcon className="w-5 h-5" /></button>
                      </div>
                      <form onSubmit={handleCenterSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className={ui.label}>Center code</label>
                          <input type="text" placeholder="KHI-014" value={formData.centerCode} onChange={(e) => setFormData({ ...formData, centerCode: e.target.value })} className={ui.input} required />
                        </div>
                        <div>
                          <label className={ui.label}>Center name</label>
                          <input type="text" placeholder="Govt. Model School" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className={ui.input} required />
                        </div>
                        <div className="sm:col-span-2">
                          <label className={ui.label}>Address</label>
                          <input type="text" placeholder="Street, area" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className={ui.input} required />
                        </div>
                        <div>
                          <label className={ui.label}>Latitude</label>
                          <input type="number" step="any" placeholder="24.8607" value={formData.latitude} onChange={(e) => setFormData({ ...formData, latitude: e.target.value })} className={ui.input} />
                        </div>
                        <div>
                          <label className={ui.label}>Longitude</label>
                          <input type="number" step="any" placeholder="67.0011" value={formData.longitude} onChange={(e) => setFormData({ ...formData, longitude: e.target.value })} className={ui.input} />
                        </div>
                        <div>
                          <label className={ui.label}>City</label>
                          <input type="text" placeholder="Karachi" value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} className={ui.input} required />
                        </div>
                        <div>
                          <label className={ui.label}>Capacity</label>
                          <input type="number" placeholder="300" value={formData.capacity} onChange={(e) => setFormData({ ...formData, capacity: e.target.value })} className={ui.input} />
                        </div>
                        <div>
                          <label className={ui.label}>Contact number</label>
                          <input type="text" placeholder="+92 3XX XXXXXXX" value={formData.contactNumber} onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })} className={ui.input} />
                        </div>
                        <div>
                          <label className={ui.label}>Contact email</label>
                          <input type="email" placeholder="center@board.gov" value={formData.contactEmail} onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })} className={ui.input} />
                        </div>
                        <div className="sm:col-span-2 flex flex-col sm:flex-row gap-3 pt-1">
                          <button type="submit" className={`${ui.btnPrimary} flex-1`}>{editingCenter ? 'Update center' : 'Create center'}</button>
                          <button type="button" onClick={cancelCenterForm} className={ui.btnGhost}>Cancel</button>
                        </div>
                      </form>
                    </div>
                  )}

                  {filteredCenters.length === 0 ? (
                    <EmptyState icon={BuildingOfficeIcon} title="No centers found" hint="Add your first exam center to get started." />
                  ) : (
                    <>
                      <div className={`hidden md:block ${ui.panel} rounded-xl overflow-hidden`}>
                        <table className="w-full text-sm">
                          <thead className="bg-white/[0.03]">
                            <tr>
                              <SortHeader field="centerCode">Code</SortHeader>
                              <SortHeader field="name">Name</SortHeader>
                              <SortHeader field="city">City</SortHeader>
                              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">Address</th>
                              <th className="px-4 py-3 text-center text-xs font-medium text-slate-500">Capacity</th>
                              <th className="px-4 py-3 text-center text-xs font-medium text-slate-500">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/[0.04]">
                            {filteredCenters.map((center) => (
                              <tr key={center._id} className="hover:bg-white/[0.02] transition">
                                <td className="px-4 py-3 font-mono text-xs font-medium text-teal-300">{center.centerCode}</td>
                                <td className="px-4 py-3 font-medium text-slate-100">{center.name}</td>
                                <td className="px-4 py-3 text-slate-400">{center.city}</td>
                                <td className="px-4 py-3 text-xs text-slate-500 max-w-[220px] truncate">{center.address}</td>
                                <td className="px-4 py-3 text-center">
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-sky-500/10 text-sky-300 ring-1 ring-sky-500/20">{center.capacity || 'N/A'}</span>
                                </td>
                                <td className="px-4 py-3">
                                  <div className="flex items-center justify-center gap-1">
                                    <button onClick={() => editCenter(center)} className={ui.iconBtn} title="Edit"><PencilIcon className="w-4 h-4" /></button>
                                    <button onClick={() => deleteCenter(center._id)} className="p-2 rounded-lg text-rose-400 hover:bg-rose-500/10 transition" title="Delete"><TrashIcon className="w-4 h-4" /></button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <div className="md:hidden space-y-3">
                        {filteredCenters.map((center) => (
                          <div key={center._id} className={`${ui.panel} rounded-xl p-4`}>
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <p className="font-mono text-xs text-teal-300 mb-0.5">{center.centerCode}</p>
                                <p className="font-medium text-slate-100 truncate">{center.name}</p>
                                <p className="text-xs text-slate-500 mt-1">{center.address}, {center.city}</p>
                              </div>
                              <span className="shrink-0 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-sky-500/10 text-sky-300">{center.capacity || 'N/A'}</span>
                            </div>
                            <div className="flex items-center justify-end gap-1 mt-3 pt-3 border-t border-white/[0.06]">
                              <button onClick={() => editCenter(center)} className={ui.iconBtn}><PencilIcon className="w-4 h-4" /></button>
                              <button onClick={() => deleteCenter(center._id)} className="p-2 rounded-lg text-rose-400"><TrashIcon className="w-4 h-4" /></button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Schedules Tab */}
              {activeTab === 'schedules' && (
                <div>
                  {showScheduleForm && (
                    <div className={`mb-6 ${ui.panel} rounded-xl p-5 sm:p-6`}>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-base font-semibold text-slate-100">{editingSchedule ? 'Edit schedule' : 'New schedule'}</h3>
                        <button onClick={cancelScheduleForm} className={ui.iconBtn}><XMarkIcon className="w-5 h-5" /></button>
                      </div>
                      <form onSubmit={handleScheduleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className={ui.label}>Exam center</label>
                          <select value={scheduleData.examCenterId} onChange={(e) => setScheduleData({ ...scheduleData, examCenterId: e.target.value })} className={ui.input} required>
                            <option value="">Select center</option>
                            {centers.map((c) => (
                              <option key={c._id} value={c._id} className="bg-[#12151F]">{c.centerCode} — {c.name}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className={ui.label}>Subject</label>
                          <input type="text" placeholder="Mathematics" value={scheduleData.subject} onChange={(e) => setScheduleData({ ...scheduleData, subject: e.target.value })} className={ui.input} required />
                        </div>
                        <div>
                          <label className={ui.label}>Exam date</label>
                          <input type="date" value={scheduleData.examDate} onChange={(e) => setScheduleData({ ...scheduleData, examDate: e.target.value })} className={ui.input} required />
                        </div>
                        <div>
                          <label className={ui.label}>Exam time</label>
                          <input type="time" value={scheduleData.examTime} onChange={(e) => setScheduleData({ ...scheduleData, examTime: e.target.value })} className={ui.input} required />
                        </div>
                        <div>
                          <label className={ui.label}>Total students</label>
                          <input type="number" placeholder="240" value={scheduleData.totalStudents} onChange={(e) => setScheduleData({ ...scheduleData, totalStudents: e.target.value })} className={ui.input} />
                        </div>
                        <div>
                          <label className={ui.label}>Status</label>
                          <select value={scheduleData.status} onChange={(e) => setScheduleData({ ...scheduleData, status: e.target.value })} className={ui.input}>
                            <option value="upcoming" className="bg-[#12151F]">Upcoming</option>
                            <option value="ongoing" className="bg-[#12151F]">Ongoing</option>
                            <option value="completed" className="bg-[#12151F]">Completed</option>
                            <option value="cancelled" className="bg-[#12151F]">Cancelled</option>
                            <option value="postponed" className="bg-[#12151F]">Postponed</option>
                          </select>
                        </div>
                        <div className="sm:col-span-2 flex flex-col sm:flex-row gap-3 pt-1">
                          <button type="submit" className={`${ui.btnPrimary} flex-1`}>{editingSchedule ? 'Update schedule' : 'Create schedule'}</button>
                          <button type="button" onClick={cancelScheduleForm} className={ui.btnGhost}>Cancel</button>
                        </div>
                      </form>
                    </div>
                  )}

                  {filteredSchedules.length === 0 ? (
                    <EmptyState icon={CalendarIcon} title="No schedules found" hint="Add your first exam schedule to get started." />
                  ) : (
                    <>
                      <div className={`hidden md:block ${ui.panel} rounded-xl overflow-hidden`}>
                        <table className="w-full text-sm">
                          <thead className="bg-white/[0.03]">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">Center</th>
                              <SortHeader field="subject">Subject</SortHeader>
                              <SortHeader field="examDate">Date</SortHeader>
                              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">Time</th>
                              <th className="px-4 py-3 text-center text-xs font-medium text-slate-500">Students</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">Status</th>
                              <th className="px-4 py-3 text-center text-xs font-medium text-slate-500">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/[0.04]">
                            {filteredSchedules.map((s) => (
                              <tr key={s._id} className="hover:bg-white/[0.02] transition">
                                <td className="px-4 py-3">
                                  <div className="flex flex-col">
                                    <span className="font-medium text-slate-100 text-xs">{s.examCenterId?.centerCode}</span>
                                    <span className="text-xs text-slate-500">{s.examCenterId?.name}</span>
                                  </div>
                                </td>
                                <td className="px-4 py-3 font-medium text-slate-100">{s.subject}</td>
                                <td className="px-4 py-3 text-slate-400">{new Date(s.examDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                                <td className="px-4 py-3 text-slate-400">{s.examTime}</td>
                                <td className="px-4 py-3 text-center">
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-violet-500/10 text-violet-300 ring-1 ring-violet-500/20">{s.totalStudents || 0}</span>
                                </td>
                                <td className="px-4 py-3">
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(s.status)}`}>{s.status || 'upcoming'}</span>
                                </td>
                                <td className="px-4 py-3">
                                  <div className="flex items-center justify-center gap-1">
                                    <button onClick={() => editSchedule(s)} className={ui.iconBtn} title="Edit"><PencilIcon className="w-4 h-4" /></button>
                                    <button onClick={() => deleteSchedule(s._id)} className="p-2 rounded-lg text-rose-400 hover:bg-rose-500/10 transition" title="Delete"><TrashIcon className="w-4 h-4" /></button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <div className="md:hidden space-y-3">
                        {filteredSchedules.map((s) => (
                          <div key={s._id} className={`${ui.panel} rounded-xl p-4`}>
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <p className="font-medium text-slate-100 truncate">{s.subject}</p>
                                <p className="text-xs text-slate-500 mt-0.5">{s.examCenterId?.centerCode} · {s.examCenterId?.name}</p>
                              </div>
                              <span className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(s.status)}`}>{s.status || 'upcoming'}</span>
                            </div>
                            <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/[0.06] text-sm text-slate-400">
                              <div className="flex items-center gap-3">
                                <span>{new Date(s.examDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} · {s.examTime}</span>
                                <span className="inline-flex items-center gap-1 text-xs text-violet-300"><UserGroupIcon className="w-3.5 h-3.5" />{s.totalStudents || 0}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <button onClick={() => editSchedule(s)} className={ui.iconBtn}><PencilIcon className="w-4 h-4" /></button>
                                <button onClick={() => deleteSchedule(s._id)} className="p-2 rounded-lg text-rose-400"><TrashIcon className="w-4 h-4" /></button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <div className="max-w-2xl">
                  <div className={`${ui.panel} rounded-xl p-5 sm:p-6`}>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2.5 bg-teal-500/10 rounded-xl">
                        <BellIcon className="w-5 h-5 text-teal-400" />
                      </div>
                      <div>
                        <h3 className="text-base font-semibold text-slate-100">Send notification</h3>
                        <p className="text-sm text-slate-500">Send announcements to students and staff</p>
                      </div>
                    </div>

                    <form onSubmit={handleNotificationSubmit} className="space-y-4">
                      <div>
                        <label className={ui.label}>Notification title</label>
                        <input type="text" placeholder="Enter notification title" value={notificationData.title} onChange={(e) => setNotificationData({ ...notificationData, title: e.target.value })} className={ui.input} required />
                      </div>
                      <div>
                        <label className={ui.label}>Message</label>
                        <textarea placeholder="Write your notification message..." rows="5" value={notificationData.message} onChange={(e) => setNotificationData({ ...notificationData, message: e.target.value })} className={`${ui.input} resize-none`} required />
                      </div>
                      <div>
                        <label className={ui.label}>Target audience</label>
                        <select value={notificationData.targetRole} onChange={(e) => setNotificationData({ ...notificationData, targetRole: e.target.value })} className={ui.input}>
                          <option value="all" className="bg-[#12151F]">All users</option>
                          {user?.role === 'admin' ? (
                            <>
                              <option value="students" className="bg-[#12151F]">Students only</option>
                              <option value="board_official" className="bg-[#12151F]">Board officials only</option>
                              <option value="admin" className="bg-[#12151F]">Admins only</option>
                            </>
                          ) : (
                            <option value="students" className="bg-[#12151F]">Students only</option>
                          )}
                        </select>
                      </div>
                      <button type="submit" className={`${ui.btnPrimary} w-full`}>
                        <PaperAirplaneIcon className="w-4 h-4" /> Send notification
                      </button>
                    </form>
                  </div>

                  <div className="mt-6">
                    <h4 className="text-xs font-medium text-slate-500 mb-3">Recent notifications</h4>
                    <div className="space-y-3">
                      {notifications.length === 0 ? (
                        <EmptyState icon={BellIcon} title="No notifications sent yet." />
                      ) : (
                        notifications.map((notification) => (
                          <div key={notification._id} className={`${ui.panel} ${ui.panelHover} rounded-xl p-4 transition`}>
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <p className="font-medium text-slate-100 text-sm">{notification.title}</p>
                                <p className="text-sm text-slate-400 mt-1">{notification.message}</p>
                              </div>
                              <span className="text-xs text-slate-600 shrink-0">
                                {new Date(notification.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          </div>
                        ))
                      )}
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