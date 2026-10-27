const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
  },
  discountPercent: {
    type: Number,
    required: true,
  },
  maxDiscount: {
    type: Number,
    default: 15,
  },
  minFare: {
    type: Number,
    default: 10,
  },
  description: {
    type: String,
    default: 'Special promotional discount',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Coupon', couponSchema);
