const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Driver = require('../models/Driver');
const Ride = require('../models/Ride');
const Coupon = require('../models/Coupon');
const { getDBStatus } = require('../config/db');

// Sample default locations (San Francisco / Tech Bay Area coordinates for realistic map visual)
const SAMPLE_LOCATIONS = [
  { address: 'Union Square, 333 Post St', lat: 37.7879, lng: -122.4074 },
  { address: 'Fisherman Wharf, Pier 39', lat: 37.8087, lng: -122.4098 },
  { address: 'Mission District, 16th St', lat: 37.7649, lng: -122.4194 },
  { address: 'Financial District, Montgomery', lat: 37.7915, lng: -122.4019 },
  { address: 'SoMa Tech Park, 4th & Howard', lat: 37.7834, lng: -122.4014 },
  { address: 'SFO International Airport, Terminal 2', lat: 37.6213, lng: -122.3790 },
];

const INITIAL_COUPONS = [
  {
    code: 'FIRST50',
    discountPercent: 50,
    maxDiscount: 10,
    minFare: 8,
    description: '50% off on your first ride! (Max $10)',
    isActive: true,
  },
  {
    code: 'CABFLOW20',
    discountPercent: 20,
    maxDiscount: 15,
    minFare: 12,
    description: '20% off on all weekend rides! (Max $15)',
    isActive: true,
  },
  {
    code: 'AIRPORT10',
    discountPercent: 15,
    maxDiscount: 20,
    minFare: 25,
    description: '15% off on airport trips',
    isActive: true,
  },
];

const getHashedPassword = async (pwd) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(pwd, salt);
};

// In-Memory fallback store
const memoryStore = {
  users: [],
  drivers: [],
  rides: [],
  coupons: [],
};

