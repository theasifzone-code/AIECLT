
const express = require('express');
const router = express.Router();
const {
  createSchedule,
  getAllSchedules,
  getScheduleById,
  updateSchedule,
  deleteSchedule,
  getStudentSchedules,
  getScheduleStats,
  getUpcomingSchedules,
  getSchedulesByCenter,
  getScheduleByDateRange,
  registerStudentForSchedule,
  unregisterStudentFromSchedule,
  updateScheduleStatus,
  publishResults,
} = require('../controllers/scheduleController');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .get(protect, getAllSchedules)
  .post(protect, authorize('admin', 'superadmin'), createSchedule);

router.get('/student', protect, getStudentSchedules);
router.get('/upcoming', protect, getUpcomingSchedules);
router.get('/stats', protect, authorize('admin', 'superadmin'), getScheduleStats);
router.get('/center/:centerId', protect, getSchedulesByCenter);
router.get('/date-range', protect, getScheduleByDateRange);

router.route('/:id')
  .get(protect, getScheduleById)
  .put(protect, authorize('admin', 'superadmin'), updateSchedule)
  .delete(protect, authorize('admin', 'superadmin'), deleteSchedule);


router.post('/:id/register', protect, registerStudentForSchedule);
router.post('/:id/unregister', protect, unregisterStudentFromSchedule);
router.patch('/:id/status', protect, authorize('admin', 'superadmin'), updateScheduleStatus);
router.post('/:id/publish-results', protect, authorize('admin', 'superadmin'), publishResults);

module.exports = router;