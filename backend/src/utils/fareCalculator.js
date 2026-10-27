// Cab Categories Configuration & Fare Matrix
const CAB_TIERS = {
  auto: {
    id: 'auto',
    name: 'Auto / E-Rickshaw',
    capacity: 3,
    baseFare: 2.5,
    ratePerKm: 1.2,
    ratePerMin: 0.15,
    minimumFare: 4.0,
    speedKmH: 28,
    icon: '🛺',
    tag: 'Cheapest & Agile',
    image: 'https://cdn-icons-png.flaticon.com/512/3774/3774278.png',
  },
  economy: {
    id: 'economy',
    name: 'CabFlow Mini',
    capacity: 4,
    baseFare: 4.0,
    ratePerKm: 1.6,
    ratePerMin: 0.25,
    minimumFare: 6.0,
    speedKmH: 38,
    icon: '🚗',
    tag: 'Everyday Reliable',
    image: 'https://cdn-icons-png.flaticon.com/512/3097/3097180.png',
  },
  sedan: {
    id: 'sedan',
    name: 'Comfort Sedan',
    capacity: 4,
    baseFare: 6.0,
    ratePerKm: 2.1,
    ratePerMin: 0.35,
    minimumFare: 9.0,
    speedKmH: 42,
    icon: '🚘',
    tag: 'Spacious & Smooth',
    image: 'https://cdn-icons-png.flaticon.com/512/3202/3202926.png',
  },
  suv: {
    id: 'suv',
    name: 'Prime SUV',
    capacity: 6,
    baseFare: 9.0,
    ratePerKm: 2.8,
    ratePerMin: 0.45,
    minimumFare: 14.0,
    speedKmH: 40,
    icon: '🚙',
    tag: 'Extra Seats & Luggage',
    image: 'https://cdn-icons-png.flaticon.com/512/2554/2554978.png',
  },
  luxury: {
    id: 'luxury',
    name: 'Executive Luxury',
    capacity: 4,
    baseFare: 15.0,
    ratePerKm: 4.0,
    ratePerMin: 0.7,
    minimumFare: 22.0,
    speedKmH: 45,
    icon: '✨',
    tag: 'Top Rated Drivers',
    image: 'https://cdn-icons-png.flaticon.com/512/743/743916.png',
  },
};

// Calculate Haversine distance in KM
const calculateHaversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const straightDistance = R * c;
  // Road curvature factor approx 1.28
  return Math.max(1.2, +(straightDistance * 1.28).toFixed(2));
};

// Calculate fare breakdown for a category
const calculateFare = (distanceKm, durationMin, categoryKey, discount = 0, surgeMultiplier = 1.0) => {
  const tier = CAB_TIERS[categoryKey] || CAB_TIERS.economy;

  const baseFare = tier.baseFare;
  const distanceFare = +(distanceKm * tier.ratePerKm).toFixed(2);
  const timeFare = +(durationMin * tier.ratePerMin).toFixed(2);

  const subtotal = (baseFare + distanceFare + timeFare) * surgeMultiplier;
  const tax = +(subtotal * 0.08).toFixed(2); // 8% tax / service fee
  const grossTotal = subtotal + tax;

  const finalDiscount = Math.min(grossTotal - tier.minimumFare, Math.max(0, discount));
  const netTotal = Math.max(tier.minimumFare, +(grossTotal - finalDiscount).toFixed(2));

  return {
    baseFare,
    distanceFare,
    timeFare,
    tax,
    discount: +finalDiscount.toFixed(2),
    surgeMultiplier,
    total: netTotal,
  };
};

module.exports = {
  CAB_TIERS,
  calculateHaversineDistance,
  calculateFare,
};
