// components/SuperAdminDashboard.jsx - ✅ 100% MOBILE RESPONSIVE + FULL CRUD
import React, { useState, useEffect } from 'react';
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
  EnvelopeIcon,
  CheckCircleIcon,
  HomeIcon,
  BellIcon,
  Bars3Icon,
  PencilIcon,
  MagnifyingGlassIcon,
  SparklesIcon,
  PaperAirplaneIcon,
  Cog6ToothIcon,
  ShieldCheckIcon,
  ClipboardDocumentListIcon
} from '@heroicons/react/24/outline';

const SuperAdminDashboard = () => {
  const { user, logout, getAllUsers } = useAuth();
  
  // ✅ States
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState([]);
  const [centers, setCenters] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true); // Desktop ke liye
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false); // Mobile ke liye
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
    upcomingSchedules: 0
  });

  // ✅ Fetch Data
  useEffect(() => {
    if (!user || user.role !== 'admin') {
      window.location.href = '/login';
      return;
    }
    fetchAllData();
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
        activeUsers: usersData?.filter(u => u.isActive).length || 0,
        totalNotifications: notificationsRes.data.notifications?.length || 0,
        upcomingSchedules: (schedulesRes.data.schedules || []).filter(s => s.status === 'upcoming').length
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
      centerCode: center.centerCode, name: center.name, address: center.address,
      latitude: center.latitude, longitude: center.longitude, city: center.city, capacity: center.capacity
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
      examCenterId: s.examCenterId?._id || '', examDate: s.examDate ? new Date(s.examDate).toISOString().split('T')[0] : '',
      examTime: s.examTime, subject: s.subject, totalStudents: s.totalStudents, status: s.status
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
        priority: notificationFormData.priority || 'medium'
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
    .filter(u => u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || u.email?.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      let aVal = a[sortField] || '', bVal = b[sortField] || '';
      if (typeof aVal === 'string') aVal = aVal.toLowerCase();
      if (typeof bVal === 'string') bVal = bVal.toLowerCase();
      return sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    });

  const filteredCenters = (centers || [])
    .filter(c => c.centerCode?.toLowerCase().includes(searchTerm.toLowerCase()) || c.name?.toLowerCase().includes(searchTerm.toLowerCase()) || c.city?.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => a.centerCode.localeCompare(b.centerCode));

  const filteredSchedules = (schedules || [])
    .filter(s => s.subject?.toLowerCase().includes(searchTerm.toLowerCase()) || s.examCenterId?.name?.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => new Date(a.examDate) - new Date(b.examDate));

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

  // ✅ Render Overview
  const renderOverview = () => (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Users', value: stats.totalUsers, icon: UserGroupIcon, color: 'blue' },
          { label: 'Active Users', value: stats.activeUsers, icon: CheckCircleIcon, color: 'green' },
          { label: 'Exam Centers', value: stats.totalCenters, icon: BuildingOfficeIcon, color: 'purple' },
          { label: 'Schedules', value: stats.totalSchedules, icon: CalendarIcon, color: 'orange' },
        ].map((stat, i) => (
          <div key={i} className="bg-white/5 p-6 rounded-xl border border-white/10 hover:border-white/20 transition">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-white">{stat.value}</div>
                <div className="text-gray-400 text-sm">{stat.label}</div>
              </div>
              <stat.icon className="w-10 h-10 text-white/30" />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/5 rounded-xl p-6 border border-white/10">
          <h3 className="text-white font-semibold mb-4">Revenue Growth</h3>
          <div className="h-48 flex items-end gap-2">
            {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((month, i) => (
              <div key={i} className="flex-1 flex flex-col items-center">
                <div className="w-full bg-blue-500/30 rounded-t hover:bg-blue-500/50 transition" style={{ height: `${20 + Math.random() * 60}%` }}></div>
                <span className="text-xs text-gray-400 mt-1">{month}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white/5 rounded-xl p-6 border border-white/10">
          <h3 className="text-white font-semibold mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {notifications.slice(0, 5).map((n) => (
              <div key={n._id} className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
                <BellIcon className="w-5 h-5 text-blue-400 flex-shrink-0" />
                <div>
                  <p className="text-white text-sm font-medium">{n.title}</p>
                  <p className="text-gray-400 text-xs">{new Date(n.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
            {notifications.length === 0 && <p className="text-gray-400 text-sm">No recent activity</p>}
          </div>
        </div>
      </div>
    </div>
  );

  const renderUsers = () => (
    <div>
      <div className="mb-6 flex flex-wrap justify-between items-center gap-2">
        <h3 className="text-lg font-semibold text-white">All Users</h3>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Search users..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9 pr-4 py-2 text-sm bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none w-full sm:w-48 text-white placeholder-gray-400" />
          </div>
          <button onClick={() => { setShowUserForm(true); setEditingUser(null); }} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg transition text-sm font-medium">
            <PlusIcon className="w-4 h-4" /> Create User
          </button>
        </div>
      </div>

      {showUserForm && (
        <div className="mb-6 bg-white/5 rounded-xl p-6 border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">{editingUser ? 'Edit User' : 'Create New User'}</h3>
            <button onClick={() => { setShowUserForm(false); setEditingUser(null); }} className="p-1.5 hover:bg-white/10 rounded-lg transition"><XMarkIcon className="w-5 h-5 text-gray-400" /></button>
          </div>
          <form onSubmit={handleUserSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" placeholder="Full Name *" value={userFormData.name} onChange={(e) => setUserFormData({ ...userFormData, name: e.target.value })} className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-white placeholder-gray-400" required />
            <input type="email" placeholder="Email *" value={userFormData.email} onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })} className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-white placeholder-gray-400" required />
            {!editingUser && <input type="password" placeholder="Password *" value={userFormData.password} onChange={(e) => setUserFormData({ ...userFormData, password: e.target.value })} className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-white placeholder-gray-400" required minLength="6" />}
            <select value={userFormData.role} onChange={(e) => setUserFormData({ ...userFormData, role: e.target.value })} className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-white">
              <option value="board_official" className="bg-gray-800">Board Official</option>
              <option value="admin" className="bg-gray-800">Admin</option>
            </select>
            <div className="md:col-span-2 flex gap-3">
              <button type="submit" className="flex-1 px-6 py-2.5 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg transition font-medium">{editingUser ? 'Update User' : 'Create & Send Credentials'}</button>
              <button type="button" onClick={() => { setShowUserForm(false); setEditingUser(null); }} className="px-6 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-lg transition font-medium">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-white/5">
            <tr>
              {['name', 'email', 'role', 'status', 'actions'].map((col) => (
                <th key={col} className={`px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white transition ${col === 'actions' ? 'text-center' : ''}`} onClick={() => col !== 'actions' && handleSort(col)}>
                  <div className="flex items-center gap-1">
                    {col === 'actions' ? 'Actions' : col.charAt(0).toUpperCase() + col.slice(1)}
                    {col !== 'actions' && sortField === col && (sortDirection === 'asc' ? '↑' : '↓')}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredUsers.map((u) => (
              <tr key={u._id} className="hover:bg-white/5 transition">
                <td className="px-4 py-3 font-medium text-white">{u.name}</td>
                <td className="px-4 py-3 text-gray-300">{u.email}</td>
                <td className="px-4 py-3"><span className={`px-2.5 py-1 rounded-full text-xs font-medium ${u.role === 'admin' ? 'bg-red-500/20 text-red-400' : u.role === 'board_official' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'}`}>{u.role?.replace('_', ' ')}</span></td>
                <td className="px-4 py-3"><span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${u.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>{u.isActive ? 'Active' : 'Inactive'}</span></td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap justify-center gap-2">
                    <button onClick={() => editUser(u)} className="p-1.5 text-blue-400 hover:bg-blue-500/10 rounded-lg transition"><PencilIcon className="w-4 h-4" /></button>
                    <button onClick={() => toggleUserStatus(u._id, u.isActive)} className={`px-3 py-1 rounded-lg text-xs font-medium transition ${u.isActive ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`} disabled={u._id === user?._id}>{u.isActive ? 'Deactivate' : 'Activate'}</button>
                    <button onClick={() => deleteUser(u._id)} className="px-3 py-1 rounded-lg text-xs font-medium bg-red-500/20 text-red-400" disabled={u._id === user?._id}><TrashIcon className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderCenters = () => (
    <div>
      <div className="mb-6 flex flex-wrap justify-between items-center gap-2">
        <h3 className="text-lg font-semibold text-white">All Centers</h3>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Search centers..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9 pr-4 py-2 text-sm bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none w-full sm:w-48 text-white placeholder-gray-400" />
          </div>
          <button onClick={() => { setShowCenterForm(true); setEditingCenter(null); }} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg transition text-sm font-medium"><PlusIcon className="w-4 h-4" /> Create Center</button>
        </div>
      </div>

      {showCenterForm && (
        <div className="mb-6 bg-white/5 rounded-xl p-6 border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">{editingCenter ? 'Edit Center' : 'Create New Center'}</h3>
            <button onClick={() => { setShowCenterForm(false); setEditingCenter(null); }} className="p-1.5 hover:bg-white/10 rounded-lg transition"><XMarkIcon className="w-5 h-5 text-gray-400" /></button>
          </div>
          <form onSubmit={handleCenterSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" placeholder="Center Code *" value={centerFormData.centerCode} onChange={(e) => setCenterFormData({ ...centerFormData, centerCode: e.target.value })} className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-white placeholder-gray-400" required />
            <input type="text" placeholder="Center Name *" value={centerFormData.name} onChange={(e) => setCenterFormData({ ...centerFormData, name: e.target.value })} className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-white placeholder-gray-400" required />
            <input type="text" placeholder="Address *" value={centerFormData.address} onChange={(e) => setCenterFormData({ ...centerFormData, address: e.target.value })} className="md:col-span-2 px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-white placeholder-gray-400" required />
            <input type="number" placeholder="Latitude" value={centerFormData.latitude} onChange={(e) => setCenterFormData({ ...centerFormData, latitude: e.target.value })} className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-white placeholder-gray-400" />
            <input type="number" placeholder="Longitude" value={centerFormData.longitude} onChange={(e) => setCenterFormData({ ...centerFormData, longitude: e.target.value })} className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-white placeholder-gray-400" />
            <input type="text" placeholder="City *" value={centerFormData.city} onChange={(e) => setCenterFormData({ ...centerFormData, city: e.target.value })} className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-white placeholder-gray-400" required />
            <input type="number" placeholder="Capacity" value={centerFormData.capacity} onChange={(e) => setCenterFormData({ ...centerFormData, capacity: e.target.value })} className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-white placeholder-gray-400" />
            <div className="md:col-span-2 flex gap-3">
              <button type="submit" className="flex-1 px-6 py-2.5 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg transition font-medium">{editingCenter ? 'Update Center' : 'Create Center'}</button>
              <button type="button" onClick={() => { setShowCenterForm(false); setEditingCenter(null); }} className="px-6 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-lg transition font-medium">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-white/5">
            <tr>
              {['centerCode', 'name', 'city', 'address', 'actions'].map((col) => (
                <th key={col} className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">{col === 'actions' ? 'Actions' : col.replace(/([A-Z])/g, ' $1').trim()}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredCenters.map((center) => (
              <tr key={center._id} className="hover:bg-white/5 transition">
                <td className="px-4 py-3 font-mono text-xs font-medium text-white">{center.centerCode}</td>
                <td className="px-4 py-3 text-white">{center.name}</td>
                <td className="px-4 py-3 text-gray-300">{center.city}</td>
                <td className="px-4 py-3 text-gray-400 text-xs max-w-[200px] truncate">{center.address}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-center gap-2">
                    <button onClick={() => editCenter(center)} className="p-1.5 text-blue-400 hover:bg-blue-500/10 rounded-lg transition"><PencilIcon className="w-4 h-4" /></button>
                    <button onClick={() => deleteCenter(center._id)} className="p-1.5 text-red-400 hover:bg-red-500/10 rounded-lg transition"><TrashIcon className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderSchedules = () => (
    <div>
      <div className="mb-6 flex flex-wrap justify-between items-center gap-2">
        <h3 className="text-lg font-semibold text-white">All Schedules</h3>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Search schedules..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9 pr-4 py-2 text-sm bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none w-full sm:w-48 text-white placeholder-gray-400" />
          </div>
          <button onClick={() => { setShowScheduleForm(true); setEditingSchedule(null); }} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg transition text-sm font-medium"><PlusIcon className="w-4 h-4" /> Create Schedule</button>
        </div>
      </div>

      {showScheduleForm && (
        <div className="mb-6 bg-white/5 rounded-xl p-6 border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">{editingSchedule ? 'Edit Schedule' : 'Create New Schedule'}</h3>
            <button onClick={() => { setShowScheduleForm(false); setEditingSchedule(null); }} className="p-1.5 hover:bg-white/10 rounded-lg transition"><XMarkIcon className="w-5 h-5 text-gray-400" /></button>
          </div>
          <form onSubmit={handleScheduleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select value={scheduleFormData.examCenterId} onChange={(e) => setScheduleFormData({ ...scheduleFormData, examCenterId: e.target.value })} className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-white" required>
              <option value="">Select Center *</option>
              {centers.map((c) => <option key={c._id} value={c._id} className="bg-gray-800">{c.centerCode} - {c.name}</option>)}
            </select>
            <input type="date" value={scheduleFormData.examDate} onChange={(e) => setScheduleFormData({ ...scheduleFormData, examDate: e.target.value })} className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-white" required />
            <input type="time" value={scheduleFormData.examTime} onChange={(e) => setScheduleFormData({ ...scheduleFormData, examTime: e.target.value })} className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-white" required />
            <input type="text" placeholder="Subject *" value={scheduleFormData.subject} onChange={(e) => setScheduleFormData({ ...scheduleFormData, subject: e.target.value })} className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-white placeholder-gray-400" required />
            <input type="number" placeholder="Total Students" value={scheduleFormData.totalStudents} onChange={(e) => setScheduleFormData({ ...scheduleFormData, totalStudents: e.target.value })} className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-white placeholder-gray-400" />
            <select value={scheduleFormData.status} onChange={(e) => setScheduleFormData({ ...scheduleFormData, status: e.target.value })} className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-white">
              <option value="upcoming" className="bg-gray-800">Upcoming</option>
              <option value="ongoing" className="bg-gray-800">Ongoing</option>
              <option value="completed" className="bg-gray-800">Completed</option>
              <option value="cancelled" className="bg-gray-800">Cancelled</option>
              <option value="postponed" className="bg-gray-800">Postponed</option>
            </select>
            <div className="md:col-span-2 flex gap-3">
              <button type="submit" className="flex-1 px-6 py-2.5 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg transition font-medium">{editingSchedule ? 'Update Schedule' : 'Create Schedule'}</button>
              <button type="button" onClick={() => { setShowScheduleForm(false); setEditingSchedule(null); }} className="px-6 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-lg transition font-medium">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-white/5">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Center</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Subject</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Date</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Time</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredSchedules.map((s) => (
              <tr key={s._id} className="hover:bg-white/5 transition">
                <td className="px-4 py-3"><div className="flex flex-col"><span className="font-medium text-white text-xs">{s.examCenterId?.centerCode}</span><span className="text-xs text-gray-400">{s.examCenterId?.name}</span></div></td>
                <td className="px-4 py-3 font-medium text-white">{s.subject}</td>
                <td className="px-4 py-3 text-gray-300">{new Date(s.examDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                <td className="px-4 py-3 text-gray-300">{s.examTime}</td>
                <td className="px-4 py-3"><span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(s.status)}`}>{s.status || 'upcoming'}</span></td>
                <td className="px-4 py-3">
                  <div className="flex justify-center gap-2">
                    <button onClick={() => editSchedule(s)} className="p-1.5 text-blue-400 hover:bg-blue-500/10 rounded-lg transition"><PencilIcon className="w-4 h-4" /></button>
                    <button onClick={() => deleteSchedule(s._id)} className="p-1.5 text-red-400 hover:bg-red-500/10 rounded-lg transition"><TrashIcon className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderNotifications = () => (
    <div>
      <div className="mb-6 flex flex-wrap justify-between items-center gap-2">
        <h3 className="text-lg font-semibold text-white">All Notifications</h3>
        <button onClick={() => setShowNotificationForm(true)} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg transition text-sm font-medium"><PlusIcon className="w-4 h-4" /> Send Notification</button>
      </div>

      {showNotificationForm && (
        <div className="mb-6 bg-white/5 rounded-xl p-6 border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Send Notification</h3>
            <button onClick={() => setShowNotificationForm(false)} className="p-1.5 hover:bg-white/10 rounded-lg transition"><XMarkIcon className="w-5 h-5 text-gray-400" /></button>
          </div>
          <form onSubmit={handleNotificationSubmit} className="space-y-4">
            <input type="text" placeholder="Notification Title *" value={notificationFormData.title} onChange={(e) => setNotificationFormData({ ...notificationFormData, title: e.target.value })} className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-white placeholder-gray-400" required />
            <textarea placeholder="Write your notification message..." rows="4" value={notificationFormData.message} onChange={(e) => setNotificationFormData({ ...notificationFormData, message: e.target.value })} className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-white placeholder-gray-400 resize-none" required />
            <select value={notificationFormData.targetRole} onChange={(e) => setNotificationFormData({ ...notificationFormData, targetRole: e.target.value })} className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-white">
              <option value="all" className="bg-gray-800">All Users</option>
              <option value="students" className="bg-gray-800">Students Only</option>
              <option value="board_official" className="bg-gray-800">Board Officials Only</option>
              <option value="admin" className="bg-gray-800">Admins Only</option>
            </select>
            <button type="submit" className="w-full px-6 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg transition font-medium flex items-center justify-center gap-2"><PaperAirplaneIcon className="w-4 h-4" /> Send Notification</button>
          </form>
        </div>
      )}

      <div className="space-y-3">
        {notifications.length === 0 ? <div className="bg-white/5 rounded-lg p-4 border border-white/5 text-center text-gray-400"><BellIcon className="w-8 h-8 mx-auto mb-2 opacity-50" /><p>No notifications sent yet.</p></div> : notifications.map((notification) => (
          <div key={notification._id} className="bg-white/5 rounded-lg p-4 border border-white/5 hover:border-white/10 transition">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium text-white text-sm">{notification.title}</p>
                <p className="text-sm text-gray-400 mt-1">{notification.message}</p>
                <p className="text-xs text-gray-500 mt-2">To: {notification.targetRole} • {new Date(notification.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
              </div>
              <button onClick={() => deleteNotification(notification._id)} className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition"><TrashIcon className="w-4 h-4" /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-900">
      {/* ✅ MOBILE SIDEBAR (Off-canvas - Screen se bahar) */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileSidebarOpen(false)}></div>
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-gray-800 border-r border-white/10 flex flex-col animate-slide-in">
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-gradient-to-r from-red-500 to-purple-600 rounded-xl"><UserGroupIcon className="w-5 h-5 text-white" /></div>
                <span className="text-white font-bold text-lg">Super Admin</span>
              </div>
              <button onClick={() => setMobileSidebarOpen(false)} className="text-gray-400 hover:text-white transition"><XMarkIcon className="w-5 h-5" /></button>
            </div>
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button key={item.id} onClick={() => { setActiveTab(item.id); setMobileSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${activeTab === item.id ? 'bg-gradient-to-r from-red-500/20 to-purple-500/20 text-red-400' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </button>
                );
              })}
            </nav>
            <div className="p-4 border-t border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-red-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">{user?.name?.charAt(0)?.toUpperCase() || 'U'}</div>
                <div className="flex-1 min-w-0"><p className="text-sm font-medium text-white truncate">{user?.name}</p><p className="text-xs text-gray-400 capitalize truncate">{user?.role}</p></div>
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
            <div className="p-2 bg-gradient-to-r from-red-500 to-purple-600 rounded-xl shadow-lg shadow-red-500/25"><UserGroupIcon className="w-5 h-5 text-white" /></div>
            {sidebarOpen && <span className="text-white font-bold text-lg">Super Admin</span>}
          </div>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-400 hover:text-white transition"><Bars3Icon className="w-5 h-5" /></button>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button key={item.id} onClick={() => setActiveTab(item.id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${activeTab === item.id ? 'bg-gradient-to-r from-red-500/20 to-purple-500/20 text-red-400' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
                <Icon className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-red-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">{user?.name?.charAt(0)?.toUpperCase() || 'U'}</div>
            {sidebarOpen && <div className="flex-1 min-w-0"><p className="text-sm font-medium text-white truncate">{user?.name}</p><p className="text-xs text-gray-400 capitalize truncate">{user?.role}</p></div>}
            <button onClick={logout} className="text-red-400 hover:text-red-300 p-2 rounded-lg transition"><ArrowRightOnRectangleIcon className="w-5 h-5" /></button>
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
                <h1 className="text-xl font-bold text-white">{menuItems.find(item => item.id === activeTab)?.label || 'Dashboard'}</h1>
                <p className="text-sm text-gray-400">Welcome back, {user?.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="text-gray-400 hover:text-white transition p-2 hover:bg-white/5 rounded-lg"><BellIcon className="w-5 h-5" /></button>
              <div className="hidden md:flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-red-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">{user?.name?.charAt(0)?.toUpperCase() || 'U'}</div>
                <div><p className="text-sm font-medium text-white">{user?.name}</p><p className="text-xs text-gray-400 capitalize">{user?.role}</p></div>
              </div>
            </div>
          </div>
        </header>

        <div className="p-4 sm:p-6">
          {loading ? (
            <div className="flex items-center justify-center py-16"><div className="w-10 h-10 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div></div>
          ) : (
            <>
              {activeTab === 'overview' && renderOverview()}
              {activeTab === 'users' && renderUsers()}
              {activeTab === 'centers' && renderCenters()}
              {activeTab === 'schedules' && renderSchedules()}
              {activeTab === 'notifications' && renderNotifications()}
              {activeTab === 'reports' && <div className="text-center text-gray-400 py-16">Reports module coming soon...</div>}
              {activeTab === 'settings' && <div className="text-center text-gray-400 py-16">Settings coming soon...</div>}
              {activeTab === 'audit' && <div className="text-center text-gray-400 py-16">Audit Logs coming soon...</div>}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default SuperAdminDashboard;