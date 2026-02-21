const express = require('express');
const {
    getNotifications,
    markAsRead,
    createNotification
} = require('../controllers/notificationController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router
    .route('/')
    .get(getNotifications)
    .post(createNotification);

router
    .route('/:id/read')
    .put(markAsRead);

module.exports = router;
