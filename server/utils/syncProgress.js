const moment = require('moment-timezone');
const DailyProgress = require('../models/DailyProgress');
const Schedule = require('../models/Schedule');

const TIMEZONE = 'Asia/Kolkata';

/**
 * Synchronizes a user's progress for the past N days up to today.
 * NEVER backfills before schedule.createdAt.
 *
 * Uses atomic bulkWrite upsert ($setOnInsert) to prevent duplicate records
 * even when called concurrently from multiple requests.
 */
const syncProgress = async (userId, daysToLookBack = 7) => {
    try {
        const schedule = await Schedule.findOne({
            user: userId,
            isDefault: true,
            isActive: true
        });

        if (!schedule || !schedule.weeklySchedule || schedule.weeklySchedule.length === 0) {
            return;
        }

        const today = moment.tz(TIMEZONE).startOf('day');

        // Never backfill before schedule was created — prevents phantom missed entries
        const scheduleCreatedAt = moment.tz(schedule.createdAt, TIMEZONE).startOf('day');

        // Mark past 'pending' items as 'missed', only from scheduleCreatedAt onwards
        await DailyProgress.updateMany(
            {
                user: userId,
                date: {
                    $gte: scheduleCreatedAt.toDate(),
                    $lt: today.toDate()
                },
                status: 'pending'
            },
            { status: 'missed', updatedAt: Date.now() }
        );

        const weekDaysMap = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const bulkOps = [];

        for (let i = daysToLookBack; i >= 0; i--) {
            const targetDate = moment.tz(TIMEZONE).subtract(i, 'days').startOf('day');

            // Skip dates before the schedule was created
            if (targetDate.isBefore(scheduleCreatedAt)) continue;

            const targetDayName = weekDaysMap[targetDate.day()];
            const daySchedule = schedule.weeklySchedule.find(s => s.day === targetDayName);

            if (!daySchedule || !daySchedule.isActive || daySchedule.items.length === 0) continue;

            const isToday = i === 0;
            const dayStart = targetDate.clone().startOf('day').toDate();

            for (const item of daySchedule.items) {
                // Atomic upsert: only inserts if no record exists yet.
                // $setOnInsert means we NEVER overwrite a completed/missed status
                // with pending/missed if the user already acted on it.
                bulkOps.push({
                    updateOne: {
                        filter: {
                            user: userId,
                            learningObjective: item.learningObjective,
                            date: dayStart
                        },
                        update: {
                            $setOnInsert: {
                                user: userId,
                                learningObjective: item.learningObjective,
                                date: dayStart,
                                status: isToday ? 'pending' : 'missed',
                                timeSpent: 0,
                                createdAt: new Date(),
                                updatedAt: new Date()
                            }
                        },
                        upsert: true
                    }
                });
            }
        }

        if (bulkOps.length > 0) {
            // ordered:false so duplicate key errors from races are silently skipped
            await DailyProgress.bulkWrite(bulkOps, { ordered: false });
        }
    } catch (error) {
        console.error('Error syncing progress:', error.message);
    }
};

module.exports = syncProgress;
