const express = require('express');
const router = express.Router();
const {
  getDriverProfile,
  toggleOnlineStatus,
  getAvailableRequests,
  acceptRide,
  updateLocation,
} = require('../controllers/driverController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/profile', protect, getDriverProfile);
router.patch('/toggle-status', protect, toggleOnlineStatus);
router.get('/requests', protect, getAvailableRequests);
router.post('/accept/:id', protect, acceptRide);
router.patch('/location', protect, updateLocation);

module.exports = router;
