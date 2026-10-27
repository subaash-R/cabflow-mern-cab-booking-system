const User = require('../models/User');
const Driver = require('../models/Driver');
const Ride = require('../models/Ride');
const { getDBStatus } = require('../config/db');
const { memoryStore } = require('../utils/seedData');

// @desc    Get aggregate analytics metrics for admin dashboard
// @route   GET /api/admin/metrics
const getAdminMetrics = async (req, res) => {
  try {
    const { connected } = getDBStatus();

    if (connected) {
      const [totalUsers, totalDrivers, activeDrivers, totalRides, completedRides, revenueAgg] = await Promise.all([
        User.countDocuments({ role: 'customer' }),
        Driver.countDocuments(),
        Driver.countDocuments({ isOnline: true }),
        Ride.countDocuments(),
        Ride.countDocuments({ status: 'completed' }),
        Ride.aggregate([
          { $match: { paymentStatus: 'paid' } },
          { $group: { _id: null, total: { $sum: '$fare.total' } } },
        ]),
      ]);

      const totalRevenue = revenueAgg[0]?.total || 0;

      return res.json({
        success: true,
        data: {
          totalUsers,
          totalDrivers,
          activeDrivers,
          totalRides,
          completedRides,
          totalRevenue: +totalRevenue.toFixed(2),
          platformCommission: +(totalRevenue * 0.2).toFixed(2), // 20% platform cut
        },
      });
    }

    // In-memory metrics
    const totalUsers = memoryStore.users.filter((u) => u.role === 'customer').length;
    const totalDrivers = memoryStore.drivers.length;
    const activeDrivers = memoryStore.drivers.filter((d) => d.isOnline).length;
    const totalRides = memoryStore.rides.length;
    const completedRides = memoryStore.rides.filter((r) => r.status === 'completed').length;
    const totalRevenue = memoryStore.rides
      .filter((r) => r.paymentStatus === 'paid')
      .reduce((sum, r) => sum + (r.fare?.total || 0), 0);

    res.json({
      success: true,
      data: {
        totalUsers,
        totalDrivers,
        activeDrivers,
        totalRides,
        completedRides,
        totalRevenue: +totalRevenue.toFixed(2),
        platformCommission: +(totalRevenue * 0.2).toFixed(2),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all rides with query filters
// @route   GET /api/admin/rides
const getAllRides = async (req, res) => {
  try {
    const { status, category } = req.query;
    const { connected } = getDBStatus();

    if (connected) {
      const query = {};
      if (status) query.status = status;
      if (category) query.cabCategory = category;

      const rides = await Ride.find(query)
        .populate('customer', 'name email phone avatar')
        .populate('driver')
        .sort({ createdAt: -1 });

      return res.json({ success: true, count: rides.length, data: rides });
    }

    let rides = [...memoryStore.rides];
    if (status) rides = rides.filter((r) => r.status === status);
    if (category) rides = rides.filter((r) => r.cabCategory === category);
    rides.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({ success: true, count: rides.length, data: rides });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get fleet drivers list
// @route   GET /api/admin/drivers
const getAllDrivers = async (req, res) => {
  try {
    const { connected } = getDBStatus();

    if (connected) {
      const drivers = await Driver.find().populate('user', 'name email phone');
      return res.json({ success: true, count: drivers.length, data: drivers });
    }

    res.json({ success: true, count: memoryStore.drivers.length, data: memoryStore.drivers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get registered users
// @route   GET /api/admin/users
const getAllUsers = async (req, res) => {
  try {
    const { connected } = getDBStatus();

    if (connected) {
      const users = await User.find().select('-password').sort({ createdAt: -1 });
      return res.json({ success: true, count: users.length, data: users });
    }

    const safeUsers = memoryStore.users.map(({ password, ...u }) => u);
    res.json({ success: true, count: safeUsers.length, data: safeUsers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAdminMetrics,
  getAllRides,
  getAllDrivers,
  getAllUsers,
};
