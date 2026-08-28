// src/context/AuthContext.jsx - ✅ 100% FINAL FIXED (Refresh-Proof)
import { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';

// ==================== CREATE CONTEXT ====================
const AuthContext = createContext();

// ==================== AUTH PROVIDER ====================
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ==================== INITIALIZE (✅ FIXED) ====================
  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    // ✅ Agar saved user hai, toh pehle use set karo (fast load ke liye)
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }

    // ✅ Agar token hai, toh server se verify karo
    if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  // ==================== FETCH USER (✅ FIXED) ====================
  const fetchUser = async () => {
    try {
      const { data } = await api.get('/auth/me');
      setUser(data.user);
      localStorage.setItem('user', JSON.stringify(data.user)); // ✅ Save user in localStorage
    } catch (err) {
      console.error('❌ Fetch user error:', err);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // ==================== REGISTER ====================
  const register = async (formData) => {
    setError(null);
    try {
      const { data } = await api.post('/auth/register', formData);
      
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user)); // ✅ Save user in localStorage
      setUser(data.user);
      toast.success('Registration successful! Welcome to AI-ECLT! 🎉');
      
      return { success: true, user: data.user, token: data.token };
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Registration failed';
      setError(errorMsg);
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  // ==================== LOGIN (✅ FIXED) ====================
  const login = async (formData) => {
    setError(null);
    try {
      const { data } = await api.post('/auth/login', formData);
      
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user)); // ✅ Save user in localStorage
      setUser(data.user);
      toast.success(`Welcome back, ${data.user.name}! 👋`);
      
      // ✅ IMPORTANT: User aur Token return karein
      return { 
        success: true, 
        user: data.user, 
        token: data.token 
      };
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Login failed';
      setError(errorMsg);
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  // ==================== LOGOUT (✅ FIXED) ====================
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    toast.success('Logged out successfully');
    
    // ✅ Page refresh karein taake private routes protect ho jayein
    setTimeout(() => {
      window.location.href = '/';
    }, 500);
  };

  // ==================== UPDATE USER ====================
  const updateUser = async (formData) => {
    try {
      const { data } = await api.put('/auth/update-profile', formData);
      setUser(data.user);
      localStorage.setItem('user', JSON.stringify(data.user)); // ✅ Save updated user
      toast.success('Profile updated successfully!');
      return { success: true };
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Update failed';
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  // ==================== CHANGE PASSWORD ====================
  const changePassword = async (formData) => {
    try {
      await api.put('/auth/change-password', formData);
      toast.success('Password changed successfully!');
      return { success: true };
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Password change failed';
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  // ==================== SUPER ADMIN - CREATE BOARD OFFICIAL ====================
  const createBoardOfficial = async (formData) => {
    setError(null);
    try {
      const { data } = await api.post('/admin/board-official', formData);
      toast.success('Board Official created successfully! Credentials sent via email.');
      return { success: true, data };
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to create board official';
      setError(errorMsg);
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  // ==================== SUPER ADMIN - CREATE ADMIN ====================
  const createAdmin = async (formData) => {
    setError(null);
    try {
      const { data } = await api.post('/admin/create-admin', formData);
      toast.success('Admin created successfully! Credentials sent via email.');
      return { success: true, data };
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to create admin';
      setError(errorMsg);
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  // ==================== SUPER ADMIN - GET ALL USERS ====================
  const getAllUsers = async () => {
    try {
      const { data } = await api.get('/admin/users');
      return data.users || [];
    } catch (err) {
      console.error('❌ Error fetching users:', err);
      toast.error('Failed to fetch users');
      return [];
    }
  };

  // ==================== CONTEXT VALUE ====================
  const value = {
    user,
    loading,
    error,
    register,
    login,
    logout,
    updateUser,
    changePassword,
    createBoardOfficial,
    createAdmin,
    getAllUsers,
    isSuperAdmin: user?.role === 'admin',
    isBoardOfficial: user?.role === 'board_official',
    isStudent: user?.role === 'student',
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// ==================== USE AUTH HOOK ====================
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;