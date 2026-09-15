// components/BoardOfficialDashboard.jsx — Modernized + center-aware
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
  AcademicCapIcon,
  CheckCircleIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';


// ============================================================
// DESIGN TOKENS
// ============================================================
const ui = {
  page: 'bg-[#0B0E14] text-slate-100',
  panel:
    'bg-[#12151F] border border-white/[0.06] rounded-2xl shadow-[0_8px_32px_-8px_rgba(0,0,0,0.6)]',
  input:
    'w-full px-4 py-3 bg-[#0B0E14] border border-white/[0.08] rounded-xl text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-teal-400/60 focus:ring-2 focus:ring-teal-400/20 transition-all duration-200',
  label: 'block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wide',
  btnPrimary:
    'inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-[#04120D] text-sm font-bold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-teal-500/20 hover:shadow-teal-500/30 active:scale-[0.98]',
  btnGhost:
    'inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 text-xs font-medium transition-all duration-200 border border-white/[0.08] hover:border-white/[0.15]',
  iconBtn:
    'p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-white/[0.06] transition-all duration-200',
};

const statusStyles = {
  upcoming: 'bg-sky-500/10 text-sky-300 ring-1 ring-sky-500/25',
  ongoing: 'bg-emerald-500/10 text-emerald-300 ring-1 ring-emerald-500/25',
  completed: 'bg-slate-500/10 text-slate-300 ring-1 ring-slate-500/25',
  cancelled: 'bg-rose-500/10 text-rose-300 ring-1 ring-rose-500/25',
  postponed: 'bg-amber-500/10 text-amber-300 ring-1 ring-amber-500/25',
};


