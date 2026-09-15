import { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

const buildUserForStorage = (user) => {
  if (!user) return null;

  return {
    _id: user._id || user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    country: user.country,
    phone: user.phone,
    city: user.city,
    isActive: user.isActive,
    isEmailVerified: user.isEmailVerified,
    isApproved: user.isApproved,
    profileImage: user.profileImage,
    preferences: user.preferences,
    examCenter: user.examCenter,        
    rollNumber: user.rollNumber,
    registrationNumber: user.registrationNumber,
    grade: user.grade,
    board: user.board,
    dateOfBirth: user.dateOfBirth,
    registeredSchedules: user.registeredSchedules,
    assignedCenter: user.assignedCenter, 
    lastLogin: user.lastLogin,
    createdAt: user.createdAt,
  };
};


export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loginLoading, setLoginLoading] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (err) {
        console.error('Failed to parse saved user:', err);
        localStorage.removeItem('user');
      }
    }

    if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async () => {
    try {
      const { data } = await api.get('/auth/me');
      const userData = data.user;
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
    } catch (err) {
      console.error('Fetch user error:', err);

      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  };


  const register = async (formData) => {
    setError(null);
    setRegisterLoading(true);
    try {
      const { data } = await api.post('/auth/register', formData);

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(buildUserForStorage(data.user)));
      setUser(data.user);

      toast.success('Registration successful! Welcome to AI-ECLT! 🎉');

      return { success: true, user: data.user, token: data.token };
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Registration failed';
      setError(errorMsg);
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setRegisterLoading(false);
    }
  };


  // LOGIN
  const login = async (formData) => {
    setLoginLoading(true);
    setError(null);
    try {
      const { data } = await api.post('/auth/login', formData);

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(buildUserForStorage(data.user)));
      setUser(data.user);

      toast.success(`Welcome back, ${data.user.name}! 👋`);

      return {
        success: true,
        user: data.user,
        token: data.token,
      };
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Login failed';
      setError(errorMsg);
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoginLoading(false);
    }
  };


  // LOGOUT
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    toast.success('Logged out successfully');
    setTimeout(() => {
      window.location.href = '/';
    }, 500);
  };


  // UPDATE PROFILE
  const updateUser = async (formData) => {
    try {
      const { data } = await api.put('/auth/update-profile', formData);
      setUser(data.user);
      localStorage.setItem('user', JSON.stringify(buildUserForStorage(data.user)));
      toast.success('Profile updated successfully!');
      return { success: true, user: data.user };
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Update failed';
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  // CHANGE PASSWORD
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


  const createBoardOfficial = async (formData) => {
    setError(null);
    try {
      const { data } = await api.post('/admin/users', {
        ...formData,
        role: 'board_official',
      });

      toast.success('Board Official created successfully! Credentials sent via email.');
      return { success: true, data: data.user, user: data.user };
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to create board official';
      setError(errorMsg);
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    }
  };


  const createAdmin = async (formData) => {
    setError(null);
    try {
      const { data } = await api.post('/admin/users', {
        ...formData,
        role: 'admin',
      });

      toast.success('Admin created successfully! Credentials sent via email.');
      return { success: true, data: data.user, user: data.user };
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to create admin';
      setError(errorMsg);
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  const createStudent = async (formData) => {
    setError(null);
    try {
      const { data } = await api.post('/admin/users', {
        ...formData,
        role: 'student',
      });

      toast.success('Student created successfully! Credentials sent via email.');
      return { success: true, data: data.user, user: data.user };
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to create student';
      setError(errorMsg);
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    }
  };


  const getAllUsers = async (filters = {}) => {
    try {
      const { data } = await api.get('/admin/users', { params: filters });
      return data.users || [];
    } catch (err) {
      console.error('Error fetching users:', err);
      toast.error('Failed to fetch users');
      return [];
    }
  };


  const isLinkedToCenter = () => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    if (user.role === 'student') return !!user.examCenter;
    if (user.role === 'board_official') return !!user.assignedCenter;
    return false;
  };

  const getMyCenter = () => {
    if (!user) return null;
    if (user.role === 'student') return user.examCenter;
    if (user.role === 'board_official') return user.assignedCenter;
    return null;
  };


  const getMyCenterId = () => {
    const center = getMyCenter();
    if (!center) return null;
    return typeof center === 'object' ? center._id : center;
  };


  const value = {
    user,
    loading,
    error,
    loginLoading,
    registerLoading,
    register,
    login,
    logout,
    updateUser,
    changePassword,

    createBoardOfficial,
    createAdmin,
    createStudent,
    getAllUsers,

    isLinkedToCenter,
    getMyCenter,
    getMyCenterId,

    isSuperAdmin: user?.role === 'admin',
    isBoardOfficial: user?.role === 'board_official',
    isStudent: user?.role === 'student',
    isAuthenticated: !!user,
    myCenter: getMyCenter(),
    myCenterId: getMyCenterId(),
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;