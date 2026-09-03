
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


router.use(protect); 


router.get('/my', getMyNotifications);
router.get('/unread-count', getUnreadCount);
router.put('/read-all', markAllAsRead);
router.put('/:id/read', markAsRead);


router.use(authorize('admin', 'board_official'));

router.post('/', sendNotification);
router.get('/', getAdminNotifications);
router.get('/:id', getAdminNotificationById); 
router.put('/:id', updateNotification);
router.delete('/:id', deleteNotification);

module.exports = router;