const mongoose = require('mongoose');

const rideSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Driver',
    default: null,
  },
  pickup: {
    address: { type: String, required: true },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
  dropoff: {
    address: { type: String, required: true },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
  cabCategory: {
    type: String,
    enum: ['economy', 'sedan', 'suv', 'luxury', 'auto'],
    required: true,
  },
  distanceKm: {
    type: Number,
    required: true,
  },
  durationMin: {
    type: Number,
    required: true,
  },
  fare: {
    baseFare: { type: Number, required: true },
    distanceFare: { type: Number, required: true },
    timeFare: { type: Number, required: true },
    tax: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    total: { type: Number, required: true },
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'arriving', 'in_progress', 'completed', 'cancelled'],
    default: 'pending',
  },
  otp: {
    type: String,
    default: () => Math.floor(1000 + Math.random() * 9000).toString(),
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'wallet', 'upi'],
    default: 'cash',
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid'],
    default: 'pending',
  },
  scheduledAt: {
    type: Date,
    default: null,
  },
  cancellationReason: {
    type: String,
    default: null,
  },
  rating: {
    score: { type: Number, min: 1, max: 5 },
    review: { type: String, default: '' },
    createdAt: { type: Date, default: Date.now },
  },
  timeline: [
    {
      status: { type: String },
      timestamp: { type: Date, default: Date.now },
    }
  ],
}, {
  timestamps: true,
});

module.exports = mongoose.model('Ride', rideSchema);
