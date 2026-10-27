const express = require('express');
const router = express.Router();
const {
  getAdminMetrics,
  getAllRides,
  getAllDrivers,
  getAllUsers,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/metrics', protect, getAdminMetrics);
router.get('/rides', protect, getAllRides);
router.get('/drivers', protect, getAllDrivers);
router.get('/users', protect, getAllUsers);

module.exports = router;
