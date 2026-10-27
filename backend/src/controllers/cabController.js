const Driver = require('../models/Driver');
const { getDBStatus } = require('../config/db');
const { CAB_TIERS, calculateHaversineDistance } = require('../utils/fareCalculator');
const { memoryStore, SAMPLE_LOCATIONS } = require('../utils/seedData');

// @desc    Get all cab tiers & pricing info
// @route   GET /api/cabs/tiers
const getCabTiers = async (req, res) => {
  res.json({
    success: true,
    data: Object.values(CAB_TIERS),
  });
};

// @desc    Get popular preset locations
// @route   GET /api/cabs/locations
const getPresetLocations = async (req, res) => {
  res.json({
    success: true,
    data: SAMPLE_LOCATIONS,
  });
};

// @desc    Get nearby available cabs
// @route   GET /api/cabs/nearby
const getNearbyCabs = async (req, res) => {
  try {
    const lat = parseFloat(req.query.lat) || 37.7879;
    const lng = parseFloat(req.query.lng) || -122.4074;
    const category = req.query.category;

    const { connected } = getDBStatus();
    let drivers = [];

    if (connected) {
      const filter = { isOnline: true, isAvailable: true };
      if (category) filter['vehicle.category'] = category;
      drivers = await Driver.find(filter).lean();
      if (drivers.length === 0) {
        // Fallback to any online drivers
        const fallbackFilter = { isOnline: true };
        if (category) fallbackFilter['vehicle.category'] = category;
        drivers = await Driver.find(fallbackFilter).lean();
        if (drivers.length === 0) {
          drivers = await Driver.find().lean();
        }
      }
    } else {
      drivers = memoryStore.drivers.filter((d) => {
        if (!d.isOnline || !d.isAvailable) return false;
        if (category && d.vehicle.category !== category) return false;
        return true;
      });
      if (drivers.length === 0) {
        drivers = memoryStore.drivers;
      }
    }

    // Annotate with distance and ETA to requested point
    const nearby = drivers.map((drv) => {
      const dist = calculateHaversineDistance(lat, lng, drv.currentLocation.lat, drv.currentLocation.lng);
      const etaMin = Math.max(2, Math.round((dist / 30) * 60));
      return {
        _id: drv._id,
        name: drv.name,
        avatar: drv.avatar,
        vehicle: drv.vehicle,
        rating: drv.rating,
        currentLocation: drv.currentLocation,
        distanceKm: dist,
        etaMinutes: etaMin,
      };
    });

    // Sort by proximity
    nearby.sort((a, b) => a.distanceKm - b.distanceKm);

    res.json({
      success: true,
      count: nearby.length,
      data: nearby,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getCabTiers,
  getPresetLocations,
  getNearbyCabs,
};
