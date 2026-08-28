// src/routes/notificationRoutes.js
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  sendNotification,
  getAdminNotifications,
  getAdminNotificationById,
  deleteNotification,
  updateNotification,
  getMyNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
} = require('../controllers/notificationController');

// ==================== PROTECTED ROUTES (Sab ke liye) ====================
router.use(protect); // Sab routes protected hain

// ✅ Pehle User routes likho (taake /:id ke saath conflict na ho)
router.get('/my', getMyNotifications);
router.get('/unread-count', getUnreadCount);
router.put('/read-all', markAllAsRead);
router.put('/:id/read', markAsRead);

// ==================== ADMIN/BOARD OFFICIAL ROUTES ====================
// ✅ Ab authorize middleware lagao (Sirf Admin/Board Official ke liye)
router.use(authorize('admin', 'board_official'));

router.post('/', sendNotification);
router.get('/', getAdminNotifications);
router.get('/:id', getAdminNotificationById); // ✅ Ab yeh safe hai
router.put('/:id', updateNotification);
router.delete('/:id', deleteNotification);

module.exports = router;