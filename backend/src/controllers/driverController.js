const Driver = require('../models/Driver');
const Ride = require('../models/Ride');
const { getDBStatus } = require('../config/db');
const { memoryStore } = require('../utils/seedData');

// @desc    Get current driver profile & dashboard stats
// @route   GET /api/driver/profile
const getDriverProfile = async (req, res) => {
  try {
    const { connected } = getDBStatus();
    let driver;

    if (connected) {
      driver = await Driver.findOne({ user: req.user._id });
    } else {
      driver = memoryStore.drivers.find((d) => d.user?.toString() === req.user._id.toString()) || memoryStore.drivers[0];
    }

    if (!driver) {
      return res.status(404).json({ success: false, message: 'Driver profile not found' });
    }

    res.json({ success: true, data: driver });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Toggle driver online / offline status
// @route   PATCH /api/driver/toggle-status
const toggleOnlineStatus = async (req, res) => {
  try {
    const { isOnline } = req.body;
    const { connected } = getDBStatus();

    if (connected) {
      const driver = await Driver.findOneAndUpdate(
        { user: req.user._id },
        { isOnline: Boolean(isOnline) },
        { new: true }
      );
      if (!driver) return res.status(404).json({ success: false, message: 'Driver not found' });
      return res.json({ success: true, data: driver });
    }

    const driver = memoryStore.drivers.find((d) => d.user?.toString() === req.user._id.toString()) || memoryStore.drivers[0];
    if (driver) {
      driver.isOnline = Boolean(isOnline);
      return res.json({ success: true, data: driver });
    }

    res.status(404).json({ success: false, message: 'Driver not found' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get pending ride requests available for driver to accept
// @route   GET /api/driver/requests
const getAvailableRequests = async (req, res) => {
  try {
    const { connected } = getDBStatus();

    if (connected) {
      const requests = await Ride.find({ status: 'pending' })
        .populate('customer', 'name phone avatar rating')
        .sort({ createdAt: -1 })
        .limit(10);
      return res.json({ success: true, count: requests.length, data: requests });
    }

    const requests = memoryStore.rides
      .filter((r) => r.status === 'pending')
      .slice(0, 10);

    res.json({ success: true, count: requests.length, data: requests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Accept a ride request
// @route   POST /api/driver/accept-ride/:id
const acceptRide = async (req, res) => {
  try {
    const { id } = req.params;
    const { connected } = getDBStatus();

    if (connected) {
      const driver = await Driver.findOne({ user: req.user._id });
      if (!driver) return res.status(404).json({ success: false, message: 'Driver not found' });

      const ride = await Ride.findById(id);
      if (!ride) return res.status(404).json({ success: false, message: 'Ride not found' });
      if (ride.status !== 'pending') {
        return res.status(400).json({ success: false, message: 'Ride already accepted or cancelled' });
      }

      ride.driver = driver._id;
      ride.status = 'accepted';
      ride.timeline.push({ status: 'accepted', timestamp: new Date() });
      await ride.save();

      driver.isAvailable = false;
      await driver.save();

      return res.json({ success: true, data: ride });
    }

    const ride = memoryStore.rides.find((r) => r._id.toString() === id.toString());
    if (!ride) return res.status(404).json({ success: false, message: 'Ride not found' });
    if (ride.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Ride already accepted or cancelled' });
    }

    const driver = memoryStore.drivers.find((d) => d.user?.toString() === req.user._id.toString()) || memoryStore.drivers[0];
    ride.driver = driver._id;
    ride.driverDetails = {
      name: driver.name,
      avatar: driver.avatar,
      phone: driver.phone,
      rating: driver.rating,
      vehicle: driver.vehicle,
    };
    ride.status = 'accepted';
    ride.timeline = ride.timeline || [];
    ride.timeline.push({ status: 'accepted', timestamp: new Date() });
    driver.isAvailable = false;

    res.json({ success: true, data: ride });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update driver live location coordinates
// @route   PATCH /api/driver/location
const updateLocation = async (req, res) => {
  try {
    const { lat, lng, address } = req.body;
    const { connected } = getDBStatus();

    if (connected) {
      const driver = await Driver.findOneAndUpdate(
        { user: req.user._id },
        { currentLocation: { lat, lng, address: address || 'Updated location' } },
        { new: true }
      );
      return res.json({ success: true, data: driver });
    }

    const driver = memoryStore.drivers.find((d) => d.user?.toString() === req.user._id.toString()) || memoryStore.drivers[0];
    if (driver) {
      driver.currentLocation = { lat, lng, address: address || driver.currentLocation.address };
      return res.json({ success: true, data: driver });
    }

    res.status(404).json({ success: false, message: 'Driver not found' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getDriverProfile,
  toggleOnlineStatus,
  getAvailableRequests,
  acceptRide,
  updateLocation,
};
