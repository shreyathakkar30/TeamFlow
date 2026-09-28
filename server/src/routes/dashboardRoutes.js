const express = require('express');
const { getAdminDashboard, getMemberDashboard } = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');
const { requireRole } = require('../middleware/role');

const router = express.Router();

router.use(protect);

router.get('/admin', requireRole('admin'), getAdminDashboard);
router.get('/member', getMemberDashboard);

module.exports = router;