// ============================================================
// BOARD OFFICIAL DASHBOARD
// ============================================================
const BoardOfficialDashboard = () => {
  const { user, logout, myCenter, myCenterId } = useAuth();

  const [activeTab, setActiveTab] = useState('schedules');
  const [schedules, setSchedules] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('examDate');
  const [sortDirection, setSortDirection] = useState('asc');
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [stats, setStats] = useState({
    totalSchedules: 0,
    upcomingExams: 0,
    completedExams: 0,
    totalStudents: 0,
  });

  // ✅ STUDENTS STATE
  const [students, setStudents] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [studentsSearch, setStudentsSearch] = useState('');
  const [studentsGrade, setStudentsGrade] = useState('');
  const [studentStats, setStudentStats] = useState({
    total: 0,
    byGrade: {},
  });

  const [scheduleData, setScheduleData] = useState({
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

  const [notificationData, setNotificationData] = useState({
    title: '',
    message: '',
    targetRole: 'students',
    targetGrade: '',
    type: 'general',
    priority: 'medium',
  });


  // ============================================================
  // LIFECYCLE
  // ============================================================
  useEffect(() => {
    if (!user || (user.role !== 'board_official' && user.role !== 'admin')) {
      window.location.href = '/login';
      return;
    }

    if (user.role === 'board_official' && !myCenterId) {
      toast.error('You are not assigned to any center. Please contact admin.');
    }

    setScheduleData((prev) => ({ ...prev, examCenterId: myCenterId || '' }));

    fetchData();
    fetchNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // ✅ Fetch students when tab changes
  useEffect(() => {
    if (activeTab === 'students' && myCenterId) {
      fetchStudents();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, myCenterId]);

  // ✅ Debounced students search/filter
  useEffect(() => {
    if (activeTab !== 'students' || !myCenterId) return;

    const timer = setTimeout(() => {
      fetchStudents();
    }, 400);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentsSearch, studentsGrade]);


  // ============================================================
  // API CALLS
  // ============================================================
  const fetchData = async () => {
    setLoading(true);
    try {
      const schedulesRes = await api.get('/schedules');
      const schedulesList =
        schedulesRes.data.data || schedulesRes.data.schedules || [];
      setSchedules(schedulesList);

      const now = new Date();
      const upcoming = schedulesList.filter(
        (s) => new Date(s.examDate) > now && s.status !== 'cancelled'
      );
      const completed = schedulesList.filter((s) => s.status === 'completed');

      setStats({
        totalSchedules: schedulesList.length,
        upcomingExams: upcoming.length,
        completedExams: completed.length,
        totalStudents: schedulesList.reduce(
          (sum, s) => sum + (parseInt(s.totalStudents) || 0),
          0
        ),
      });
    } catch (err) {
      console.error('Failed to load data:', err);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data.notifications || []);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    }
  };

  // ✅ NEW: Fetch students of own center
  const fetchStudents = async () => {
    if (!myCenterId) {
      setStudents([]);
      return;
    }

    try {
      setStudentsLoading(true);

      const params = { limit: 100 };
      if (studentsSearch.trim()) params.search = studentsSearch.trim();
      if (studentsGrade) params.grade = studentsGrade;

      const { data } = await api.get(
        `/admin/centers/${myCenterId}/students`,
        { params }
      );

      setStudents(data.students || []);
      setStudentStats({
        total: data.total || 0,
        byGrade: (data.students || []).reduce((acc, s) => {
          const grade = s.grade || 'Other';
          acc[grade] = (acc[grade] || 0) + 1;
          return acc;
        }, {}),
      });
    } catch (err) {
      console.error('Failed to load students:', err);
      toast.error('Failed to load students');
      setStudents([]);
    } finally {
      setStudentsLoading(false);
    }
  };


  // ============================================================
  // NOTIFICATION
  // ============================================================
  const handleNotificationSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        ...notificationData,
        targetCenter: myCenterId,
      };

      await api.post('/notifications', payload);
      toast.success('Notification sent successfully!');
      setNotificationData({
        title: '',
        message: '',
        targetRole: 'students',
        targetGrade: '',
        type: 'general',
        priority: 'medium',
      });
      fetchNotifications();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error sending notification');
    }
  };


  // ============================================================
  // SCHEDULE CRUD
  // ============================================================
  const handleScheduleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        ...scheduleData,
        examCenterId: myCenterId,
        totalStudents: parseInt(scheduleData.totalStudents) || 0,
      };

      if (editingSchedule) {
        await api.put(`/schedules/${editingSchedule._id}`, payload);
        toast.success('Schedule updated successfully!');
      } else {
        await api.post('/schedules', payload);
        toast.success('Schedule created successfully!');
      }
      cancelScheduleForm();
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving schedule');
    }
  };

  const deleteSchedule = async (id) => {
    if (!confirm('Are you sure you want to delete this schedule?')) return;
    try {
      await api.delete(`/schedules/${id}`);
      toast.success('Schedule deleted successfully!');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error deleting schedule');
    }
  };

  const editSchedule = (schedule) => {
    setEditingSchedule(schedule);
    setScheduleData({
      examCenterId: myCenterId || '',
      examDate: schedule.examDate
        ? new Date(schedule.examDate).toISOString().split('T')[0]
        : '',
      examTime: schedule.examTime || '',
      subject: schedule.subject || '',
      subjectCode: schedule.subjectCode || '',
      grade: schedule.grade || '',
      totalStudents: schedule.totalStudents || '',
      duration: schedule.duration || 180,
      roomNumber: schedule.roomNumber || '',
      status: schedule.status || 'upcoming',
    });
    setShowScheduleForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelScheduleForm = () => {
    setShowScheduleForm(false);
    setEditingSchedule(null);
    setScheduleData({
      examCenterId: myCenterId || '',
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

  const updateScheduleStatus = async (scheduleId, newStatus) => {
    try {
      await api.patch(`/schedules/${scheduleId}/status`, { status: newStatus });
      toast.success(`Status updated to ${newStatus}`);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    }
  };


  // ============================================================
  // HELPERS
  // ============================================================
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getStatusColor = (status) => statusStyles[status] || statusStyles.upcoming;

  const menuItems = [
    { id: 'schedules', label: 'Schedules', icon: CalendarIcon, hint: 'Manage exams' },
    { id: 'students', label: 'Students', icon: UserGroupIcon, hint: 'View enrolled' },
    { id: 'notifications', label: 'Notifications', icon: BellIcon, hint: 'Send updates' },
  ];

  const filteredSchedules = (schedules || [])
    .filter(
      (s) =>
        s.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.grade?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.status?.toLowerCase().includes(searchTerm.toLowerCase())
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


  // ============================================================
  // SUBCOMPONENTS
  // ============================================================
  const EmptyState = ({ icon: Icon, title, hint }) => (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6">
      <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] mb-4">
        <Icon className="w-8 h-8 text-slate-600" />
      </div>
      <p className="text-sm font-semibold text-slate-300">{title}</p>
      {hint && <p className="text-xs text-slate-500 mt-1.5 max-w-xs">{hint}</p>}
    </div>
  );

  const StatCard = ({ icon: Icon, label, value, color = 'teal' }) => {
    const colorClasses = {
      teal: 'from-teal-500/20 to-emerald-500/10 text-teal-400 ring-teal-500/20',
      sky: 'from-sky-500/20 to-blue-500/10 text-sky-400 ring-sky-500/20',
      emerald:
        'from-emerald-500/20 to-green-500/10 text-emerald-400 ring-emerald-500/20',
      violet:
        'from-violet-500/20 to-purple-500/10 text-violet-400 ring-violet-500/20',
    };

    return (
      <div className={`${ui.panel} p-4 sm:p-5`}>
        <div className="flex items-center gap-3">
          <div
            className={`p-2.5 rounded-xl bg-gradient-to-br ring-1 ${colorClasses[color]}`}
          >
            <Icon className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
              {label}
            </p>
            <p className="text-2xl font-bold text-slate-100 mt-0.5">{value}</p>
          </div>
        </div>
      </div>
    );
  };

  const NavList = ({ onNavigate }) => (
    <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
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
            className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all duration-200 relative text-sm font-medium group ${
              isActive
                ? 'bg-gradient-to-r from-teal-500/15 to-emerald-500/5 text-teal-300 ring-1 ring-teal-500/20'
                : 'text-slate-400 hover:text-slate-100 hover:bg-white/[0.04]'
            }`}
          >
            {isActive && (
              <span className="absolute left-0 top-2 bottom-2 w-1 rounded-full bg-gradient-to-b from-teal-400 to-emerald-400" />
            )}
            <Icon
              className={`w-5 h-5 flex-shrink-0 ${
                isActive ? 'text-teal-300' : 'text-slate-500 group-hover:text-slate-300'
              }`}
            />
            <span className="truncate">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );

  const SortHeader = ({ field, children }) => (
    <th
      className="px-4 py-3 text-left text-xs font-semibold text-slate-500 cursor-pointer hover:text-slate-200 transition uppercase tracking-wide"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center gap-1">
        {children}
        {sortField === field &&
          (sortDirection === 'asc' ? (
            <ChevronUpIcon className="w-3 h-3" />
          ) : (
            <ChevronDownIcon className="w-3 h-3" />
          ))}
      </div>
    </th>
  );


  // ============================================================
  // RENDER
  // ============================================================
  return (
    <div className={`flex h-screen ${ui.page}`}>
      {/* ============ MOBILE DRAWER ============ */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <aside className="absolute left-0 top-0 bottom-0 w-72 max-w-[85vw] bg-[#0D1119] border-r border-white/[0.06] flex flex-col">
            <div className="p-4 border-b border-white/[0.06] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-gradient-to-br from-teal-500/20 to-emerald-500/10 rounded-xl ring-1 ring-teal-500/20">
                  <BuildingOfficeIcon className="w-5 h-5 text-teal-400" />
                </div>
                <span className="text-slate-100 font-bold">Board Official</span>
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
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-500/30 to-emerald-500/20 flex items-center justify-center text-teal-200 font-bold text-sm ring-1 ring-teal-500/20">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-100 truncate">
                    {user?.name}
                  </p>
                  <p className="text-[11px] text-slate-500 truncate">
                    {myCenter?.name || 'Board Official'}
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

      {/* ============ DESKTOP SIDEBAR ============ */}
      <aside className="hidden lg:flex w-64 bg-[#0D1119] border-r border-white/[0.06] flex-col shrink-0">
        <div className="p-5 border-b border-white/[0.06] flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-teal-500/20 to-emerald-500/10 rounded-xl ring-1 ring-teal-500/20">
            <BuildingOfficeIcon className="w-5 h-5 text-teal-400" />
          </div>
          <div className="min-w-0">
            <span className="text-slate-100 font-bold block leading-tight truncate">
              Board Official
            </span>
            <span className="text-[11px] text-slate-500 truncate">
              {myCenter?.centerCode || 'Center Dashboard'}
            </span>
          </div>
        </div>

        <NavList />

        <div className="p-3 m-3 bg-white/[0.03] rounded-xl border border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-500/30 to-emerald-500/20 flex items-center justify-center text-teal-200 font-bold text-sm shrink-0 ring-1 ring-teal-500/20">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-100 truncate">
                {user?.name}
              </p>
              <p className="text-[11px] text-slate-500 truncate">
                {myCenter?.name || 'Board Official'}
              </p>
            </div>
            <button
              onClick={logout}
              title="Logout"
              className="text-slate-500 hover:text-rose-400 p-2 rounded-lg hover:bg-rose-500/10 transition"
            >
              <ArrowRightOnRectangleIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* ============ MAIN ============ */}
      <main className="flex-1 overflow-y-auto min-w-0">
        <header className="bg-[#0A0D14]/80 backdrop-blur-xl border-b border-white/[0.06] sticky top-0 z-30 px-4 sm:px-6 py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={() => setMobileSidebarOpen(true)}
                className={`lg:hidden ${ui.iconBtn}`}
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

            <div className="flex items-center gap-2.5">
              {activeTab === 'schedules' && (
                <div className="relative flex-1 sm:flex-none">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 pr-3 py-2.5 text-sm bg-white/[0.04] border border-white/[0.08] rounded-xl focus:ring-2 focus:ring-teal-400/20 focus:border-teal-400/60 outline-none w-full sm:w-48 text-slate-100 placeholder-slate-500 transition-all"
                  />
                </div>
              )}
              {activeTab === 'schedules' && (
                <button
                  onClick={() => {
                    setShowScheduleForm(true);
                    setEditingSchedule(null);
                  }}
                  className={`${ui.btnPrimary} shrink-0`}
                >
                  <PlusIcon className="w-4 h-4" />
                  <span className="hidden sm:inline">New Schedule</span>
                </button>
              )}
            </div>
          </div>
        </header>

        <div className="p-4 sm:p-6 lg:p-8 w-full max-w-[1600px] mx-auto">
          {/* ========== STATS ========== */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
            <StatCard
              icon={CalendarIcon}
              label="Total Schedules"
              value={stats.totalSchedules}
              color="teal"
            />
            <StatCard
              icon={BellIcon}
              label="Upcoming"
              value={stats.upcomingExams}
              color="sky"
            />
            <StatCard
              icon={CheckCircleIcon}
              label="Completed"
              value={stats.completedExams}
              color="emerald"
            />
            <StatCard
              icon={UserGroupIcon}
              label="Students"
              value={studentStats.total || stats.totalStudents}
              color="violet"
            />
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="flex flex-col items-center gap-3">
                <div className="w-9 h-9 border-[3px] border-teal-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-slate-500 text-sm">Loading data...</p>
              </div>
            </div>
          ) : (
            <>
              {/* ========== SCHEDULES TAB ========== */}
              {activeTab === 'schedules' && (
                <div>
                  {showScheduleForm && (
                    <div className={`mb-6 ${ui.panel} p-5 sm:p-6`}>
                      <div className="flex items-center justify-between mb-5">
                        <h3 className="text-base font-bold text-slate-100 flex items-center gap-3">
                          <span className="p-2 bg-gradient-to-br from-teal-500/20 to-emerald-500/10 text-teal-400 rounded-xl ring-1 ring-teal-500/20">
                            <CalendarIcon className="w-5 h-5" />
                          </span>
                          {editingSchedule ? 'Edit Schedule' : 'New Schedule'}
                        </h3>
                        <button onClick={cancelScheduleForm} className={ui.iconBtn}>
                          <XMarkIcon className="w-5 h-5" />
                        </button>
                      </div>

                      <form
                        onSubmit={handleScheduleSubmit}
                        className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                      >
                        <div className="sm:col-span-2">
                          <label className={ui.label}>Exam Center</label>
                          <div className="px-4 py-3 bg-emerald-500/[0.06] border border-emerald-500/20 rounded-xl flex items-center gap-3">
                            <BuildingOfficeIcon className="w-5 h-5 text-emerald-400 shrink-0" />
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-slate-100 truncate">
                                {myCenter?.name || 'Your Center'}
                              </p>
                              <p className="text-xs text-slate-500 font-mono">
                                {myCenter?.centerCode} · {myCenter?.city}
                              </p>
                            </div>
                          </div>
                          <p className="text-[10px] text-slate-500 mt-1.5">
                            Schedules are automatically created for your assigned center.
                          </p>
                        </div>

                        <div>
                          <label className={ui.label}>Subject</label>
                          <input
                            type="text"
                            placeholder="Mathematics"
                            value={scheduleData.subject}
                            onChange={(e) =>
                              setScheduleData({
                                ...scheduleData,
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
                            value={scheduleData.subjectCode}
                            onChange={(e) =>
                              setScheduleData({
                                ...scheduleData,
                                subjectCode: e.target.value.toUpperCase(),
                              })
                            }
                            className={ui.input}
                          />
                        </div>

                        <div>
                          <label className={ui.label}>Grade / Class</label>
                          <select
                            value={scheduleData.grade}
                            onChange={(e) =>
                              setScheduleData({ ...scheduleData, grade: e.target.value })
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

                        <div>
                          <label className={ui.label}>Exam Date</label>
                          <input
                            type="date"
                            value={scheduleData.examDate}
                            onChange={(e) =>
                              setScheduleData({
                                ...scheduleData,
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
                            value={scheduleData.examTime}
                            onChange={(e) =>
                              setScheduleData({
                                ...scheduleData,
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
                            value={scheduleData.duration}
                            onChange={(e) =>
                              setScheduleData({
                                ...scheduleData,
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
                            value={scheduleData.totalStudents}
                            onChange={(e) =>
                              setScheduleData({
                                ...scheduleData,
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
                            value={scheduleData.roomNumber}
                            onChange={(e) =>
                              setScheduleData({
                                ...scheduleData,
                                roomNumber: e.target.value,
                              })
                            }
                            className={ui.input}
                          />
                        </div>

                        <div>
                          <label className={ui.label}>Status</label>
                          <select
                            value={scheduleData.status}
                            onChange={(e) =>
                              setScheduleData({
                                ...scheduleData,
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
                          <button
                            type="button"
                            onClick={cancelScheduleForm}
                            className={ui.btnGhost}
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {filteredSchedules.length === 0 ? (
                    <div className={`${ui.panel} p-6`}>
                      <EmptyState
                        icon={CalendarIcon}
                        title="No schedules yet"
                        hint="Create your first exam schedule for your center."
                      />
                    </div>
                  ) : (
                    <>
                      <div className={`hidden md:block ${ui.panel} overflow-hidden`}>
                        <table className="w-full text-sm">
                          <thead className="bg-white/[0.03] border-b border-white/[0.06]">
                            <tr>
                              <SortHeader field="subject">Subject</SortHeader>
                              <SortHeader field="grade">Grade</SortHeader>
                              <SortHeader field="examDate">Date</SortHeader>
                              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                                Time
                              </th>
                              <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wide">
                                Students
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                                Status
                              </th>
                              <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wide">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/[0.04]">
                            {filteredSchedules.map((s) => (
                              <tr key={s._id} className="hover:bg-white/[0.02] transition">
                                <td className="px-4 py-4">
                                  <p className="font-semibold text-slate-100">
                                    {s.subject}
                                  </p>
                                  {s.subjectCode && (
                                    <p className="text-xs text-slate-500 font-mono mt-0.5">
                                      {s.subjectCode}
                                    </p>
                                  )}
                                </td>
                                <td className="px-4 py-4">
                                  {s.grade ? (
                                    <span className="px-2.5 py-1 rounded-lg bg-white/[0.04] text-xs font-medium text-slate-300 border border-white/[0.06]">
                                      {s.grade}th
                                    </span>
                                  ) : (
                                    <span className="text-slate-600 text-xs">All</span>
                                  )}
                                </td>
                                <td className="px-4 py-4 text-slate-400">
                                  {new Date(s.examDate).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                  })}
                                </td>
                                <td className="px-4 py-4 text-slate-400 font-mono text-xs">
                                  {s.examTime}
                                </td>
                                <td className="px-4 py-4 text-center">
                                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-violet-500/10 text-violet-300 ring-1 ring-violet-500/20">
                                    {s.totalStudents || 0}
                                  </span>
                                </td>
                                <td className="px-4 py-4">
                                  <select
                                    value={s.status || 'upcoming'}
                                    onChange={(e) =>
                                      updateScheduleStatus(s._id, e.target.value)
                                    }
                                    className={`px-2.5 py-1 rounded-lg text-xs font-bold capitalize outline-none cursor-pointer border-0 ${getStatusColor(
                                      s.status
                                    )}`}
                                  >
                                    <option value="upcoming" className="bg-[#12151F] text-slate-100">
                                      Upcoming
                                    </option>
                                    <option value="ongoing" className="bg-[#12151F] text-slate-100">
                                      Ongoing
                                    </option>
                                    <option value="completed" className="bg-[#12151F] text-slate-100">
                                      Completed
                                    </option>
                                    <option value="cancelled" className="bg-[#12151F] text-slate-100">
                                      Cancelled
                                    </option>
                                    <option value="postponed" className="bg-[#12151F] text-slate-100">
                                      Postponed
                                    </option>
                                  </select>
                                </td>
                                <td className="px-4 py-4">
                                  <div className="flex items-center justify-center gap-1">
                                    <button
                                      onClick={() => editSchedule(s)}
                                      className={ui.iconBtn}
                                      title="Edit"
                                    >
                                      <PencilIcon className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() => deleteSchedule(s._id)}
                                      className="p-2 rounded-xl text-rose-400 hover:bg-rose-500/10 transition-all"
                                      title="Delete"
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
                                <p className="font-bold text-slate-100">{s.subject}</p>
                                {s.grade && (
                                  <p className="text-xs text-slate-500 mt-0.5">
                                    Grade {s.grade}th
                                  </p>
                                )}
                              </div>
                              <span
                                className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-bold capitalize ${getStatusColor(
                                  s.status
                                )}`}
                              >
                                {s.status || 'upcoming'}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 mt-3 pt-3 border-t border-white/[0.06] text-xs text-slate-400">
                              <span>
                                {new Date(s.examDate).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                })}{' '}
                                · {s.examTime}
                              </span>
                              <span className="inline-flex items-center gap-1 text-violet-300">
                                <UserGroupIcon className="w-3.5 h-3.5" />
                                {s.totalStudents || 0}
                              </span>
                            </div>
                            <div className="flex items-center justify-end gap-1 mt-3">
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
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* ========== STUDENTS TAB ========== */}
              {activeTab === 'students' && (
                <div className="space-y-5">
                  <div className={`${ui.panel} p-5`}>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
                      <div className="flex items-center gap-3">
                        <span className="p-2 bg-gradient-to-br from-violet-500/20 to-purple-500/10 text-violet-400 rounded-xl ring-1 ring-violet-500/20">
                          <UserGroupIcon className="w-5 h-5" />
                        </span>
                        <div>
                          <h3 className="text-base font-bold text-slate-100">
                            Center Students
                          </h3>
                          <p className="text-xs text-slate-500">
                            {myCenter?.name || 'Your center'}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={fetchStudents}
                        disabled={studentsLoading}
                        className={ui.btnGhost}
                      >
                        <ArrowPathIcon
                          className={`w-3.5 h-3.5 ${
                            studentsLoading ? 'animate-spin' : ''
                          }`}
                        />
                        Refresh
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="relative">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                          type="text"
                          placeholder="Search by name, email, roll number..."
                          value={studentsSearch}
                          onChange={(e) => setStudentsSearch(e.target.value)}
                          className="w-full pl-9 pr-4 py-2.5 bg-[#0B0E14] border border-white/[0.08] rounded-xl text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-violet-400/60 focus:ring-2 focus:ring-violet-400/20 transition-all"
                        />
                      </div>

                      <select
                        value={studentsGrade}
                        onChange={(e) => setStudentsGrade(e.target.value)}
                        className="w-full px-4 py-2.5 bg-[#0B0E14] border border-white/[0.08] rounded-xl text-sm text-slate-100 outline-none focus:border-violet-400/60 focus:ring-2 focus:ring-violet-400/20 transition-all"
                      >
                        <option value="">All Grades</option>
                        <option value="9">9th Class</option>
                        <option value="10">10th Class</option>
                        <option value="11">11th Class</option>
                        <option value="12">12th Class</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>

                  {studentsLoading ? (
                    <div className={`${ui.panel} p-12 flex items-center justify-center`}>
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-8 h-8 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" />
                        <p className="text-sm text-slate-500">Loading students...</p>
                      </div>
                    </div>
                  ) : students.length === 0 ? (
                    <div className={`${ui.panel} p-12`}>
                      <EmptyState
                        icon={UserGroupIcon}
                        title="No students found"
                        hint={
                          studentsSearch || studentsGrade
                            ? 'Try adjusting your search or filters'
                            : 'Students will appear here once they register or are added by admin'
                        }
                      />
                    </div>
                  ) : (
                    <>
                      <div className={`hidden md:block ${ui.panel} overflow-hidden`}>
                        <table className="w-full text-sm">
                          <thead className="bg-white/[0.03] border-b border-white/[0.06]">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                                Roll #
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                                Name
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                                Email
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                                Grade
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                                Board
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/[0.04]">
                            {students.map((student) => (
                              <tr
                                key={student._id}
                                className="hover:bg-white/[0.02] transition"
                              >
                                <td className="px-4 py-4 font-mono text-xs text-teal-300">
                                  {student.rollNumber || '—'}
                                </td>
                                <td className="px-4 py-4">
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500/30 to-purple-500/20 flex items-center justify-center text-violet-200 font-bold text-xs ring-1 ring-violet-500/20">
                                      {student.name?.charAt(0)?.toUpperCase() || 'S'}
                                    </div>
                                    <span className="font-semibold text-slate-100">
                                      {student.name}
                                    </span>
                                  </div>
                                </td>
                                <td className="px-4 py-4 text-slate-400 text-xs">
                                  {student.email}
                                </td>
                                <td className="px-4 py-4">
                                  {student.grade ? (
                                    <span className="px-2.5 py-1 rounded-lg bg-white/[0.04] text-xs font-medium text-slate-300 border border-white/[0.06]">
                                      {student.grade}th
                                    </span>
                                  ) : (
                                    <span className="text-slate-600">—</span>
                                  )}
                                </td>
                                <td className="px-4 py-4 text-xs text-slate-500">
                                  {student.board || '—'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <div className="md:hidden space-y-3">
                        {students.map((student) => (
                          <div key={student._id} className={`${ui.panel} p-4`}>
                            <div className="flex items-start gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500/30 to-purple-500/20 flex items-center justify-center text-violet-200 font-bold text-sm ring-1 ring-violet-500/20 shrink-0">
                                {student.name?.charAt(0)?.toUpperCase() || 'S'}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="font-semibold text-slate-100 truncate">
                                  {student.name}
                                </p>
                                <p className="text-xs text-slate-500 truncate">
                                  {student.email}
                                </p>
                                <div className="flex items-center gap-2 mt-2 flex-wrap">
                                  {student.rollNumber && (
                                    <span className="text-xs text-teal-300 font-mono">
                                      #{student.rollNumber}
                                    </span>
                                  )}
                                  {student.grade && (
                                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-violet-500/10 text-violet-300">
                                      {student.grade}th
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="text-center text-xs text-slate-500 pt-2">
                        Showing {students.length} of {studentStats.total} students
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* ========== NOTIFICATIONS TAB ========== */}
              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <div className={`${ui.panel} p-5 sm:p-6`}>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2.5 bg-gradient-to-br from-amber-500/20 to-orange-500/10 rounded-xl ring-1 ring-amber-500/20">
                        <BellIcon className="w-5 h-5 text-amber-400" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-slate-100">
                          Send Notification
                        </h3>
                        <p className="text-xs text-slate-500">
                          Only students of your center will receive this
                        </p>
                      </div>
                    </div>

                    <form
                      onSubmit={handleNotificationSubmit}
                      className="space-y-5"
                    >
                      <div>
                        <label className={ui.label}>Title</label>
                        <input
                          type="text"
                          placeholder="Exam schedule update"
                          value={notificationData.title}
                          onChange={(e) =>
                            setNotificationData({
                              ...notificationData,
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
                          placeholder="Write your message..."
                          rows="5"
                          value={notificationData.message}
                          onChange={(e) =>
                            setNotificationData({
                              ...notificationData,
                              message: e.target.value,
                            })
                          }
                          className={`${ui.input} resize-none`}
                          required
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className={ui.label}>Target Grade</label>
                          <select
                            value={notificationData.targetGrade}
                            onChange={(e) =>
                              setNotificationData({
                                ...notificationData,
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
                            value={notificationData.priority}
                            onChange={(e) =>
                              setNotificationData({
                                ...notificationData,
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
                        Send to My Center Students
                      </button>
                    </form>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">
                      Recent Notifications
                    </h4>
                    <div className="space-y-3">
                      {notifications.length === 0 ? (
                        <div className={`${ui.panel} p-6`}>
                          <EmptyState
                            icon={BellIcon}
                            title="No notifications yet"
                            hint="Sent notifications will appear here."
                          />
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <div key={n._id} className={`${ui.panel} p-4`}>
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <p className="font-semibold text-slate-100 text-sm">
                                  {n.title}
                                </p>
                                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                                  {n.message}
                                </p>
                                {n.targetGrade && (
                                  <span className="inline-block mt-2 px-2 py-0.5 text-[10px] font-bold rounded-md bg-amber-500/10 text-amber-300">
                                    Grade {n.targetGrade}th
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] text-slate-600 shrink-0 font-mono">
                                {new Date(n.createdAt).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                })}
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