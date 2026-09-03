// components/SuperAdminDashboard.jsx - Modernized + genuinely mobile responsive
import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import {
  UserGroupIcon,
  BuildingOfficeIcon,
  CalendarIcon,
  ArrowRightOnRectangleIcon,
  PlusIcon,
  TrashIcon,
  XMarkIcon,
  CheckCircleIcon,
  HomeIcon,
  BellIcon,
  Bars3Icon,
  PencilIcon,
  MagnifyingGlassIcon,
  PaperAirplaneIcon,
  Cog6ToothIcon,
  ShieldCheckIcon,
  ClipboardDocumentListIcon,
  MapPinIcon,
} from '@heroicons/react/24/outline';

// ─────────────────────────────────────────────────────────────
// Design tokens (kept as small helper strings so every surface
// pulls from the same palette instead of one-off Tailwind combos)
// ─────────────────────────────────────────────────────────────
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
  btnDanger:
    'inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-medium transition',
  iconBtn: 'p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-white/5 transition',
};

const statusStyles = {
  upcoming: 'bg-sky-500/10 text-sky-300 ring-1 ring-sky-500/20',
  ongoing: 'bg-emerald-500/10 text-emerald-300 ring-1 ring-emerald-500/20',
  completed: 'bg-slate-500/10 text-slate-300 ring-1 ring-slate-500/20',
  cancelled: 'bg-rose-500/10 text-rose-300 ring-1 ring-rose-500/20',
  postponed: 'bg-amber-500/10 text-amber-300 ring-1 ring-amber-500/20',
};

const roleStyles = {
  admin: 'bg-rose-500/10 text-rose-300 ring-1 ring-rose-500/20',
  board_official: 'bg-violet-500/10 text-violet-300 ring-1 ring-violet-500/20',
  default: 'bg-sky-500/10 text-sky-300 ring-1 ring-sky-500/20',
};

