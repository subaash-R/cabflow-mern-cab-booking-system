const Ride = require('../models/Ride');
const Driver = require('../models/Driver');
const Coupon = require('../models/Coupon');
const { getDBStatus } = require('../config/db');
const { CAB_TIERS, calculateHaversineDistance, calculateFare } = require('../utils/fareCalculator');
const { memoryStore } = require('../utils/seedData');

// @desc    Estimate fare and duration for all cab categories
// @route   POST /api/rides/estimate
const estimateRide = async (req, res) => {
  try {
    const { pickup, dropoff, couponCode } = req.body;

    if (!pickup || !dropoff || pickup.lat === undefined || dropoff.lat === undefined) {
      return res.status(400).json({ success: false, message: 'Valid pickup and dropoff coordinates are required' });
    }

    const distanceKm = calculateHaversineDistance(pickup.lat, pickup.lng, dropoff.lat, dropoff.lng);

    // Estimate duration assuming avg 35 km/h + 3 min traffic buffer
    const durationMin = Math.max(5, Math.round((distanceKm / 35) * 60 + 3));

    // Calculate discount if coupon provided
    let discountAmount = 0;
    let couponApplied = null;

    if (couponCode) {
      const codeUpper = couponCode.trim().toUpperCase();
      const { connected } = getDBStatus();
      let coupon;

      if (connected) {
        coupon = await Coupon.findOne({ code: codeUpper, isActive: true });
      } else {
        coupon = memoryStore.coupons.find((c) => c.code === codeUpper && c.isActive);
      }

      if (coupon) {
        couponApplied = coupon;
      }
    }

    // Build estimates for every cab category
    const estimates = Object.keys(CAB_TIERS).map((key) => {
      const tier = CAB_TIERS[key];
      let catDiscount = 0;

      if (couponApplied) {
        const rawSubtotal = tier.baseFare + distanceKm * tier.ratePerKm + durationMin * tier.ratePerMin;
        if (rawSubtotal >= couponApplied.minFare) {
          catDiscount = Math.min(couponApplied.maxDiscount, (rawSubtotal * couponApplied.discountPercent) / 100);
        }
      }

      const fareBreakdown = calculateFare(distanceKm, durationMin, key, catDiscount);

      return {
        category: key,
        name: tier.name,
        icon: tier.icon,
        image: tier.image,
        capacity: tier.capacity,
        tag: tier.tag,
        distanceKm,
        durationMin,
        etaMinutes: Math.floor(Math.random() * 4) + 2, // 2-5 mins
        fare: fareBreakdown,
      };
    });

    res.json({
      success: true,
      data: {
        distanceKm,
        durationMin,
        couponApplied: couponApplied
          ? {
              code: couponApplied.code,
              description: couponApplied.description,
              discountPercent: couponApplied.discountPercent,
            }
          : null,
        estimates,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Book a new ride
// @route   POST /api/rides/book
const createRide = async (req, res) => {
  try {
    const { pickup, dropoff, cabCategory, paymentMethod, scheduledAt, couponCode } = req.body;

    if (!pickup || !dropoff || !cabCategory) {
      return res.status(400).json({ success: false, message: 'Pickup, dropoff and cabCategory are required' });
    }

    const distanceKm = calculateHaversineDistance(pickup.lat, pickup.lng, dropoff.lat, dropoff.lng);
    const durationMin = Math.max(5, Math.round((distanceKm / 35) * 60 + 3));

    let discount = 0;
    if (couponCode) {
      const { connected } = getDBStatus();
      let coupon;
      if (connected) {
        coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });
      } else {
        coupon = memoryStore.coupons.find((c) => c.code === couponCode.toUpperCase() && c.isActive);
      }
      if (coupon) {
        const baseSubtotal = (CAB_TIERS[cabCategory]?.baseFare || 5) + distanceKm * 2;
        discount = Math.min(coupon.maxDiscount, (baseSubtotal * coupon.discountPercent) / 100);
      }
    }

    const fare = calculateFare(distanceKm, durationMin, cabCategory, discount);
    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    const { connected } = getDBStatus();

    // Auto-assign nearest available driver matching category or any driver
    let assignedDriver = null;
    let driverDetails = null;

    if (connected) {
      let driver = await Driver.findOne({
        isOnline: true,
        isAvailable: true,
        'vehicle.category': cabCategory,
      });

      if (!driver) {
        // Fallback to any online available driver
        driver = await Driver.findOne({ isOnline: true, isAvailable: true });
      }

      if (!driver) {
        // Fallback to any online driver or any fleet driver for seamless demo experience
        driver = await Driver.findOne({ isOnline: true }) || await Driver.findOne();
      }

      if (driver) {
        assignedDriver = driver._id;
        driverDetails = {
          _id: driver._id,
          name: driver.name,
          phone: driver.phone,
          avatar: driver.avatar,
          rating: driver.rating,
          vehicle: driver.vehicle,
          currentLocation: driver.currentLocation,
        };
        // Mark driver as occupied
        await Driver.findByIdAndUpdate(driver._id, { isAvailable: false });
      }

      const ride = await Ride.create({
        customer: req.user._id,
        driver: assignedDriver,
        pickup,
        dropoff,
        cabCategory,
        distanceKm,
        durationMin,
        fare,
        status: assignedDriver ? 'accepted' : 'pending',
        otp,
        paymentMethod: paymentMethod || 'cash',
        paymentStatus: 'pending',
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        timeline: [
          { status: 'pending', timestamp: new Date() },
          ...(assignedDriver ? [{ status: 'accepted', timestamp: new Date() }] : []),
        ],
      });

      const populatedRide = await Ride.findById(ride._id).populate('customer', 'name email phone avatar');

      return res.status(201).json({
        success: true,
        data: {
          ...populatedRide.toObject(),
          driverDetails: driverDetails,
        },
      });
    }

    // In-Memory store
    const availableDriver =
      memoryStore.drivers.find((d) => d.isOnline && d.isAvailable && d.vehicle.category === cabCategory) ||
      memoryStore.drivers.find((d) => d.isOnline && d.isAvailable) ||
      memoryStore.drivers[0];

    if (availableDriver) {
      assignedDriver = availableDriver._id;
      driverDetails = {
        _id: availableDriver._id,
        name: availableDriver.name,
        phone: availableDriver.phone,
        avatar: availableDriver.avatar,
        rating: availableDriver.rating,
        vehicle: availableDriver.vehicle,
        currentLocation: availableDriver.currentLocation,
      };
      availableDriver.isAvailable = false;
    }

    const newRide = {
      _id: `ride_${Date.now()}`,
      customer: req.user._id,
      customerDetails: {
        name: req.user.name,
        email: req.user.email,
        phone: req.user.phone,
        avatar: req.user.avatar,
      },
      driver: assignedDriver,
      driverDetails: driverDetails,
      pickup,
      dropoff,
      cabCategory,
      distanceKm,
      durationMin,
      fare,
      status: assignedDriver ? 'accepted' : 'pending',
      otp,
      paymentMethod: paymentMethod || 'cash',
      paymentStatus: 'pending',
      scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
      timeline: [
        { status: 'pending', timestamp: new Date() },
        ...(assignedDriver ? [{ status: 'accepted', timestamp: new Date() }] : []),
      ],
      createdAt: new Date(),
    };

    memoryStore.rides.unshift(newRide);

    return res.status(201).json({
      success: true,
      data: newRide,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get rides for logged-in user
// @route   GET /api/rides/my-rides
const getUserRides = async (req, res) => {
  try {
    const { connected } = getDBStatus();

    if (connected) {
      const rides = await Ride.find({ customer: req.user._id })
        .populate('driver')
        .sort({ createdAt: -1 });
      return res.json({ success: true, count: rides.length, data: rides });
    }

    const rides = memoryStore.rides
      .filter((r) => r.customer?.toString() === req.user._id.toString())
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({ success: true, count: rides.length, data: rides });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get ride details by ID
// @route   GET /api/rides/:id
const getRideById = async (req, res) => {
  try {
    const { id } = req.params;
    const { connected } = getDBStatus();

    if (connected) {
      const ride = await Ride.findById(id).populate('customer', 'name email phone avatar').populate('driver');
      if (!ride) {
        return res.status(404).json({ success: false, message: 'Ride not found' });
      }
      return res.json({ success: true, data: ride });
    }

    const ride = memoryStore.rides.find((r) => r._id.toString() === id.toString());
    if (!ride) {
      return res.status(404).json({ success: false, message: 'Ride not found' });
    }

    res.json({ success: true, data: ride });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update ride status (accepted, arriving, in_progress, completed, cancelled)
// @route   PATCH /api/rides/:id/status
const updateRideStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, otp } = req.body;

    const validStatuses = ['pending', 'accepted', 'arriving', 'in_progress', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const { connected } = getDBStatus();

    if (connected) {
      const ride = await Ride.findById(id);
      if (!ride) return res.status(404).json({ success: false, message: 'Ride not found' });

      // Verify OTP when starting trip
      if (status === 'in_progress' && otp && otp !== ride.otp) {
        return res.status(400).json({ success: false, message: 'Invalid OTP entered by driver' });
      }

      ride.status = status;
      ride.timeline.push({ status, timestamp: new Date() });

      if (status === 'completed') {
        ride.paymentStatus = 'paid';
        if (ride.driver) {
          await Driver.findByIdAndUpdate(ride.driver, {
            isAvailable: true,
            $inc: { 'earnings.today': ride.fare.total, 'earnings.total': ride.fare.total, totalTrips: 1 },
          });
        }
      } else if (status === 'cancelled') {
        if (ride.driver) {
          await Driver.findByIdAndUpdate(ride.driver, { isAvailable: true });
        }
      }

      await ride.save();
      const updated = await Ride.findById(id).populate('driver').populate('customer', 'name phone');
      return res.json({ success: true, data: updated });
    }

    const ride = memoryStore.rides.find((r) => r._id.toString() === id.toString());
    if (!ride) return res.status(404).json({ success: false, message: 'Ride not found' });

    if (status === 'in_progress' && otp && otp !== ride.otp) {
      return res.status(400).json({ success: false, message: 'Invalid OTP entered by driver' });
    }

    ride.status = status;
    ride.timeline = ride.timeline || [];
    ride.timeline.push({ status, timestamp: new Date() });

    if (status === 'completed') {
      ride.paymentStatus = 'paid';
      const drv = memoryStore.drivers.find((d) => d._id === ride.driver);
      if (drv) {
        drv.isAvailable = true;
        drv.totalTrips += 1;
        drv.earnings.today = +(drv.earnings.today + ride.fare.total).toFixed(2);
        drv.earnings.total = +(drv.earnings.total + ride.fare.total).toFixed(2);
      }
    } else if (status === 'cancelled') {
      const drv = memoryStore.drivers.find((d) => d._id === ride.driver);
      if (drv) drv.isAvailable = true;
    }

    res.json({ success: true, data: ride });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Rate and review a completed ride
// @route   POST /api/rides/:id/rate
const rateRide = async (req, res) => {
  try {
    const { id } = req.params;
    const { score, review } = req.body;

    if (!score || score < 1 || score > 5) {
      return res.status(400).json({ success: false, message: 'Rating score must be between 1 and 5' });
    }

    const { connected } = getDBStatus();

    if (connected) {
      const ride = await Ride.findById(id);
      if (!ride) return res.status(404).json({ success: false, message: 'Ride not found' });

      ride.rating = { score, review: review || '', createdAt: new Date() };
      await ride.save();
      return res.json({ success: true, data: ride });
    }

    const ride = memoryStore.rides.find((r) => r._id.toString() === id.toString());
    if (!ride) return res.status(404).json({ success: false, message: 'Ride not found' });

    ride.rating = { score, review: review || '', createdAt: new Date() };
    res.json({ success: true, data: ride });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Verify promo coupon code
// @route   POST /api/rides/coupon/verify
const verifyCoupon = async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) return res.status(400).json({ success: false, message: 'Coupon code is required' });

    const codeUpper = code.trim().toUpperCase();
    const { connected } = getDBStatus();
    let coupon;

    if (connected) {
      coupon = await Coupon.findOne({ code: codeUpper, isActive: true });
    } else {
      coupon = memoryStore.coupons.find((c) => c.code === codeUpper && c.isActive);
    }

    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Invalid or expired coupon code' });
    }

    res.json({ success: true, data: coupon });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  estimateRide,
  createRide,
  getUserRides,
  getRideById,
  updateRideStatus,
  rateRide,
  verifyCoupon,
};
