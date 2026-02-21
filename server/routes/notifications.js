const express = require('express');
const {
    getNotifications,
    markAsRead,
    markAllAsRead,
    createNotification,
    triggerPendingReminder
} = require('../controllers/notificationController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.route('/').get(getNotifications).post(createNotification);
router.route('/read-all').put(markAllAsRead);
router.route('/trigger-reminder').post(triggerPendingReminder);
router.route('/:id/read').put(markAsRead);

module.exports = router;
