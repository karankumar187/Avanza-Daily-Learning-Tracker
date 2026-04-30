const express = require('express');
const { executeHourlyTasks } = require('../controllers/cronController');

const router = express.Router();

router.post('/hourly', executeHourlyTasks);
router.get('/hourly', executeHourlyTasks); // Support GET for easier triggering from some chron services

module.exports = router;
