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
  AcademicCapIcon,
  UserPlusIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  ArrowPathIcon,
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

const roleStyles = {
  admin: 'bg-rose-500/15 text-rose-300 ring-1 ring-rose-500/30',
  board_official: 'bg-violet-500/15 text-violet-300 ring-1 ring-violet-500/30',
  student: 'bg-sky-500/15 text-sky-300 ring-1 ring-sky-500/30',
  default: 'bg-slate-500/15 text-slate-300 ring-1 ring-slate-500/30',
};

const SuperAdminDashboard = () => {
  const { user, logout, getAllUsers } = useAuth();

  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState([]);
  const [centers, setCenters] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');

  const [showUserForm, setShowUserForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userFormData, setUserFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'board_official',
    examCenter: '',
    rollNumber: '',
    grade: '',
    board: '',
    assignedCenter: '',
    city: '',
    phone: '',
  });

  const [showCenterForm, setShowCenterForm] = useState(false);
  const [editingCenter, setEditingCenter] = useState(null);
  const [centerFormData, setCenterFormData] = useState({
    centerCode: '',
    name: '',
    address: '',
    latitude: '',
    longitude: '',
    city: '',
    state: '',
    capacity: '',
    contactNumber: '',
    contactEmail: '',
    boardOfficial: '',
  });

  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [scheduleFormData, setScheduleFormData] = useState({
    examCenterId: '',
    examDate: '',
    examTime: '',
    subject: '',
    subjectCode: '',
    grade: '',
    totalStudents: '',
    duration: 180,
    roomNumber: '',
    status: 'upcoming',
  });

  const [showNotificationForm, setShowNotificationForm] = useState(false);
  const [notificationFormData, setNotificationFormData] = useState({
    title: '',
    message: '',
    targetRole: 'all',
    targetCenter: '',
    targetGrade: '',
    type: 'general',
    priority: 'medium',
  });

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCenters: 0,
    totalSchedules: 0,
    activeUsers: 0,
    totalNotifications: 0,
    upcomingSchedules: 0,
  });

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
      const [usersData, centersRes, schedulesRes, notificationsRes] =
        await Promise.all([
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
        upcomingSchedules: (schedulesRes.data.schedules || []).filter(
          (s) => s.status === 'upcoming'
        ).length,
      });
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleUserSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: userFormData.name,
        email: userFormData.email,
        role: userFormData.role,
        city: userFormData.city,
        phone: userFormData.phone,
      };

      if (!editingUser && userFormData.password) {
        payload.password = userFormData.password;
      }

      if (userFormData.role === 'student') {
        payload.examCenter = userFormData.examCenter || null;
        payload.rollNumber = userFormData.rollNumber || null;
        payload.grade = userFormData.grade || null;
        payload.board = userFormData.board || null;
      }

      if (userFormData.role === 'board_official') {
        payload.assignedCenter = userFormData.assignedCenter || null;
      }

      if (editingUser) {
        await api.put(`/admin/users/${editingUser._id}`, payload);
        toast.success('User updated successfully!');
      } else {
        await api.post('/admin/users', payload);
        toast.success('User created! Credentials sent via email.');
      }
      resetUserForm();
      fetchAllData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error saving user');
    }
  };

  const editUser = (u) => {
    setEditingUser(u);
    setUserFormData({
      name: u.name || '',
      email: u.email || '',
      password: '',
      role: u.role || 'student',
      examCenter: u.examCenter?._id || u.examCenter || '',
      rollNumber: u.rollNumber || '',
      grade: u.grade || '',
      board: u.board || '',
      assignedCenter: u.assignedCenter?._id || u.assignedCenter || '',
      city: u.city || '',
      phone: u.phone || '',
    });
    setShowUserForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetUserForm = () => {
    setShowUserForm(false);
    setEditingUser(null);
    setUserFormData({
      name: '',
      email: '',
      password: '',
      role: 'board_official',
      examCenter: '',
      rollNumber: '',
      grade: '',
      board: '',
      assignedCenter: '',
      city: '',
      phone: '',
    });
  };

  const deleteUser = async (userId) => {
    if (!confirm('Delete this user permanently?')) return;
    try {
      await api.delete(`/admin/users/${userId}`);
      toast.success('User deleted!');
      fetchAllData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error deleting user');
    }
  };

  const toggleUserStatus = async (userId, currentStatus) => {
    try {
      await api.put(`/admin/users/${userId}`, { isActive: !currentStatus });
      toast.success('Status updated!');
      fetchAllData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error updating user');
    }
  };

  const handleCenterSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCenter) {
        await api.put(`/admin/centers/${editingCenter._id}`, centerFormData);
        toast.success('Center updated!');
      } else {
        await api.post('/admin/centers', centerFormData);
        toast.success('Center created!');
      }
      resetCenterForm();
      fetchAllData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error saving center');
    }
  };

  const editCenter = (center) => {
    setEditingCenter(center);
    setCenterFormData({
      centerCode: center.centerCode || '',
      name: center.name || '',
      address: center.address || '',
      latitude: center.latitude || '',
      longitude: center.longitude || '',
      city: center.city || '',
      state: center.state || '',
      capacity: center.capacity || '',
      contactNumber: center.contactNumber || '',
      contactEmail: center.contactEmail || '',
      boardOfficial: center.boardOfficial?._id || center.boardOfficial || '',
    });
    setShowCenterForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetCenterForm = () => {
    setShowCenterForm(false);
    setEditingCenter(null);
    setCenterFormData({
      centerCode: '',
      name: '',
      address: '',
      latitude: '',
      longitude: '',
      city: '',
      state: '',
      capacity: '',
      contactNumber: '',
      contactEmail: '',
      boardOfficial: '',
    });
  };

  const deleteCenter = async (centerId) => {
    if (!confirm('Delete this center permanently?')) return;
    try {
      await api.delete(`/admin/centers/${centerId}`);
      toast.success('Center deleted!');
      fetchAllData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error deleting center');
    }
  };

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...scheduleFormData,
        totalStudents: parseInt(scheduleFormData.totalStudents) || 0,
      };

      if (editingSchedule) {
        await api.put(`/admin/schedules/${editingSchedule._id}`, payload);
        toast.success('Schedule updated!');
      } else {
        await api.post('/admin/schedules', payload);
        toast.success('Schedule created!');
      }
      resetScheduleForm();
      fetchAllData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error saving schedule');
    }
  };

  const editSchedule = (s) => {
    setEditingSchedule(s);
    setScheduleFormData({
      examCenterId: s.examCenterId?._id || s.examCenterId || '',
      examDate: s.examDate ? new Date(s.examDate).toISOString().split('T')[0] : '',
      examTime: s.examTime || '',
      subject: s.subject || '',
      subjectCode: s.subjectCode || '',
      grade: s.grade || '',
      totalStudents: s.totalStudents || '',
      duration: s.duration || 180,
      roomNumber: s.roomNumber || '',
      status: s.status || 'upcoming',
    });
    setShowScheduleForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetScheduleForm = () => {
    setShowScheduleForm(false);
    setEditingSchedule(null);
    setScheduleFormData({
      examCenterId: '',
      examDate: '',
      examTime: '',
      subject: '',
      subjectCode: '',
      grade: '',
      totalStudents: '',
      duration: 180,
      roomNumber: '',
      status: 'upcoming',
    });
  };

  const deleteSchedule = async (scheduleId) => {
    if (!confirm('Delete this schedule permanently?')) return;
    try {
      await api.delete(`/admin/schedules/${scheduleId}`);
      toast.success('Schedule deleted!');
      fetchAllData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error deleting schedule');
    }
  };

  const handleNotificationSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        title: notificationFormData.title,
        message: notificationFormData.message,
        targetRole: notificationFormData.targetRole,
        targetCenter: notificationFormData.targetCenter || null,
        targetGrade: notificationFormData.targetGrade || null,
        type: notificationFormData.type || 'general',
        priority: notificationFormData.priority || 'medium',
      };
      await api.post('/notifications', payload);
      toast.success('Notification sent!');
      setShowNotificationForm(false);
      setNotificationFormData({
        title: '',
        message: '',
        targetRole: 'all',
        targetCenter: '',
        targetGrade: '',
        type: 'general',
        priority: 'medium',
      });
      fetchAllData();
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.response?.data?.errors?.[0]?.msg ||
          'Error sending notification'
      );
    }
  };

  const deleteNotification = async (notificationId) => {
    if (!confirm('Delete this notification?')) return;
    try {
      await api.delete(`/notifications/${notificationId}`);
      toast.success('Notification deleted!');
      fetchAllData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error deleting notification');
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

  const getStatusColor = (status) => statusStyles[status] || statusStyles.upcoming;
  const getRoleColor = (role) => roleStyles[role] || roleStyles.default;

  const filteredUsers = (users || [])
    .filter(
      (u) =>
        u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.rollNumber?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      let aVal = a[sortField] || '';
      let bVal = b[sortField] || '';
      if (typeof aVal === 'string') aVal = aVal.toLowerCase();
      if (typeof bVal === 'string') bVal = bVal.toLowerCase();
      return sortDirection === 'asc'
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
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

  const boardOfficials = users.filter((u) => u.role === 'board_official');

  const monthlyActivity = useMemo(() => {
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    ];
    const counts = new Array(12).fill(0);
    (schedules || []).forEach((s) => {
      const d = s.examDate ? new Date(s.examDate) : null;
      if (d && !isNaN(d)) counts[d.getMonth()] += 1;
    });
    const max = Math.max(1, ...counts);
    return months.map((label, i) => ({
      label,
      value: counts[i],
      pct: Math.round((counts[i] / max) * 100),
    }));
  }, [schedules]);

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: HomeIcon, hint: 'System overview' },
    { id: 'users', label: 'Users', icon: UserGroupIcon, hint: 'Manage accounts' },
    { id: 'centers', label: 'Exam Centers', icon: BuildingOfficeIcon, hint: 'Center network' },
    { id: 'schedules', label: 'Schedules', icon: CalendarIcon, hint: 'Exam timetable' },
    { id: 'notifications', label: 'Notifications', icon: BellIcon, hint: 'Announcements' },
    { id: 'reports', label: 'Reports', icon: ClipboardDocumentListIcon, hint: 'Analytics' },
    { id: 'settings', label: 'Settings', icon: Cog6ToothIcon, hint: 'System config' },
  ];

  const SectionHeader = ({ title, children }) => (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <h3 className="text-lg font-bold text-slate-100">{title}</h3>
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
        className="pl-9 pr-3 py-2.5 text-sm bg-white/[0.04] border border-white/[0.08] rounded-xl focus:ring-2 focus:ring-teal-400/20 focus:border-teal-400/60 outline-none w-full sm:w-56 text-slate-100 placeholder-slate-500 transition-all"
      />
    </div>
  );

  const EmptyState = ({ icon: Icon, text }) => (
    <div className="flex flex-col items-center justify-center text-center py-20 px-6">
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-500/20 to-emerald-500/10 rounded-2xl blur-xl" />
        <div className="relative p-5 rounded-2xl bg-gradient-to-br from-white/[0.06] to-white/[0.02] border border-white/[0.08]">
          <Icon className="w-9 h-9 text-slate-500" />
        </div>
      </div>
      <p className="text-base font-bold text-slate-200">{text}</p>
    </div>
  );

  const StatCard = ({ icon: Icon, label, value, color = 'teal' }) => {
    const colorClasses = {
      teal: 'from-teal-500/25 to-emerald-500/10 text-teal-300 ring-teal-500/30',
      sky: 'from-sky-500/25 to-blue-500/10 text-sky-300 ring-sky-500/30',
      violet: 'from-violet-500/25 to-purple-500/10 text-violet-300 ring-violet-500/30',
      amber: 'from-amber-500/25 to-orange-500/10 text-amber-300 ring-amber-500/30',
      emerald: 'from-emerald-500/25 to-green-500/10 text-emerald-300 ring-emerald-500/30',
      rose: 'from-rose-500/25 to-red-500/10 text-rose-300 ring-rose-500/30',
    };
    return (
      <div className={`${ui.panel} p-4 sm:p-5 hover:border-white/[0.15] transition-all duration-300 group`}>
        <div
          className={`relative inline-flex p-2.5 rounded-xl bg-gradient-to-br ring-1 mb-4 ${colorClasses[color]} group-hover:scale-110 transition-transform`}
        >
          <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-current to-transparent opacity-30 blur-md" />
          <Icon className="relative w-5 h-5" />
        </div>
        <div className="text-3xl font-black text-slate-50 tabular-nums tracking-tight">
          {value}
        </div>
        <div className="text-slate-500 text-xs font-semibold mt-1 uppercase tracking-wider">
          {label}
        </div>
      </div>
    );
  };

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          icon={UserGroupIcon}
          label="Total Users"
          value={stats.totalUsers}
          color="sky"
        />
        <StatCard
          icon={CheckCircleIcon}
          label="Active Users"
          value={stats.activeUsers}
          color="emerald"
        />
        <StatCard
          icon={BuildingOfficeIcon}
          label="Exam Centers"
          value={stats.totalCenters}
          color="violet"
        />
        <StatCard
          icon={CalendarIcon}
          label="Upcoming Exams"
          value={stats.upcomingSchedules}
          color="amber"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        <div className={`${ui.panel} p-5 sm:p-6 lg:col-span-3`}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-slate-100 font-bold text-base">
                Exams scheduled by month
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Distribution across the year
              </p>
            </div>
            <span className="px-3 py-1 rounded-lg bg-teal-500/10 text-teal-300 text-xs font-bold ring-1 ring-teal-500/20">
              {schedules.length} total
            </span>
          </div>
          <div className="h-48 flex items-end gap-1.5">
            {monthlyActivity.map((m, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                <div className="w-full flex items-end h-36 relative">
                  <div
                    className="w-full bg-gradient-to-t from-teal-500/70 via-teal-400/70 to-teal-300/80 group-hover:from-teal-400 group-hover:via-teal-300 group-hover:to-teal-200 rounded-t transition-all duration-300 shadow-[0_0_20px_-5px_rgba(20,184,166,0.4)] group-hover:shadow-[0_0_25px_-3px_rgba(20,184,166,0.7)]"
                    style={{ height: `${Math.max(4, m.pct)}%` }}
                    title={`${m.label}: ${m.value}`}
                  />
                </div>
                <span className="text-[10px] font-semibold text-slate-500 group-hover:text-slate-300 transition-colors">
                  {m.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className={`${ui.panel} p-5 sm:p-6 lg:col-span-2`}>
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-slate-100 font-bold text-base">Recent activity</h3>
            <BellIcon className="w-4 h-4 text-slate-500" />
          </div>
          <div className="space-y-3">
            {notifications.slice(0, 5).map((n) => (
              <div
                key={n._id}
                className="flex items-start gap-3 p-3 bg-gradient-to-r from-white/[0.04] to-transparent rounded-xl border border-white/[0.06] hover:border-white/[0.12] transition-all group"
              >
                <div className="p-2 rounded-lg bg-gradient-to-br from-teal-500/25 to-emerald-500/10 text-teal-300 shrink-0 ring-1 ring-teal-500/25 group-hover:scale-110 transition-transform">
                  <BellIcon className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-slate-200 text-sm font-semibold truncate">
                    {n.title}
                  </p>
                  <p className="text-slate-500 text-xs mt-0.5 font-mono">
                    {new Date(n.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
            {notifications.length === 0 && (
              <p className="text-slate-500 text-sm text-center py-8">
                No recent activity
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderUsers = () => (
    <div>
      <SectionHeader title="All Users">
        <SearchInput placeholder="Search users..." />
        <button
          onClick={() => {
            setShowUserForm(true);
            setEditingUser(null);
          }}
          className={ui.btnPrimary}
        >
          <PlusIcon className="w-4 h-4" />
          Create User
        </button>
      </SectionHeader>

      {showUserForm && (
        <div className={`mb-6 ${ui.panel} p-5 sm:p-6`}>
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-base font-bold text-slate-100">
              {editingUser ? 'Edit User' : 'Create New User'}
            </h3>
            <button onClick={resetUserForm} className={ui.iconBtn}>
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleUserSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={ui.label}>Full Name</label>
              <input
                type="text"
                placeholder="Jane Doe"
                value={userFormData.name}
                onChange={(e) => setUserFormData({ ...userFormData, name: e.target.value })}
                className={ui.input}
                required
              />
            </div>

            <div>
              <label className={ui.label}>Email</label>
              <input
                type="email"
                placeholder="jane@board.gov"
                value={userFormData.email}
                onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
                className={ui.input}
                required
                disabled={!!editingUser}
              />
            </div>

            {!editingUser && (
              <div>
                <label className={ui.label}>Password</label>
                <input
                  type="password"
                  placeholder="Min. 6 characters"
                  value={userFormData.password}
                  onChange={(e) =>
                    setUserFormData({ ...userFormData, password: e.target.value })
                  }
                  className={ui.input}
                  required
                  minLength="6"
                />
              </div>
            )}

            <div>
              <label className={ui.label}>Role</label>
              <select
                value={userFormData.role}
                onChange={(e) => setUserFormData({ ...userFormData, role: e.target.value })}
                className={ui.input}
              >
                <option value="student">Student</option>
                <option value="board_official">Board Official</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div>
              <label className={ui.label}>Phone</label>
              <input
                type="tel"
                placeholder="+92 300 1234567"
                value={userFormData.phone}
                onChange={(e) => setUserFormData({ ...userFormData, phone: e.target.value })}
                className={ui.input}
              />
            </div>

            <div>
              <label className={ui.label}>City</label>
              <input
                type="text"
                placeholder="Lahore"
                value={userFormData.city}
                onChange={(e) => setUserFormData({ ...userFormData, city: e.target.value })}
                className={ui.input}
              />
            </div>

            {userFormData.role === 'student' && (
              <>
                <div className="sm:col-span-2">
                  <label className={ui.label}>Exam Center</label>
                  <select
                    value={userFormData.examCenter}
                    onChange={(e) =>
                      setUserFormData({ ...userFormData, examCenter: e.target.value })
                    }
                    className={ui.input}
                  >
                    <option value="">Select Center</option>
                    {centers.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.centerCode} — {c.name} ({c.city})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={ui.label}>Roll Number</label>
                  <input
                    type="text"
                    placeholder="12345"
                    value={userFormData.rollNumber}
                    onChange={(e) =>
                      setUserFormData({
                        ...userFormData,
                        rollNumber: e.target.value.toUpperCase(),
                      })
                    }
                    className={ui.input}
                  />
                </div>

                <div>
                  <label className={ui.label}>Grade</label>
                  <select
                    value={userFormData.grade}
                    onChange={(e) =>
                      setUserFormData({ ...userFormData, grade: e.target.value })
                    }
                    className={ui.input}
                  >
                    <option value="">Select Grade</option>
                    <option value="9">9th Class</option>
                    <option value="10">10th Class</option>
                    <option value="11">11th Class</option>
                    <option value="12">12th Class</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className={ui.label}>Board</label>
                  <select
                    value={userFormData.board}
                    onChange={(e) =>
                      setUserFormData({ ...userFormData, board: e.target.value })
                    }
                    className={ui.input}
                  >
                    <option value="">Select Board</option>
                    <option value="Punjab Board">Punjab Board</option>
                    <option value="Federal Board">Federal Board</option>
                    <option value="Sindh Board">Sindh Board</option>
                    <option value="KPK Board">KPK Board</option>
                    <option value="Balochistan Board">Balochistan Board</option>
                    <option value="AJK Board">AJK Board</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </>
            )}

            {userFormData.role === 'board_official' && (
              <div className="sm:col-span-2">
                <label className={ui.label}>Assigned Center</label>
                <select
                  value={userFormData.assignedCenter}
                  onChange={(e) =>
                    setUserFormData({ ...userFormData, assignedCenter: e.target.value })
                  }
                  className={ui.input}
                >
                  <option value="">Select Center</option>
                  {centers.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.centerCode} — {c.name} ({c.city})
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-500 mt-1.5">
                  Board officials can only manage schedules & notifications for their assigned center.
                </p>
              </div>
            )}

            <div className="sm:col-span-2 flex flex-col sm:flex-row gap-3 pt-2">
              <button type="submit" className={`${ui.btnPrimary} flex-1`}>
                {editingUser ? 'Update User' : 'Create & Send Credentials'}
              </button>
              <button type="button" onClick={resetUserForm} className={ui.btnGhost}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {filteredUsers.length === 0 ? (
        <div className={`${ui.panel} p-6`}>
          <EmptyState icon={UserGroupIcon} text="No users match your search." />
        </div>
      ) : (
        <>
          <div className={`hidden md:block ${ui.panel} overflow-hidden`}>
            <table className="w-full text-sm">
              <thead className="bg-white/[0.03] border-b border-white/[0.06]">
                <tr>
                  <th
                    className="px-4 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-widest cursor-pointer hover:text-slate-200 transition"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center gap-1">
                      Name
                      {sortField === 'name' &&
                        (sortDirection === 'asc' ? (
                          <ChevronUpIcon className="w-3 h-3" />
                        ) : (
                          <ChevronDownIcon className="w-3 h-3" />
                        ))}
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                    Role
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                    Center / Roll
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                    Status
                  </th>
                  <th className="px-4 py-3 text-center text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {filteredUsers.map((u) => (
                  <tr key={u._id} className="hover:bg-white/[0.02] transition">
                    <td className="px-4 py-4 font-semibold text-slate-100">{u.name}</td>
                    <td className="px-4 py-4 text-slate-400 text-xs">{u.email}</td>
                    <td className="px-4 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold ${getRoleColor(
                          u.role
                        )}`}
                      >
                        {u.role?.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-xs">
                      {u.role === 'student' && (
                        <div>
                          <span className="text-slate-300 font-mono">
                            {u.rollNumber || '-'}
                          </span>
                          {u.grade && (
                            <span className="block text-slate-500 mt-0.5">
                              Grade {u.grade}
                            </span>
                          )}
                        </div>
                      )}
                      {u.role === 'board_official' && (
                        <span className="text-slate-400">
                          {u.assignedCenter?.centerCode || 'Not assigned'}
                        </span>
                      )}
                      {u.role === 'admin' && <span className="text-slate-600">—</span>}
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ${
                          u.isActive
                            ? 'bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/25'
                            : 'bg-rose-500/15 text-rose-300 ring-1 ring-rose-500/25'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            u.isActive ? 'bg-emerald-400' : 'bg-rose-400'
                          }`}
                        />
                        {u.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex justify-center items-center gap-1">
                        <button
                          onClick={() => editUser(u)}
                          className={ui.iconBtn}
                          title="Edit"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => toggleUserStatus(u._id, u.isActive)}
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition ${
                            u.isActive
                              ? 'bg-rose-500/10 text-rose-300 hover:bg-rose-500/20'
                              : 'bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20'
                          }`}
                          disabled={u._id === user?._id}
                        >
                          {u.isActive ? 'Disable' : 'Enable'}
                        </button>
                        <button
                          onClick={() => deleteUser(u._id)}
                          className="p-2 rounded-xl text-rose-400 hover:bg-rose-500/10 transition"
                          disabled={u._id === user?._id}
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="md:hidden space-y-3">
            {filteredUsers.map((u) => (
              <div key={u._id} className={`${ui.panel} p-4`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-bold text-slate-100 truncate">{u.name}</p>
                    <p className="text-slate-500 text-xs truncate">{u.email}</p>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${getRoleColor(
                          u.role
                        )}`}
                      >
                        {u.role?.replace('_', ' ')}
                      </span>
                      {u.role === 'student' && u.rollNumber && (
                        <span className="text-xs text-slate-500 font-mono">
                          #{u.rollNumber}
                        </span>
                      )}
                    </div>
                  </div>
                  <span
                    className={`shrink-0 px-2 py-1 rounded-lg text-[10px] font-bold ${
                      u.isActive
                        ? 'bg-emerald-500/15 text-emerald-300'
                        : 'bg-rose-500/15 text-rose-300'
                    }`}
                  >
                    {u.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="flex items-center justify-end gap-1 mt-3 pt-3 border-t border-white/[0.06]">
                  <button onClick={() => editUser(u)} className={ui.iconBtn}>
                    <PencilIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteUser(u._id)}
                    className="p-2 rounded-xl text-rose-400"
                    disabled={u._id === user?._id}
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );

  const renderCenters = () => (
    <div>
      <SectionHeader title="All Exam Centers">
        <SearchInput placeholder="Search centers..." />
        <button
          onClick={() => {
            setShowCenterForm(true);
            setEditingCenter(null);
          }}
          className={ui.btnPrimary}
        >
          <PlusIcon className="w-4 h-4" />
          Create Center
        </button>
      </SectionHeader>

      {showCenterForm && (
        <div className={`mb-6 ${ui.panel} p-5 sm:p-6`}>
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-base font-bold text-slate-100">
              {editingCenter ? 'Edit Center' : 'Create New Center'}
            </h3>
            <button onClick={resetCenterForm} className={ui.iconBtn}>
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleCenterSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={ui.label}>Center Code</label>
              <input
                type="text"
                placeholder="LHR001"
                value={centerFormData.centerCode}
                onChange={(e) =>
                  setCenterFormData({
                    ...centerFormData,
                    centerCode: e.target.value.toUpperCase(),
                  })
                }
                className={ui.input}
                required
              />
            </div>

            <div>
              <label className={ui.label}>Center Name</label>
              <input
                type="text"
                placeholder="Government High School"
                value={centerFormData.name}
                onChange={(e) =>
                  setCenterFormData({ ...centerFormData, name: e.target.value })
                }
                className={ui.input}
                required
              />
            </div>

            <div className="sm:col-span-2">
              <label className={ui.label}>Address</label>
              <input
                type="text"
                placeholder="Mall Road, Lahore"
                value={centerFormData.address}
                onChange={(e) =>
                  setCenterFormData({ ...centerFormData, address: e.target.value })
                }
                className={ui.input}
                required
              />
            </div>

            <div>
              <label className={ui.label}>City</label>
              <input
                type="text"
                placeholder="Lahore"
                value={centerFormData.city}
                onChange={(e) =>
                  setCenterFormData({ ...centerFormData, city: e.target.value })
                }
                className={ui.input}
                required
              />
            </div>

            <div>
              <label className={ui.label}>State / Province</label>
              <input
                type="text"
                placeholder="Punjab"
                value={centerFormData.state}
                onChange={(e) =>
                  setCenterFormData({ ...centerFormData, state: e.target.value })
                }
                className={ui.input}
              />
            </div>

            <div>
              <label className={ui.label}>Latitude</label>
              <input
                type="number"
                step="any"
                placeholder="31.5204"
                value={centerFormData.latitude}
                onChange={(e) =>
                  setCenterFormData({ ...centerFormData, latitude: e.target.value })
                }
                className={ui.input}
                required
              />
            </div>

            <div>
              <label className={ui.label}>Longitude</label>
              <input
                type="number"
                step="any"
                placeholder="74.3587"
                value={centerFormData.longitude}
                onChange={(e) =>
                  setCenterFormData({ ...centerFormData, longitude: e.target.value })
                }
                className={ui.input}
                required
              />
            </div>

            <div>
              <label className={ui.label}>Capacity</label>
              <input
                type="number"
                placeholder="500"
                value={centerFormData.capacity}
                onChange={(e) =>
                  setCenterFormData({ ...centerFormData, capacity: e.target.value })
                }
                className={ui.input}
              />
            </div>

            <div>
              <label className={ui.label}>Contact Number</label>
              <input
                type="tel"
                placeholder="+92 300 1234567"
                value={centerFormData.contactNumber}
                onChange={(e) =>
                  setCenterFormData({
                    ...centerFormData,
                    contactNumber: e.target.value,
                  })
                }
                className={ui.input}
              />
            </div>

            <div className="sm:col-span-2">
              <label className={ui.label}>Contact Email</label>
              <input
                type="email"
                placeholder="info@center.edu.pk"
                value={centerFormData.contactEmail}
                onChange={(e) =>
                  setCenterFormData({
                    ...centerFormData,
                    contactEmail: e.target.value,
                  })
                }
                className={ui.input}
              />
            </div>

            <div className="sm:col-span-2">
              <label className={ui.label}>Board Official (In-charge)</label>
              <select
                value={centerFormData.boardOfficial}
                onChange={(e) =>
                  setCenterFormData({
                    ...centerFormData,
                    boardOfficial: e.target.value,
                  })
                }
                className={ui.input}
              >
                <option value="">Select Board Official</option>
                {boardOfficials.map((o) => (
                  <option key={o._id} value={o._id}>
                    {o.name} — {o.email}
                  </option>
                ))}
              </select>
              <p className="text-[10px] text-slate-500 mt-1.5">
                The selected official will be the in-charge of this center.
              </p>
            </div>

            <div className="sm:col-span-2 flex flex-col sm:flex-row gap-3 pt-2">
              <button type="submit" className={`${ui.btnPrimary} flex-1`}>
                {editingCenter ? 'Update Center' : 'Create Center'}
              </button>
              <button type="button" onClick={resetCenterForm} className={ui.btnGhost}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {filteredCenters.length === 0 ? (
        <div className={`${ui.panel} p-6`}>
          <EmptyState icon={BuildingOfficeIcon} text="No centers match your search." />
        </div>
      ) : (
        <>
          <div className={`hidden md:block ${ui.panel} overflow-hidden`}>
            <table className="w-full text-sm">
              <thead className="bg-white/[0.03] border-b border-white/[0.06]">
                <tr>
                  <th className="px-4 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                    Code
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                    City
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                    Official
                  </th>
                  <th className="px-4 py-3 text-center text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                    Students
                  </th>
                  <th className="px-4 py-3 text-center text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {filteredCenters.map((c) => (
                  <tr key={c._id} className="hover:bg-white/[0.02] transition">
                    <td className="px-4 py-4 font-mono text-xs font-bold text-teal-300">
                      {c.centerCode}
                    </td>
                    <td className="px-4 py-4 text-slate-100 font-medium">{c.name}</td>
                    <td className="px-4 py-4 text-slate-400 text-xs">{c.city}</td>
                    <td className="px-4 py-4 text-xs">
                      {c.boardOfficial?.name ? (
                        <span className="text-violet-300 font-semibold">
                          {c.boardOfficial.name}
                        </span>
                      ) : (
                        <span className="text-slate-600 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-violet-500/15 text-violet-300 ring-1 ring-violet-500/25">
                        {c.totalStudents || 0}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex justify-center gap-1">
                        <button onClick={() => editCenter(c)} className={ui.iconBtn}>
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteCenter(c._id)}
                          className="p-2 rounded-xl text-rose-400 hover:bg-rose-500/10 transition"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="md:hidden space-y-3">
            {filteredCenters.map((c) => (
              <div key={c._id} className={`${ui.panel} p-4`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-mono text-xs text-teal-300 mb-0.5 font-bold">
                      {c.centerCode}
                    </p>
                    <p className="font-bold text-slate-100 truncate">{c.name}</p>
                    <div className="flex items-start gap-1 mt-1.5 text-xs text-slate-500">
                      <MapPinIcon className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      <span>{c.city}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => editCenter(c)} className={ui.iconBtn}>
                      <PencilIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteCenter(c._id)}
                      className="p-2 rounded-xl text-rose-400"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/[0.06] text-xs">
                  <span className="text-slate-400">
                    Official: {c.boardOfficial?.name || 'Unassigned'}
                  </span>
                  <span className="text-violet-300 font-bold">
                    {c.totalStudents || 0} students
                  </span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );

  const renderSchedules = () => (
    <div>
      <SectionHeader title="All Schedules">
        <SearchInput placeholder="Search schedules..." />
        <button
          onClick={() => {
            setShowScheduleForm(true);
            setEditingSchedule(null);
          }}
          className={ui.btnPrimary}
        >
          <PlusIcon className="w-4 h-4" />
          Create Schedule
        </button>
      </SectionHeader>

      {showScheduleForm && (
        <div className={`mb-6 ${ui.panel} p-5 sm:p-6`}>
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-base font-bold text-slate-100">
              {editingSchedule ? 'Edit Schedule' : 'Create New Schedule'}
            </h3>
            <button onClick={resetScheduleForm} className={ui.iconBtn}>
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleScheduleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className={ui.label}>Exam Center</label>
              <select
                value={scheduleFormData.examCenterId}
                onChange={(e) =>
                  setScheduleFormData({
                    ...scheduleFormData,
                    examCenterId: e.target.value,
                  })
                }
                className={ui.input}
                required
              >
                <option value="">Select Center</option>
                {centers.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.centerCode} — {c.name} ({c.city})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={ui.label}>Subject</label>
              <input
                type="text"
                placeholder="Mathematics"
                value={scheduleFormData.subject}
                onChange={(e) =>
                  setScheduleFormData({
                    ...scheduleFormData,
                    subject: e.target.value,
                  })
                }
                className={ui.input}
                required
              />
            </div>

            <div>
              <label className={ui.label}>Subject Code</label>
              <input
                type="text"
                placeholder="MATH"
                value={scheduleFormData.subjectCode}
                onChange={(e) =>
                  setScheduleFormData({
                    ...scheduleFormData,
                    subjectCode: e.target.value.toUpperCase(),
                  })
                }
                className={ui.input}
              />
            </div>

            <div>
              <label className={ui.label}>Grade</label>
              <select
                value={scheduleFormData.grade}
                onChange={(e) =>
                  setScheduleFormData({ ...scheduleFormData, grade: e.target.value })
                }
                className={ui.input}
              >
                <option value="">All Grades</option>
                <option value="9">9th Class</option>
                <option value="10">10th Class</option>
                <option value="11">11th Class</option>
                <option value="12">12th Class</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className={ui.label}>Exam Date</label>
              <input
                type="date"
                value={scheduleFormData.examDate}
                onChange={(e) =>
                  setScheduleFormData({
                    ...scheduleFormData,
                    examDate: e.target.value,
                  })
                }
                className={ui.input}
                required
              />
            </div>

            <div>
              <label className={ui.label}>Exam Time</label>
              <input
                type="time"
                value={scheduleFormData.examTime}
                onChange={(e) =>
                  setScheduleFormData({
                    ...scheduleFormData,
                    examTime: e.target.value,
                  })
                }
                className={ui.input}
                required
              />
            </div>

            <div>
              <label className={ui.label}>Duration (minutes)</label>
              <input
                type="number"
                placeholder="180"
                value={scheduleFormData.duration}
                onChange={(e) =>
                  setScheduleFormData({
                    ...scheduleFormData,
                    duration: parseInt(e.target.value) || 180,
                  })
                }
                className={ui.input}
              />
            </div>

            <div>
              <label className={ui.label}>Total Students</label>
              <input
                type="number"
                placeholder="240"
                value={scheduleFormData.totalStudents}
                onChange={(e) =>
                  setScheduleFormData({
                    ...scheduleFormData,
                    totalStudents: e.target.value,
                  })
                }
                className={ui.input}
              />
            </div>

            <div>
              <label className={ui.label}>Room Number</label>
              <input
                type="text"
                placeholder="Hall A"
                value={scheduleFormData.roomNumber}
                onChange={(e) =>
                  setScheduleFormData({
                    ...scheduleFormData,
                    roomNumber: e.target.value,
                  })
                }
                className={ui.input}
              />
            </div>

            <div>
              <label className={ui.label}>Status</label>
              <select
                value={scheduleFormData.status}
                onChange={(e) =>
                  setScheduleFormData({
                    ...scheduleFormData,
                    status: e.target.value,
                  })
                }
                className={ui.input}
              >
                <option value="upcoming">Upcoming</option>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="postponed">Postponed</option>
              </select>
            </div>

            <div className="sm:col-span-2 flex flex-col sm:flex-row gap-3 pt-2">
              <button type="submit" className={`${ui.btnPrimary} flex-1`}>
                {editingSchedule ? 'Update Schedule' : 'Create Schedule'}
              </button>
              <button type="button" onClick={resetScheduleForm} className={ui.btnGhost}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {filteredSchedules.length === 0 ? (
        <div className={`${ui.panel} p-6`}>
          <EmptyState icon={CalendarIcon} text="No schedules match your search." />
        </div>
      ) : (
        <>
          <div className={`hidden md:block ${ui.panel} overflow-hidden`}>
            <table className="w-full text-sm">
              <thead className="bg-white/[0.03] border-b border-white/[0.06]">
                <tr>
                  <th className="px-4 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                    Center
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                    Subject
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                    Grade
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                    Status
                  </th>
                  <th className="px-4 py-3 text-center text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {filteredSchedules.map((s) => (
                  <tr key={s._id} className="hover:bg-white/[0.02] transition">
                    <td className="px-4 py-4">
                      <div className="flex flex-col">
                        <span className="font-mono text-xs text-teal-300 font-bold">
                          {s.examCenterId?.centerCode}
                        </span>
                        <span className="text-xs text-slate-500">
                          {s.examCenterId?.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4 font-medium text-slate-100">{s.subject}</td>
                    <td className="px-4 py-4 text-xs">
                      {s.grade ? (
                        <span className="px-2 py-0.5 rounded bg-white/[0.04] text-slate-300">
                          Grade {s.grade}
                        </span>
                      ) : (
                        <span className="text-slate-600">All</span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-slate-400 text-xs">
                      {new Date(s.examDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                      <span className="block text-slate-500 font-mono mt-0.5">
                        {s.examTime}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold capitalize ${getStatusColor(
                          s.status
                        )}`}
                      >
                        {s.status || 'upcoming'}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex justify-center gap-1">
                        <button onClick={() => editSchedule(s)} className={ui.iconBtn}>
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteSchedule(s._id)}
                          className="p-2 rounded-xl text-rose-400 hover:bg-rose-500/10 transition"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="md:hidden space-y-3">
            {filteredSchedules.map((s) => (
              <div key={s._id} className={`${ui.panel} p-4`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-bold text-slate-100 truncate">{s.subject}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {s.examCenterId?.centerCode} · {s.examCenterId?.name}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 px-2.5 py-1 rounded-lg text-xs font-bold capitalize ${getStatusColor(
                      s.status
                    )}`}
                  >
                    {s.status}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/[0.06] text-xs text-slate-400">
                  <span>
                    {new Date(s.examDate).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}{' '}
                    · {s.examTime}
                  </span>
                  <div className="flex items-center gap-1">
                    <button onClick={() => editSchedule(s)} className={ui.iconBtn}>
                      <PencilIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteSchedule(s._id)}
                      className="p-2 rounded-xl text-rose-400"
                    >
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

  const renderNotifications = () => (
    <div>
      <SectionHeader title="All Notifications">
        <button
          onClick={() => setShowNotificationForm(true)}
          className={ui.btnPrimary}
        >
          <PlusIcon className="w-4 h-4" />
          Send Notification
        </button>
      </SectionHeader>

      {showNotificationForm && (
        <div className={`mb-6 ${ui.panel} p-5 sm:p-6`}>
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-base font-bold text-slate-100">Send Notification</h3>
            <button
              onClick={() => setShowNotificationForm(false)}
              className={ui.iconBtn}
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleNotificationSubmit} className="space-y-4">
            <div>
              <label className={ui.label}>Title</label>
              <input
                type="text"
                placeholder="Exam schedule updated"
                value={notificationFormData.title}
                onChange={(e) =>
                  setNotificationFormData({
                    ...notificationFormData,
                    title: e.target.value,
                  })
                }
                className={ui.input}
                required
              />
            </div>

            <div>
              <label className={ui.label}>Message</label>
              <textarea
                placeholder="Write your notification message..."
                rows="4"
                value={notificationFormData.message}
                onChange={(e) =>
                  setNotificationFormData({
                    ...notificationFormData,
                    message: e.target.value,
                  })
                }
                className={`${ui.input} resize-none`}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={ui.label}>Send To</label>
                <select
                  value={notificationFormData.targetRole}
                  onChange={(e) =>
                    setNotificationFormData({
                      ...notificationFormData,
                      targetRole: e.target.value,
                    })
                  }
                  className={ui.input}
                >
                  <option value="all">All Users</option>
                  <option value="students">Students Only</option>
                  <option value="board_official">Board Officials Only</option>
                  <option value="admin">Admins Only</option>
                </select>
              </div>

              <div>
                <label className={ui.label}>Target Center (Optional)</label>
                <select
                  value={notificationFormData.targetCenter}
                  onChange={(e) =>
                    setNotificationFormData({
                      ...notificationFormData,
                      targetCenter: e.target.value,
                    })
                  }
                  className={ui.input}
                >
                  <option value="">All Centers</option>
                  {centers.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.centerCode} — {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={ui.label}>Target Grade (Optional)</label>
                <select
                  value={notificationFormData.targetGrade}
                  onChange={(e) =>
                    setNotificationFormData({
                      ...notificationFormData,
                      targetGrade: e.target.value,
                    })
                  }
                  className={ui.input}
                >
                  <option value="">All Grades</option>
                  <option value="9">9th Class</option>
                  <option value="10">10th Class</option>
                  <option value="11">11th Class</option>
                  <option value="12">12th Class</option>
                </select>
              </div>

              <div>
                <label className={ui.label}>Priority</label>
                <select
                  value={notificationFormData.priority}
                  onChange={(e) =>
                    setNotificationFormData({
                      ...notificationFormData,
                      priority: e.target.value,
                    })
                  }
                  className={ui.input}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>

            <button type="submit" className={`${ui.btnPrimary} w-full`}>
              <PaperAirplaneIcon className="w-4 h-4" />
              Send Notification
            </button>
          </form>
        </div>
      )}

      {notifications.length === 0 ? (
        <div className={`${ui.panel} p-6`}>
          <EmptyState icon={BellIcon} text="No notifications sent yet." />
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div key={n._id} className={`${ui.panel} p-4 sm:p-5`}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-bold text-slate-100">{n.title}</p>
                    {n.priority && (
                      <span
                        className={`px-2 py-0.5 text-[10px] font-bold rounded-md uppercase ${
                          n.priority === 'urgent'
                            ? 'bg-rose-500/15 text-rose-300 ring-1 ring-rose-500/25'
                            : n.priority === 'high'
                            ? 'bg-amber-500/15 text-amber-300 ring-1 ring-amber-500/25'
                            : 'bg-slate-500/15 text-slate-300 ring-1 ring-slate-500/25'
                        }`}
                      >
                        {n.priority}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                    {n.message}
                  </p>
                  <div className="flex items-center gap-3 mt-3 flex-wrap text-xs">
                    <span className="text-slate-600">
                      To: <span className="text-slate-400">{n.targetRole}</span>
                    </span>
                    {n.targetCenter && (
                      <span className="text-slate-600">
                        Center:{' '}
                        <span className="text-slate-400">
                          {n.targetCenter?.centerCode || 'N/A'}
                        </span>
                      </span>
                    )}
                    {n.targetGrade && (
                      <span className="text-slate-600">
                        Grade: <span className="text-slate-400">{n.targetGrade}</span>
                      </span>
                    )}
                    <span className="text-slate-600 font-mono">
                      {new Date(n.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => deleteNotification(n._id)}
                  className="p-2 rounded-xl text-rose-400 hover:bg-rose-500/10 transition shrink-0"
                >
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
            title={collapsed ? item.label : undefined}
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
            {!collapsed && <span className="truncate">{item.label}</span>}
          </button>
        );
      })}
    </nav>
  );

  return (
    <div className={`flex h-screen ${ui.page}`}>
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <aside className="absolute left-0 top-0 bottom-0 w-72 max-w-[85vw] bg-gradient-to-b from-[#0D1119] to-[#0A0D16] border-r border-white/[0.06] flex flex-col animate-in slide-in-from-left duration-300">
            <div className="p-4 border-b border-white/[0.06] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-gradient-to-br from-teal-500/25 to-emerald-500/10 rounded-xl ring-1 ring-teal-500/30">
                  <ShieldCheckIcon className="w-5 h-5 text-teal-300" />
                </div>
                <span className="text-slate-100 font-bold">Super Admin</span>
              </div>
              <button
                onClick={() => setMobileSidebarOpen(false)}
                className={ui.iconBtn}
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
            <NavList onNavigate={() => setMobileSidebarOpen(false)} />
            <div className="p-3 border-t border-white/[0.06]">
              <div className="flex items-center gap-3 p-2">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-500/40 to-emerald-500/25 flex items-center justify-center text-teal-100 font-bold text-sm ring-1 ring-teal-500/30">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-100 truncate">
                    {user?.name}
                  </p>
                  <p className="text-[11px] text-slate-500 capitalize truncate">
                    {user?.role}
                  </p>
                </div>
                <button
                  onClick={logout}
                  className="text-slate-500 hover:text-rose-400 p-2 rounded-lg transition"
                >
                  <ArrowRightOnRectangleIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          </aside>
        </div>
      )}

      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } hidden lg:flex bg-gradient-to-b from-[#0D1119] to-[#0A0D16] border-r border-white/[0.06] transition-all duration-300 flex-col shrink-0`}
      >
        <div className="p-5 border-b border-white/[0.06] flex items-center gap-3">
          <div className="relative shrink-0">
            <div className="absolute inset-0 bg-gradient-to-br from-teal-500/40 to-emerald-500/20 rounded-xl blur-lg" />
            <div className="relative p-2.5 bg-gradient-to-br from-teal-500/25 to-emerald-500/10 rounded-xl ring-1 ring-teal-500/30">
              <ShieldCheckIcon className="w-5 h-5 text-teal-300" />
            </div>
          </div>
          {sidebarOpen && (
            <div className="min-w-0">
              <span className="text-slate-100 font-bold block leading-tight truncate">
                Super Admin
              </span>
              <span className="text-[11px] text-slate-500 truncate">
                System Dashboard
              </span>
            </div>
          )}
        </div>

        <NavList collapsed={!sidebarOpen} />

        <div className="p-3 border-t border-white/[0.06]">
          <div
            className={`flex items-center gap-3 p-2 rounded-xl bg-white/[0.02] ${
              !sidebarOpen ? 'justify-center' : ''
            }`}
          >
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-500/40 to-emerald-500/25 flex items-center justify-center text-teal-100 font-bold text-sm shrink-0 ring-1 ring-teal-500/30">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            {sidebarOpen && (
              <>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-100 truncate">
                    {user?.name}
                  </p>
                  <p className="text-[11px] text-slate-500 capitalize truncate">
                    {user?.role}
                  </p>
                </div>
                <button
                  onClick={logout}
                  title="Logout"
                  className="text-slate-500 hover:text-rose-400 p-2 rounded-lg transition shrink-0"
                >
                  <ArrowRightOnRectangleIcon className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto min-w-0">
        <header className="bg-[#080A11]/80 backdrop-blur-xl border-b border-white/[0.06] sticky top-0 z-30 px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={() => setMobileSidebarOpen(true)}
                className={`lg:hidden ${ui.iconBtn}`}
              >
                <Bars3Icon className="w-6 h-6" />
              </button>
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className={`hidden lg:flex ${ui.iconBtn} shrink-0`}
                title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
              >
                <Bars3Icon className="w-5 h-5" />
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

            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <button
                onClick={fetchAllData}
                className={ui.iconBtn}
                title="Refresh data"
              >
                <ArrowPathIcon
                  className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`}
                />
              </button>
              <div className="hidden md:flex items-center gap-2.5 bg-gradient-to-r from-white/[0.05] to-white/[0.02] pl-1.5 pr-4 py-1.5 rounded-full border border-white/[0.06]">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500/40 to-emerald-500/25 flex items-center justify-center text-teal-100 font-bold text-xs ring-1 ring-teal-500/30">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-100 leading-tight">
                    {user?.name}
                  </p>
                  <p className="text-[11px] text-slate-500 capitalize leading-tight">
                    {user?.role}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="p-4 sm:p-6 lg:p-8 w-full max-w-[1600px] mx-auto">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="flex flex-col items-center gap-3">
                <div className="w-9 h-9 border-[3px] border-teal-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-slate-500 text-sm">Loading data...</p>
              </div>
            </div>
          ) : (
            <>
              {activeTab === 'overview' && renderOverview()}
              {activeTab === 'users' && renderUsers()}
              {activeTab === 'centers' && renderCenters()}
              {activeTab === 'schedules' && renderSchedules()}
              {activeTab === 'notifications' && renderNotifications()}
              {activeTab === 'reports' && (
                <div className={`${ui.panel} p-6`}>
                  <EmptyState
                    icon={ClipboardDocumentListIcon}
                    text="Reports module coming soon."
                  />
                </div>
              )}
              {activeTab === 'settings' && (
                <div className={`${ui.panel} p-6`}>
                  <EmptyState
                    icon={Cog6ToothIcon}
                    text="Settings coming soon."
                  />
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default SuperAdminDashboard;