const initializeMemoryStore = async () => {
  const customerPassword = await getHashedPassword('pass123');
  const driverPassword = await getHashedPassword('driver123');
  const adminPassword = await getHashedPassword('admin123');

  const customerUser = {
    _id: 'usr_cust_001',
    name: 'Alex Johnson',
    email: 'passenger@cabflow.com',
    password: customerPassword,
    phone: '+1 (555) 234-8901',
    role: 'customer',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    rating: 4.9,
    savedPlaces: [
      { label: 'Home', address: 'Union Square, 333 Post St', lat: 37.7879, lng: -122.4074 },
      { label: 'Work', address: 'SoMa Tech Park, 4th & Howard', lat: 37.7834, lng: -122.4014 },
    ],
    createdAt: new Date(),
  };

  const driverUser1 = {
    _id: 'usr_driv_001',
    name: 'Marcus Vance',
    email: 'driver@cabflow.com',
    password: driverPassword,
    phone: '+1 (555) 456-7890',
    role: 'driver',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    rating: 4.92,
    createdAt: new Date(),
  };

  const adminUser = {
    _id: 'usr_admin_001',
    name: 'Elena Rostova',
    email: 'admin@cabflow.com',
    password: adminPassword,
    phone: '+1 (555) 888-0199',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    rating: 5.0,
    createdAt: new Date(),
  };

  const driver1 = {
    _id: 'drv_001',
    user: customerUser._id,
    name: 'Marcus Vance',
    phone: '+1 (555) 456-7890',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    vehicle: {
      model: 'Toyota Camry Hybrid',
      plateNumber: '7XYZ892',
      category: 'sedan',
      color: 'Midnight Black',
      year: 2023,
    },
    isOnline: true,
    isAvailable: true,
    currentLocation: {
      lat: 37.7865,
      lng: -122.4052,
      address: 'Near Market & 3rd St',
      heading: 90,
    },
    rating: 4.92,
    totalTrips: 348,
    earnings: { today: 145.2, total: 4210.0 },
  };

  const driver2 = {
    _id: 'drv_002',
    name: 'Sarah Chen',
    phone: '+1 (555) 321-6547',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    vehicle: {
      model: 'Honda Civic',
      plateNumber: '5ABC123',
      category: 'economy',
      color: 'Pearl Silver',
      year: 2022,
    },
    isOnline: true,
    isAvailable: true,
    currentLocation: {
      lat: 37.7895,
      lng: -122.4095,
      address: 'Near Powell Station',
      heading: 180,
    },
    rating: 4.88,
    totalTrips: 219,
    earnings: { today: 92.5, total: 2980.0 },
  };

  const driver3 = {
    _id: 'drv_003',
    name: 'David Rodriguez',
    phone: '+1 (555) 789-1234',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    vehicle: {
      model: 'Chevrolet Suburban SUV',
      plateNumber: '8BIG999',
      category: 'suv',
      color: 'Gloss White',
      year: 2024,
    },
    isOnline: true,
    isAvailable: true,
    currentLocation: {
      lat: 37.7842,
      lng: -122.4035,
      address: 'Mission St & 4th',
      heading: 270,
    },
    rating: 4.95,
    totalTrips: 512,
    earnings: { today: 210.0, total: 6840.0 },
  };

  const driver4 = {
    _id: 'drv_004',
    name: 'Grace Sterling',
    phone: '+1 (555) 999-3322',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    vehicle: {
      model: 'Tesla Model S Plaid',
      plateNumber: 'LUX9988',
      category: 'luxury',
      color: 'Deep Metallic Blue',
      year: 2024,
    },
    isOnline: true,
    isAvailable: true,
    currentLocation: {
      lat: 37.7925,
      lng: -122.404,
      address: 'Financial District Plaza',
      heading: 0,
    },
    rating: 4.98,
    totalTrips: 180,
    earnings: { today: 280.0, total: 5400.0 },
  };

  const driver5 = {
    _id: 'drv_005',
    name: 'Kiran Patel',
    phone: '+1 (555) 444-2211',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
    vehicle: {
      model: 'Mahindra E-Rickshaw',
      plateNumber: 'AUTO42',
      category: 'auto',
      color: 'Yellow & Green',
      year: 2023,
    },
    isOnline: true,
    isAvailable: true,
    currentLocation: {
      lat: 37.783,
      lng: -122.411,
      address: '7th St & Market',
      heading: 45,
    },
    rating: 4.82,
    totalTrips: 410,
    earnings: { today: 85.0, total: 2100.0 },
  };

  const pastRide1 = {
    _id: 'ride_001',
    customer: customerUser._id,
    driver: driver1._id,
    driverDetails: {
      name: driver1.name,
      avatar: driver1.avatar,
      phone: driver1.phone,
      rating: driver1.rating,
      vehicle: driver1.vehicle,
    },
    pickup: { address: 'Union Square, 333 Post St', lat: 37.7879, lng: -122.4074 },
    dropoff: { address: 'Fisherman Wharf, Pier 39', lat: 37.8087, lng: -122.4098 },
    cabCategory: 'sedan',
    distanceKm: 3.4,
    durationMin: 12,
    fare: {
      baseFare: 6.0,
      distanceFare: 7.14,
      timeFare: 4.2,
      tax: 1.39,
      discount: 5.0,
      total: 13.73,
    },
    status: 'completed',
    otp: '5812',
    paymentMethod: 'card',
    paymentStatus: 'paid',
    rating: { score: 5, review: 'Super clean car and arrived on time!', createdAt: new Date(Date.now() - 86400000) },
    createdAt: new Date(Date.now() - 86400000),
  };

  const pastRide2 = {
    _id: 'ride_002',
    customer: customerUser._id,
    driver: driver3._id,
    driverDetails: {
      name: driver3.name,
      avatar: driver3.avatar,
      phone: driver3.phone,
      rating: driver3.rating,
      vehicle: driver3.vehicle,
    },
    pickup: { address: 'SoMa Tech Park, 4th & Howard', lat: 37.7834, lng: -122.4014 },
    dropoff: { address: 'SFO International Airport, Terminal 2', lat: 37.6213, lng: -122.379 },
    cabCategory: 'suv',
    distanceKm: 21.8,
    durationMin: 32,
    fare: {
      baseFare: 9.0,
      distanceFare: 61.04,
      timeFare: 14.4,
      tax: 6.75,
      discount: 0,
      total: 91.19,
    },
    status: 'completed',
    otp: '9103',
    paymentMethod: 'upi',
    paymentStatus: 'paid',
    rating: { score: 5, review: 'Comfortable ride with plenty of luggage room.', createdAt: new Date(Date.now() - 172800000) },
    createdAt: new Date(Date.now() - 172800000),
  };

  memoryStore.users = [customerUser, driverUser1, adminUser];
  memoryStore.drivers = [driver1, driver2, driver3, driver4, driver5];
  memoryStore.rides = [pastRide1, pastRide2];
  memoryStore.coupons = INITIAL_COUPONS.map((c, i) => ({ ...c, _id: `cpn_00${i + 1}` }));
};

// Seed MongoDB if connected
const seedDatabase = async () => {
  const { connected } = getDBStatus();
  await initializeMemoryStore();

  if (!connected) {
    console.log('[SEED] In-memory store initialized with demo users, drivers, coupons, and rides.');
    return;
  }

  try {
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('[SEED] Seeding MongoDB with initial data...');
      const savedUsers = await User.insertMany(memoryStore.users.map(u => ({ ...u, _id: undefined })));
      
      // Update drivers with real User ObjectId
      const driversToInsert = memoryStore.drivers.map((drv, idx) => ({
        ...drv,
        _id: undefined,
        user: savedUsers[idx % savedUsers.length]._id,
      }));
      await Driver.insertMany(driversToInsert);
      await Coupon.insertMany(INITIAL_COUPONS);
      console.log('[SEED] MongoDB seeded successfully!');
    } else {
      // Ensure all drivers are active and available for demo rides
      await Driver.updateMany({}, { isOnline: true, isAvailable: true });
      console.log('[SEED] Reset existing driver fleet to Online & Available');
    }
  } catch (err) {
    console.error('[SEED ERROR]', err.message);
  }
};

module.exports = {
  SAMPLE_LOCATIONS,
  INITIAL_COUPONS,
  memoryStore,
  initializeMemoryStore,
  seedDatabase,
};
