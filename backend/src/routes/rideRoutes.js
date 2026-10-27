const express = require('express');
const router = express.Router();
const {
  estimateRide,
  createRide,
  getUserRides,
  getRideById,
  updateRideStatus,
  rateRide,
  verifyCoupon,
} = require('../controllers/rideController');
const { protect } = require('../middleware/authMiddleware');

router.post('/estimate', estimateRide);
router.post('/coupon/verify', verifyCoupon);
router.post('/book', protect, createRide);
router.get('/my-rides', protect, getUserRides);
router.get('/:id', protect, getRideById);
router.patch('/:id/status', protect, updateRideStatus);
router.post('/:id/rate', protect, rateRide);

module.exports = router;
