const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  avatar: {
    type: String,
    default: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  },
  vehicle: {
    model: { type: String, required: true },
    plateNumber: { type: String, required: true },
    category: {
      type: String,
      enum: ['economy', 'sedan', 'suv', 'luxury', 'auto'],
      required: true,
    },
    color: { type: String, default: 'Silver' },
    year: { type: Number, default: 2022 },
  },
  isOnline: {
    type: Boolean,
    default: true,
  },
  isAvailable: {
    type: Boolean,
    default: true,
  },
  currentLocation: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    address: { type: String, default: 'Downtown Central' },
    heading: { type: Number, default: 45 },
  },
  rating: {
    type: Number,
    default: 4.85,
  },
  totalTrips: {
    type: Number,
    default: 142,
  },
  earnings: {
    today: { type: Number, default: 115.5 },
    total: { type: Number, default: 3420.0 },
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Driver', driverSchema);
