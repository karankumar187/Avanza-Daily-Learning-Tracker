const Notification = require('../models/Notification');
const DailyProgress = require('../models/DailyProgress');
const moment = require('moment-timezone');

const TIMEZONE = 'Asia/Kolkata';

// @desc    Get all notifications for user
// @route   GET /api/notifications
// @access  Private
exports.getNotifications = async (req, res, next) => {
    try {
        const notifications = await Notification.find({ user: req.user.id }).sort('-createdAt');

        res.status(200).json({
            success: true,
            count: notifications.length,
            data: notifications
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Mark a notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
exports.markAsRead = async (req, res, next) => {
    try {
        let notification = await Notification.findById(req.params.id);

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found'
            });
        }

        // Ensure user owns notification
        if (notification.user.toString() !== req.user.id) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized to update this notification'
            });
        }

        notification.read = true;
        await notification.save();

        res.status(200).json({
            success: true,
            data: notification
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Mark ALL notifications as read for user
// @route   PUT /api/notifications/read-all
// @access  Private
exports.markAllAsRead = async (req, res, next) => {
    try {
        await Notification.updateMany(
            { user: req.user.id, read: false },
            { read: true }
        );
        res.status(200).json({ success: true, message: 'All notifications marked as read' });
    } catch (error) {
        next(error);
    }
};

// @desc    Create new notification (Can be used internally or explicitly by generic actions)
// @route   POST /api/notifications
// @access  Private
exports.createNotification = async (req, res, next) => {
    try {
        req.body.user = req.user.id;
        const notification = await Notification.create(req.body);

        res.status(201).json({
            success: true,
            data: notification
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Trigger a pending-tasks reminder for the current user right now
// @route   POST /api/notifications/trigger-reminder
// @access  Private
exports.triggerPendingReminder = async (req, res, next) => {
    try {
        // Use user's saved timezone, fall back to UTC
        const userTimezone = req.user.preferences?.timezone || 'UTC';
        const now = moment.tz(userTimezone);
        const todayStart = now.clone().startOf('day').toDate();
        const todayEnd = now.clone().endOf('day').toDate();

        const pendingEntries = await DailyProgress.find({
            user: req.user.id,
            date: { $gte: todayStart, $lte: todayEnd },
            status: 'pending'
        }).populate('learningObjective', 'title');

        if (pendingEntries.length === 0) {
            return res.status(200).json({
                success: true,
                message: 'No pending tasks today — nothing to remind!'
            });
        }

        // --- DEDUP: only create one reminder notification per day ---
        // Use a date-keyed reference string to identify today's reminder
        const todayKey = now.format('YYYY-MM-DD');
        const alreadySent = await Notification.findOne({
            user: req.user.id,
            type: 'warning',
            // Match notifications created today (UTC range covers any timezone)
            createdAt: { $gte: todayStart, $lte: todayEnd },
            title: { $in: ['Pending Tasks Reminder', 'Late Night Reminder'] }
        });

        if (alreadySent) {
            // Update the existing notification with fresh count instead of creating a duplicate
            const taskCount = pendingEntries.length;
            const taskList = pendingEntries.slice(0, 3).map(e => e.learningObjective?.title || 'Unnamed task').join(', ');
            const extra = taskCount > 3 ? ` and ${taskCount - 3} more` : '';
            alreadySent.message = `You have ${taskCount} pending task${taskCount > 1 ? 's' : ''} today: ${taskList}${extra}. Keep going!`;
            alreadySent.read = false; // mark unread so it resurfaces
            await alreadySent.save();
            return res.status(200).json({ success: true, data: alreadySent, pendingCount: taskCount, updated: true });
        }

        const taskCount = pendingEntries.length;
        const taskList = pendingEntries.slice(0, 3).map(e => e.learningObjective?.title || 'Unnamed task').join(', ');
        const extra = taskCount > 3 ? ` and ${taskCount - 3} more` : '';
        const isNight = now.hour() >= 20;

        const notification = await Notification.create({
            user: req.user.id,
            title: isNight ? 'Late Night Reminder' : 'Pending Tasks Reminder',
            message: `You have ${taskCount} pending task${taskCount > 1 ? 's' : ''} today: ${taskList}${extra}. Keep going!`,
            type: 'warning'
        });

        res.status(201).json({
            success: true,
            data: notification,
            pendingCount: taskCount
        });
    } catch (error) {
        next(error);
    }
};