const SuperAdminDashboard = () => {
  const { user, logout, getAllUsers } = useAuth();

  // ✅ States
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState([]);
  const [centers, setCenters] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true); // Desktop
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false); // Mobile
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');

  // ✅ Forms State
  const [showUserForm, setShowUserForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userFormData, setUserFormData] = useState({ name: '', email: '', password: '', role: 'board_official' });

  const [showCenterForm, setShowCenterForm] = useState(false);
  const [editingCenter, setEditingCenter] = useState(null);
  const [centerFormData, setCenterFormData] = useState({ centerCode: '', name: '', address: '', latitude: '', longitude: '', city: '', capacity: '' });

  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [scheduleFormData, setScheduleFormData] = useState({ examCenterId: '', examDate: '', examTime: '', subject: '', totalStudents: '', status: 'upcoming' });

  const [showNotificationForm, setShowNotificationForm] = useState(false);
  const [notificationFormData, setNotificationFormData] = useState({ title: '', message: '', targetRole: 'all', type: 'general', priority: 'medium' });

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCenters: 0,
    totalSchedules: 0,
    activeUsers: 0,
    totalNotifications: 0,
    upcomingSchedules: 0,
  });

  // ✅ Fetch Data
  useEffect(() => {
    if (!user || user.role !== 'admin') {
      window.location.href = '/login';
      return;
    }
    fetchAllData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [usersData, centersRes, schedulesRes, notificationsRes] = await Promise.all([
        getAllUsers(),
        api.get('/admin/centers'),
        api.get('/admin/schedules'),
        api.get('/admin/notifications'),
      ]);

      setUsers(usersData || []);
      setCenters(centersRes.data.centers || []);
      setSchedules(schedulesRes.data.schedules || []);
      setNotifications(notificationsRes.data.notifications || []);

      setStats({
        totalUsers: usersData?.length || 0,
        totalCenters: centersRes.data.centers?.length || 0,
        totalSchedules: schedulesRes.data.schedules?.length || 0,
        activeUsers: usersData?.filter((u) => u.isActive).length || 0,
        totalNotifications: notificationsRes.data.notifications?.length || 0,
        upcomingSchedules: (schedulesRes.data.schedules || []).filter((s) => s.status === 'upcoming').length,
      });
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // ✅ CRUD - USERS
  const handleUserSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await api.put(`/admin/users/${editingUser._id}`, userFormData);
        toast.success('User updated successfully!');
      } else {
        await api.post('/admin/users', userFormData);
        toast.success('User created successfully! Credentials sent via email.');
      }
      setShowUserForm(false);
      setEditingUser(null);
      setUserFormData({ name: '', email: '', password: '', role: 'board_official' });
      fetchAllData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error saving user');
    }
  };

  const editUser = (u) => {
    setEditingUser(u);
    setUserFormData({ name: u.name, email: u.email, password: '', role: u.role });
    setShowUserForm(true);
  };

  const deleteUser = async (userId) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      await api.delete(`/admin/users/${userId}`);
      toast.success('User deleted successfully!');
      fetchAllData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error deleting user');
    }
  };

  const toggleUserStatus = async (userId, currentStatus) => {
    try {
      await api.put(`/admin/users/${userId}`, { isActive: !currentStatus });
      toast.success('User status updated successfully!');
      fetchAllData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error updating user');
    }
  };

  // ✅ CRUD - CENTERS
  const handleCenterSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCenter) {
        await api.put(`/admin/centers/${editingCenter._id}`, centerFormData);
        toast.success('Center updated successfully!');
      } else {
        await api.post('/admin/centers', centerFormData);
        toast.success('Center created successfully!');
      }
      setShowCenterForm(false);
      setEditingCenter(null);
      setCenterFormData({ centerCode: '', name: '', address: '', latitude: '', longitude: '', city: '', capacity: '' });
      fetchAllData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error saving center');
    }
  };

  const editCenter = (center) => {
    setEditingCenter(center);
    setCenterFormData({
      centerCode: center.centerCode,
      name: center.name,
      address: center.address,
      latitude: center.latitude,
      longitude: center.longitude,
      city: center.city,
      capacity: center.capacity,
    });
    setShowCenterForm(true);
  };

  const deleteCenter = async (centerId) => {
    if (!confirm('Are you sure you want to delete this center?')) return;
    try {
      await api.delete(`/admin/centers/${centerId}`);
      toast.success('Center deleted successfully!');
      fetchAllData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error deleting center');
    }
  };

  // ✅ CRUD - SCHEDULES
  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingSchedule) {
        await api.put(`/admin/schedules/${editingSchedule._id}`, scheduleFormData);
        toast.success('Schedule updated successfully!');
      } else {
        await api.post('/admin/schedules', scheduleFormData);
        toast.success('Schedule created successfully!');
      }
      setShowScheduleForm(false);
      setEditingSchedule(null);
      setScheduleFormData({ examCenterId: '', examDate: '', examTime: '', subject: '', totalStudents: '', status: 'upcoming' });
      fetchAllData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error saving schedule');
    }
  };

  const editSchedule = (s) => {
    setEditingSchedule(s);
    setScheduleFormData({
      examCenterId: s.examCenterId?._id || '',
      examDate: s.examDate ? new Date(s.examDate).toISOString().split('T')[0] : '',
      examTime: s.examTime,
      subject: s.subject,
      totalStudents: s.totalStudents,
      status: s.status,
    });
    setShowScheduleForm(true);
  };

  const deleteSchedule = async (scheduleId) => {
    if (!confirm('Are you sure you want to delete this schedule?')) return;
    try {
      await api.delete(`/admin/schedules/${scheduleId}`);
      toast.success('Schedule deleted successfully!');
      fetchAllData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error deleting schedule');
    }
  };

  // ✅ CRUD - NOTIFICATIONS
  const handleNotificationSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        title: notificationFormData.title,
        message: notificationFormData.message,
        targetRole: notificationFormData.targetRole,
        type: notificationFormData.type || 'general',
        priority: notificationFormData.priority || 'medium',
      };
      await api.post('/admin/notifications', payload);
      toast.success('Notification sent successfully!');
      setShowNotificationForm(false);
      setNotificationFormData({ title: '', message: '', targetRole: 'all', type: 'general', priority: 'medium' });
      fetchAllData();
    } catch (error) {
      toast.error(error.response?.data?.message || error.response?.data?.errors?.[0]?.msg || 'Error sending notification');
    }
  };

  const deleteNotification = async (notificationId) => {
    if (!confirm('Are you sure you want to delete this notification?')) return;
    try {
      await api.delete(`/admin/notifications/${notificationId}`);
      toast.success('Notification deleted successfully!');
      fetchAllData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error deleting notification');
    }
  };

  // ✅ SORT & FILTER
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredUsers = (users || [])
    .filter(
      (u) =>
        u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      let aVal = a[sortField] || '',
        bVal = b[sortField] || '';
      if (typeof aVal === 'string') aVal = aVal.toLowerCase();
      if (typeof bVal === 'string') bVal = bVal.toLowerCase();
      return sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    });

  const filteredCenters = (centers || [])
    .filter(
      (c) =>
        c.centerCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.city?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => a.centerCode.localeCompare(b.centerCode));

  const filteredSchedules = (schedules || [])
    .filter(
      (s) =>
        s.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.examCenterId?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => new Date(a.examDate) - new Date(b.examDate));

  const getStatusColor = (status) => statusStyles[status] || statusStyles.upcoming;
  const getRoleColor = (role) => roleStyles[role] || roleStyles.default;

  // Deterministic monthly signal (schedule count per month) instead of
  // Math.random(), which used to reshuffle the bars on every render.
  const monthlyActivity = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const counts = new Array(12).fill(0);
    (schedules || []).forEach((s) => {
      const d = s.examDate ? new Date(s.examDate) : null;
      if (d && !isNaN(d)) counts[d.getMonth()] += 1;
    });
    const max = Math.max(1, ...counts);
    return months.map((label, i) => ({ label, value: counts[i], pct: Math.round((counts[i] / max) * 100) }));
  }, [schedules]);

  // ✅ Sidebar Menu
  const menuItems = [
    { id: 'overview', label: 'Overview', icon: HomeIcon },
    { id: 'users', label: 'Users', icon: UserGroupIcon },
    { id: 'centers', label: 'Exam Centers', icon: BuildingOfficeIcon },
    { id: 'schedules', label: 'Schedules', icon: CalendarIcon },
    { id: 'notifications', label: 'Notifications', icon: BellIcon },
    { id: 'reports', label: 'Reports', icon: ClipboardDocumentListIcon },
    { id: 'settings', label: 'Settings', icon: Cog6ToothIcon },
    { id: 'audit', label: 'Audit Logs', icon: ShieldCheckIcon },
  ];

  // ── Small shared bits ──────────────────────────────────────
  const SectionHeader = ({ title, children }) => (
    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <h3 className="text-base font-semibold text-slate-100">{title}</h3>
      <div className="flex flex-wrap items-center gap-2">{children}</div>
    </div>
  );

  const SearchInput = ({ placeholder }) => (
    <div className="relative flex-1 sm:flex-none">
      <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
      <input
        type="text"
        placeholder={placeholder}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="pl-9 pr-3 py-2 text-sm bg-[#0B0E14] border border-white/10 rounded-lg focus:ring-1 focus:ring-teal-500/40 focus:border-teal-500/60 outline-none w-full sm:w-52 text-slate-100 placeholder-slate-500 transition"
      />
    </div>
  );

  const EmptyState = ({ icon: Icon, text }) => (
    <div className={`${ui.panel} rounded-xl p-10 text-center`}>
      <Icon className="w-8 h-8 mx-auto mb-3 text-slate-600" />
      <p className="text-sm text-slate-500">{text}</p>
    </div>
  );

  // ✅ Render Overview
  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: 'Total Users', value: stats.totalUsers, icon: UserGroupIcon, tint: 'text-sky-400 bg-sky-500/10' },
          { label: 'Active Users', value: stats.activeUsers, icon: CheckCircleIcon, tint: 'text-emerald-400 bg-emerald-500/10' },
          { label: 'Exam Centers', value: stats.totalCenters, icon: BuildingOfficeIcon, tint: 'text-violet-400 bg-violet-500/10' },
          { label: 'Upcoming Exams', value: stats.upcomingSchedules, icon: CalendarIcon, tint: 'text-amber-400 bg-amber-500/10' },
        ].map((stat, i) => (
          <div key={i} className={`${ui.panel} ${ui.panelHover} rounded-xl p-4 sm:p-5 transition`}>
            <div className={`inline-flex p-2 rounded-lg mb-3 ${stat.tint}`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-slate-50 tabular-nums">{stat.value}</div>
            <div className="text-slate-500 text-xs sm:text-sm mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6">
        <div className={`${ui.panel} rounded-xl p-5 sm:p-6 lg:col-span-3`}>
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-slate-100 font-semibold text-sm">Exams scheduled by month</h3>
            <span className="text-xs text-slate-500">{schedules.length} total</span>
          </div>
          <div className="h-44 flex items-end gap-1.5 sm:gap-2">
            {monthlyActivity.map((m, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                <div className="w-full flex items-end h-32">
                  <div
                    className="w-full bg-teal-500/70 group-hover:bg-teal-400 rounded-t transition-colors"
                    style={{ height: `${Math.max(4, m.pct)}%` }}
                    title={`${m.label}: ${m.value}`}
                  />
                </div>
                <span className="text-[10px] sm:text-xs text-slate-500">{m.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={`${ui.panel} rounded-xl p-5 sm:p-6 lg:col-span-2`}>
          <h3 className="text-slate-100 font-semibold text-sm mb-4">Recent activity</h3>
          <div className="space-y-2.5">
            {notifications.slice(0, 5).map((n) => (
              <div key={n._id} className="flex items-start gap-3 p-3 bg-white/[0.03] rounded-lg">
                <div className="p-1.5 rounded-md bg-teal-500/10 text-teal-400 flex-shrink-0">
                  <BellIcon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-slate-200 text-sm font-medium truncate">{n.title}</p>
                  <p className="text-slate-500 text-xs mt-0.5">{new Date(n.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
            {notifications.length === 0 && <p className="text-slate-500 text-sm">No recent activity</p>}
          </div>
        </div>
      </div>
    </div>
  );

  // ✅ Users
  const renderUsers = () => (
    <div>
      <SectionHeader title="All users">
        <SearchInput placeholder="Search users..." />
        <button
          onClick={() => {
            setShowUserForm(true);
            setEditingUser(null);
          }}
          className={ui.btnPrimary}
        >
          <PlusIcon className="w-4 h-4" /> Create user
        </button>
      </SectionHeader>

      {showUserForm && (
        <div className={`mb-6 ${ui.panel} rounded-xl p-5 sm:p-6`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-slate-100">{editingUser ? 'Edit user' : 'Create new user'}</h3>
            <button
              onClick={() => {
                setShowUserForm(false);
                setEditingUser(null);
              }}
              className={ui.iconBtn}
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
          <form onSubmit={handleUserSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={ui.label}>Full name</label>
              <input type="text" placeholder="Jane Doe" value={userFormData.name} onChange={(e) => setUserFormData({ ...userFormData, name: e.target.value })} className={ui.input} required />
            </div>
            <div>
              <label className={ui.label}>Email</label>
              <input type="email" placeholder="jane@board.gov" value={userFormData.email} onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })} className={ui.input} required />
            </div>
            {!editingUser && (
              <div>
                <label className={ui.label}>Password</label>
                <input type="password" placeholder="Min. 6 characters" value={userFormData.password} onChange={(e) => setUserFormData({ ...userFormData, password: e.target.value })} className={ui.input} required minLength="6" />
              </div>
            )}
            <div>
              <label className={ui.label}>Role</label>
              <select value={userFormData.role} onChange={(e) => setUserFormData({ ...userFormData, role: e.target.value })} className={ui.input}>
                <option value="board_official" className="bg-[#12151F]">Board Official</option>
                <option value="admin" className="bg-[#12151F]">Admin</option>
              </select>
            </div>
            <div className="sm:col-span-2 flex flex-col sm:flex-row gap-3 pt-1">
              <button type="submit" className={`${ui.btnPrimary} flex-1`}>
                {editingUser ? 'Update user' : 'Create & send credentials'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowUserForm(false);
                  setEditingUser(null);
                }}
                className={ui.btnGhost}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {filteredUsers.length === 0 ? (
        <EmptyState icon={UserGroupIcon} text="No users match your search." />
      ) : (
        <>
          {/* Desktop / tablet table */}
          <div className={`hidden md:block ${ui.panel} rounded-xl overflow-hidden`}>
            <table className="w-full text-sm">
              <thead className="bg-white/[0.03]">
                <tr>
                  {['name', 'email', 'role', 'status', 'actions'].map((col) => (
                    <th
                      key={col}
                      className={`px-4 py-3 text-left text-xs font-medium text-slate-500 cursor-pointer hover:text-slate-200 transition ${col === 'actions' ? 'text-center' : ''}`}
                      onClick={() => col !== 'actions' && handleSort(col)}
                    >
                      <div className="flex items-center gap-1">
                        {col === 'actions' ? 'Actions' : col.charAt(0).toUpperCase() + col.slice(1)}
                        {col !== 'actions' && sortField === col && (sortDirection === 'asc' ? '↑' : '↓')}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {filteredUsers.map((u) => (
                  <tr key={u._id} className="hover:bg-white/[0.02] transition">
                    <td className="px-4 py-3 font-medium text-slate-100">{u.name}</td>
                    <td className="px-4 py-3 text-slate-400">{u.email}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getRoleColor(u.role)}`}>{u.role?.replace('_', ' ')}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${u.isActive ? 'bg-emerald-500/10 text-emerald-300 ring-1 ring-emerald-500/20' : 'bg-rose-500/10 text-rose-300 ring-1 ring-rose-500/20'}`}>
                        {u.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-center items-center gap-2">
                        <button onClick={() => editUser(u)} className={ui.iconBtn}><PencilIcon className="w-4 h-4" /></button>
                        <button
                          onClick={() => toggleUserStatus(u._id, u.isActive)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-medium transition disabled:opacity-40 ${u.isActive ? 'bg-rose-500/10 text-rose-300 hover:bg-rose-500/20' : 'bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20'}`}
                          disabled={u._id === user?._id}
                        >
                          {u.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                        <button onClick={() => deleteUser(u._id)} className="p-2 rounded-lg text-rose-400 hover:bg-rose-500/10 transition disabled:opacity-40" disabled={u._id === user?._id}>
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {filteredUsers.map((u) => (
              <div key={u._id} className={`${ui.panel} rounded-xl p-4`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium text-slate-100 truncate">{u.name}</p>
                    <p className="text-slate-500 text-sm truncate">{u.email}</p>
                  </div>
                  <span className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-medium ${u.isActive ? 'bg-emerald-500/10 text-emerald-300' : 'bg-rose-500/10 text-rose-300'}`}>
                    {u.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/[0.06]">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getRoleColor(u.role)}`}>{u.role?.replace('_', ' ')}</span>
                  <div className="flex items-center gap-1">
                    <button onClick={() => editUser(u)} className={ui.iconBtn}><PencilIcon className="w-4 h-4" /></button>
                    <button
                      onClick={() => toggleUserStatus(u._id, u.isActive)}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-white/5 text-slate-300 disabled:opacity-40"
                      disabled={u._id === user?._id}
                    >
                      {u.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    <button onClick={() => deleteUser(u._id)} className="p-2 rounded-lg text-rose-400 disabled:opacity-40" disabled={u._id === user?._id}>
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );

  // ✅ Centers
  const renderCenters = () => (
    <div>
      <SectionHeader title="All exam centers">
        <SearchInput placeholder="Search centers..." />
        <button
          onClick={() => {
            setShowCenterForm(true);
            setEditingCenter(null);
          }}
          className={ui.btnPrimary}
        >
          <PlusIcon className="w-4 h-4" /> Create center
        </button>
      </SectionHeader>

      {showCenterForm && (
        <div className={`mb-6 ${ui.panel} rounded-xl p-5 sm:p-6`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-slate-100">{editingCenter ? 'Edit center' : 'Create new center'}</h3>
            <button
              onClick={() => {
                setShowCenterForm(false);
                setEditingCenter(null);
              }}
              className={ui.iconBtn}
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
          <form onSubmit={handleCenterSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={ui.label}>Center code</label>
              <input type="text" placeholder="KHI-014" value={centerFormData.centerCode} onChange={(e) => setCenterFormData({ ...centerFormData, centerCode: e.target.value })} className={ui.input} required />
            </div>
            <div>
              <label className={ui.label}>Center name</label>
              <input type="text" placeholder="Govt. Model School" value={centerFormData.name} onChange={(e) => setCenterFormData({ ...centerFormData, name: e.target.value })} className={ui.input} required />
            </div>
            <div className="sm:col-span-2">
              <label className={ui.label}>Address</label>
              <input type="text" placeholder="Street, area" value={centerFormData.address} onChange={(e) => setCenterFormData({ ...centerFormData, address: e.target.value })} className={ui.input} required />
            </div>
            <div>
              <label className={ui.label}>Latitude</label>
              <input type="number" placeholder="24.8607" value={centerFormData.latitude} onChange={(e) => setCenterFormData({ ...centerFormData, latitude: e.target.value })} className={ui.input} />
            </div>
            <div>
              <label className={ui.label}>Longitude</label>
              <input type="number" placeholder="67.0011" value={centerFormData.longitude} onChange={(e) => setCenterFormData({ ...centerFormData, longitude: e.target.value })} className={ui.input} />
            </div>
            <div>
              <label className={ui.label}>City</label>
              <input type="text" placeholder="Karachi" value={centerFormData.city} onChange={(e) => setCenterFormData({ ...centerFormData, city: e.target.value })} className={ui.input} required />
            </div>
            <div>
              <label className={ui.label}>Capacity</label>
              <input type="number" placeholder="300" value={centerFormData.capacity} onChange={(e) => setCenterFormData({ ...centerFormData, capacity: e.target.value })} className={ui.input} />
            </div>
            <div className="sm:col-span-2 flex flex-col sm:flex-row gap-3 pt-1">
              <button type="submit" className={`${ui.btnPrimary} flex-1`}>{editingCenter ? 'Update center' : 'Create center'}</button>
              <button
                type="button"
                onClick={() => {
                  setShowCenterForm(false);
                  setEditingCenter(null);
                }}
                className={ui.btnGhost}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {filteredCenters.length === 0 ? (
        <EmptyState icon={BuildingOfficeIcon} text="No centers match your search." />
      ) : (
        <>
          <div className={`hidden md:block ${ui.panel} rounded-xl overflow-hidden`}>
            <table className="w-full text-sm">
              <thead className="bg-white/[0.03]">
                <tr>
                  {['Code', 'Name', 'City', 'Address', 'Actions'].map((col) => (
                    <th key={col} className={`px-4 py-3 text-left text-xs font-medium text-slate-500 ${col === 'Actions' ? 'text-center' : ''}`}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {filteredCenters.map((center) => (
                  <tr key={center._id} className="hover:bg-white/[0.02] transition">
                    <td className="px-4 py-3 font-mono text-xs font-medium text-teal-300">{center.centerCode}</td>
                    <td className="px-4 py-3 text-slate-100">{center.name}</td>
                    <td className="px-4 py-3 text-slate-400">{center.city}</td>
                    <td className="px-4 py-3 text-slate-500 text-xs max-w-[220px] truncate">{center.address}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-center gap-1">
                        <button onClick={() => editCenter(center)} className={ui.iconBtn}><PencilIcon className="w-4 h-4" /></button>
                        <button onClick={() => deleteCenter(center._id)} className="p-2 rounded-lg text-rose-400 hover:bg-rose-500/10 transition"><TrashIcon className="w-4 h-4" /></button>
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
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => editCenter(center)} className={ui.iconBtn}><PencilIcon className="w-4 h-4" /></button>
                    <button onClick={() => deleteCenter(center._id)} className="p-2 rounded-lg text-rose-400"><TrashIcon className="w-4 h-4" /></button>
                  </div>
                </div>
                <div className="flex items-start gap-1.5 mt-2 text-sm text-slate-500">
                  <MapPinIcon className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{center.address}, {center.city}</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );

  // ✅ Schedules
  const renderSchedules = () => (
    <div>
      <SectionHeader title="All schedules">
        <SearchInput placeholder="Search schedules..." />
        <button
          onClick={() => {
            setShowScheduleForm(true);
            setEditingSchedule(null);
          }}
          className={ui.btnPrimary}
        >
          <PlusIcon className="w-4 h-4" /> Create schedule
        </button>
      </SectionHeader>

      {showScheduleForm && (
        <div className={`mb-6 ${ui.panel} rounded-xl p-5 sm:p-6`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-slate-100">{editingSchedule ? 'Edit schedule' : 'Create new schedule'}</h3>
            <button
              onClick={() => {
                setShowScheduleForm(false);
                setEditingSchedule(null);
              }}
              className={ui.iconBtn}
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
          <form onSubmit={handleScheduleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={ui.label}>Exam center</label>
              <select value={scheduleFormData.examCenterId} onChange={(e) => setScheduleFormData({ ...scheduleFormData, examCenterId: e.target.value })} className={ui.input} required>
                <option value="">Select center</option>
                {centers.map((c) => (
                  <option key={c._id} value={c._id} className="bg-[#12151F]">
                    {c.centerCode} — {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={ui.label}>Subject</label>
              <input type="text" placeholder="Mathematics" value={scheduleFormData.subject} onChange={(e) => setScheduleFormData({ ...scheduleFormData, subject: e.target.value })} className={ui.input} required />
            </div>
            <div>
              <label className={ui.label}>Exam date</label>
              <input type="date" value={scheduleFormData.examDate} onChange={(e) => setScheduleFormData({ ...scheduleFormData, examDate: e.target.value })} className={ui.input} required />
            </div>
            <div>
              <label className={ui.label}>Exam time</label>
              <input type="time" value={scheduleFormData.examTime} onChange={(e) => setScheduleFormData({ ...scheduleFormData, examTime: e.target.value })} className={ui.input} required />
            </div>
            <div>
              <label className={ui.label}>Total students</label>
              <input type="number" placeholder="240" value={scheduleFormData.totalStudents} onChange={(e) => setScheduleFormData({ ...scheduleFormData, totalStudents: e.target.value })} className={ui.input} />
            </div>
            <div>
              <label className={ui.label}>Status</label>
              <select value={scheduleFormData.status} onChange={(e) => setScheduleFormData({ ...scheduleFormData, status: e.target.value })} className={ui.input}>
                <option value="upcoming" className="bg-[#12151F]">Upcoming</option>
                <option value="ongoing" className="bg-[#12151F]">Ongoing</option>
                <option value="completed" className="bg-[#12151F]">Completed</option>
                <option value="cancelled" className="bg-[#12151F]">Cancelled</option>
                <option value="postponed" className="bg-[#12151F]">Postponed</option>
              </select>
            </div>
            <div className="sm:col-span-2 flex flex-col sm:flex-row gap-3 pt-1">
              <button type="submit" className={`${ui.btnPrimary} flex-1`}>{editingSchedule ? 'Update schedule' : 'Create schedule'}</button>
              <button
                type="button"
                onClick={() => {
                  setShowScheduleForm(false);
                  setEditingSchedule(null);
                }}
                className={ui.btnGhost}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {filteredSchedules.length === 0 ? (
        <EmptyState icon={CalendarIcon} text="No schedules match your search." />
      ) : (
        <>
          <div className={`hidden md:block ${ui.panel} rounded-xl overflow-hidden`}>
            <table className="w-full text-sm">
              <thead className="bg-white/[0.03]">
                <tr>
                  {['Center', 'Subject', 'Date', 'Time', 'Status', 'Actions'].map((col) => (
                    <th key={col} className={`px-4 py-3 text-left text-xs font-medium text-slate-500 ${col === 'Actions' ? 'text-center' : ''}`}>{col}</th>
                  ))}
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
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(s.status)}`}>{s.status || 'upcoming'}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-center gap-1">
                        <button onClick={() => editSchedule(s)} className={ui.iconBtn}><PencilIcon className="w-4 h-4" /></button>
                        <button onClick={() => deleteSchedule(s._id)} className="p-2 rounded-lg text-rose-400 hover:bg-rose-500/10 transition"><TrashIcon className="w-4 h-4" /></button>
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
                    <p className="text-slate-500 text-xs mt-0.5">{s.examCenterId?.centerCode} · {s.examCenterId?.name}</p>
                  </div>
                  <span className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(s.status)}`}>{s.status || 'upcoming'}</span>
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/[0.06] text-sm text-slate-400">
                  <span>{new Date(s.examDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} · {s.examTime}</span>
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
  );

  // ✅ Notifications
  const renderNotifications = () => (
    <div>
      <SectionHeader title="All notifications">
        <button onClick={() => setShowNotificationForm(true)} className={ui.btnPrimary}>
          <PlusIcon className="w-4 h-4" /> Send notification
        </button>
      </SectionHeader>

      {showNotificationForm && (
        <div className={`mb-6 ${ui.panel} rounded-xl p-5 sm:p-6`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-slate-100">Send notification</h3>
            <button onClick={() => setShowNotificationForm(false)} className={ui.iconBtn}><XMarkIcon className="w-5 h-5" /></button>
          </div>
          <form onSubmit={handleNotificationSubmit} className="space-y-4">
            <div>
              <label className={ui.label}>Title</label>
              <input type="text" placeholder="Exam schedule updated" value={notificationFormData.title} onChange={(e) => setNotificationFormData({ ...notificationFormData, title: e.target.value })} className={ui.input} required />
            </div>
            <div>
              <label className={ui.label}>Message</label>
              <textarea placeholder="Write your notification message..." rows="4" value={notificationFormData.message} onChange={(e) => setNotificationFormData({ ...notificationFormData, message: e.target.value })} className={`${ui.input} resize-none`} required />
            </div>
            <div>
              <label className={ui.label}>Send to</label>
              <select value={notificationFormData.targetRole} onChange={(e) => setNotificationFormData({ ...notificationFormData, targetRole: e.target.value })} className={ui.input}>
                <option value="all" className="bg-[#12151F]">All users</option>
                <option value="students" className="bg-[#12151F]">Students only</option>
                <option value="board_official" className="bg-[#12151F]">Board officials only</option>
                <option value="admin" className="bg-[#12151F]">Admins only</option>
              </select>
            </div>
            <button type="submit" className={`${ui.btnPrimary} w-full`}>
              <PaperAirplaneIcon className="w-4 h-4" /> Send notification
            </button>
          </form>
        </div>
      )}

      {notifications.length === 0 ? (
        <EmptyState icon={BellIcon} text="No notifications sent yet." />
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <div key={notification._id} className={`${ui.panel} ${ui.panelHover} rounded-xl p-4 transition`}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium text-slate-100 text-sm">{notification.title}</p>
                  <p className="text-sm text-slate-400 mt-1">{notification.message}</p>
                  <p className="text-xs text-slate-600 mt-2">
                    To: {notification.targetRole} · {new Date(notification.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <button onClick={() => deleteNotification(notification._id)} className="p-2 rounded-lg text-rose-400 hover:bg-rose-500/10 transition shrink-0">
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const NavList = ({ onNavigate, collapsed }) => (
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
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition relative ${
              isActive ? 'bg-teal-500/10 text-teal-300' : 'text-slate-400 hover:text-slate-100 hover:bg-white/5'
            }`}
          >
            {isActive && <span className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-full bg-teal-400" />}
            <Icon className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
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
                <div className="p-2 bg-teal-500/15 rounded-lg">
                  <ShieldCheckIcon className="w-5 h-5 text-teal-400" />
                </div>
                <span className="text-slate-100 font-semibold">Board Admin</span>
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
                  <p className="text-xs text-slate-500 capitalize truncate">{user?.role}</p>
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
            <div className="p-2 bg-teal-500/15 rounded-lg shrink-0">
              <ShieldCheckIcon className="w-5 h-5 text-teal-400" />
            </div>
            {sidebarOpen && <span className="text-slate-100 font-semibold truncate">Board Admin</span>}
          </div>
          
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
                <p className="text-xs text-slate-500 capitalize truncate">{user?.role}</p>
              </div>
            )}
            <button onClick={logout} className="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg transition shrink-0"><ArrowRightOnRectangleIcon className="w-5 h-5" /></button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto min-w-0">
        <header className="bg-[#0B0E14]/95 backdrop-blur-md border-b border-white/[0.06] sticky top-0 z-10 px-4 sm:px-6 py-3.5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <button onClick={() => setMobileSidebarOpen(true)} className={`lg:hidden ${ui.iconBtn}`}>
                <Bars3Icon className="w-6 h-6" />
              </button>
              <div className="hidden lg:flex items-center gap-3 min-w-0">
                <button onClick={() => setSidebarOpen(!sidebarOpen)} className={`${ui.iconBtn} shrink-0`}><Bars3Icon className="w-5 h-5" /></button>
                <h1 className="text-lg sm:text-xl font-bold text-slate-50 truncate">{menuItems.find((item) => item.id === activeTab)?.label || 'Dashboard'}</h1>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <button className={ui.iconBtn}><BellIcon className="w-5 h-5" /></button>
              <div className="hidden md:flex items-center gap-2 bg-white/[0.04] pl-1.5 pr-3 py-1.5 rounded-lg">
                <div className="w-7 h-7 rounded-full bg-teal-500/15 flex items-center justify-center text-teal-300 font-semibold text-xs">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-100 leading-tight">{user?.name}</p>
                  <p className="text-xs text-slate-500 capitalize leading-tight">{user?.role}</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="p-4 sm:p-6">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-9 h-9 border-[3px] border-teal-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {activeTab === 'overview' && renderOverview()}
              {activeTab === 'users' && renderUsers()}
              {activeTab === 'centers' && renderCenters()}
              {activeTab === 'schedules' && renderSchedules()}
              {activeTab === 'notifications' && renderNotifications()}
              {activeTab === 'reports' && <EmptyState icon={ClipboardDocumentListIcon} text="Reports module coming soon." />}
              {activeTab === 'settings' && <EmptyState icon={Cog6ToothIcon} text="Settings coming soon." />}
              {activeTab === 'audit' && <EmptyState icon={ShieldCheckIcon} text="Audit logs coming soon." />}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default SuperAdminDashboard;