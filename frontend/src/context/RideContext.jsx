import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { cabAPI, rideAPI } from '../services/api';
import confetti from 'canvas-confetti';

const RideContext = createContext(null);

export const RideProvider = ({ children }) => {
  // Hotspot Presets
  const [locations, setLocations] = useState([
    { address: 'Union Square, 333 Post St', lat: 37.7879, lng: -122.4074 },
    { address: 'Fisherman Wharf, Pier 39', lat: 37.8087, lng: -122.4098 },
    { address: 'Mission District, 16th St', lat: 37.7649, lng: -122.4194 },
    { address: 'Financial District, Montgomery', lat: 37.7915, lng: -122.4019 },
    { address: 'SoMa Tech Park, 4th & Howard', lat: 37.7834, lng: -122.4014 },
    { address: 'SFO International Airport, Terminal 2', lat: 37.6213, lng: -122.3790 },
  ]);

  // Selected Trip Points
  const [pickup, setPickup] = useState(locations[0]);
  const [dropoff, setDropoff] = useState(locations[1]);
  const [selectedCategory, setSelectedCategory] = useState('sedan');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduledDate, setScheduledDate] = useState('');

  // Pricing & Estimates
  const [estimates, setEstimates] = useState([]);
  const [tripInfo, setTripInfo] = useState({ distanceKm: 3.4, durationMin: 12 });
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');

  // Cabs & Active Ride
  const [nearbyCabs, setNearbyCabs] = useState([]);
  const [activeRide, setActiveRide] = useState(null);
  const [driverPosition, setDriverPosition] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const simulationTimerRef = useRef(null);

  // Fetch preset locations & nearby cabs on load
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const locRes = await cabAPI.getLocations();
        if (locRes.success && locRes.data.length > 0) {
          setLocations(locRes.data);
          setPickup(locRes.data[0]);
          setDropoff(locRes.data[1]);
        }
      } catch (err) {
        console.warn('Using fallback locations');
      }

      refreshNearbyCabs();
    };

    fetchInitialData();
  }, []);

  // Refresh nearby cabs based on current pickup
  const refreshNearbyCabs = async () => {
    if (!pickup) return;
    try {
      const cabRes = await cabAPI.getNearby(pickup.lat, pickup.lng);
      if (cabRes.success) {
        setNearbyCabs(cabRes.data);
      }
    } catch (err) {
      console.warn('Could not fetch nearby cabs:', err.message);
    }
  };

  // Re-calculate estimate whenever pickup, dropoff or coupon changes
  useEffect(() => {
    if (pickup && dropoff) {
      fetchEstimate();
      refreshNearbyCabs();
    }
  }, [pickup, dropoff, appliedCoupon]);

  const fetchEstimate = async () => {
    if (!pickup || !dropoff) return;
    setIsLoading(true);
    try {
      const res = await rideAPI.estimate(pickup, dropoff, appliedCoupon?.code);
      if (res.success && res.data) {
        setEstimates(res.data.estimates || []);
        setTripInfo({
          distanceKm: res.data.distanceKm,
          durationMin: res.data.durationMin,
        });
      }
    } catch (err) {
      console.error('Failed to get estimate:', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const applyPromoCode = async (code) => {
    setCouponError('');
    if (!code.trim()) {
      setCouponError('Please enter a valid code');
      return false;
    }
    try {
      const res = await rideAPI.verifyCoupon(code);
      if (res.success && res.data) {
        setAppliedCoupon(res.data);
        setCouponCode('');
        return true;
      }
    } catch (err) {
      setCouponError(err.message || 'Invalid or expired coupon code');
      return false;
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponError('');
  };

  // Book Ride
  const bookRide = async () => {
    setIsLoading(true);
    try {
      const bookingData = {
        pickup,
        dropoff,
        cabCategory: selectedCategory,
        paymentMethod,
        scheduledAt: isScheduled ? scheduledDate : null,
        couponCode: appliedCoupon?.code,
      };

      const res = await rideAPI.book(bookingData);
      if (res.success && res.data) {
        setActiveRide(res.data);
        // Start driver simulation
        startDriverSimulation(res.data);
        return res.data;
      }
    } catch (err) {
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Simulation of driver movement along the route
  const startDriverSimulation = (ride) => {
    if (simulationTimerRef.current) clearInterval(simulationTimerRef.current);

    // Initial driver position slightly offset from pickup
    let currentLat = ride.driverDetails?.currentLocation?.lat || ride.pickup.lat + 0.008;
    let currentLng = ride.driverDetails?.currentLocation?.lng || ride.pickup.lng - 0.008;
    setDriverPosition({ lat: currentLat, lng: currentLng });

    let step = 0;
    const totalSteps = 20;

    simulationTimerRef.current = setInterval(async () => {
      step += 1;

      // Phase 1: Driver approaching pickup (steps 1 to 10)
      if (step <= 10) {
        const ratio = step / 10;
        const lat = currentLat + (ride.pickup.lat - currentLat) * ratio;
        const lng = currentLng + (ride.pickup.lng - currentLng) * ratio;
        setDriverPosition({ lat, lng });

        if (step === 10) {
          setActiveRide((prev) => (prev ? { ...prev, status: 'arriving' } : null));
        }
      }
      // Phase 2: Trip in progress towards dropoff (steps 11 to 20)
      else if (step <= 20) {
        const tripRatio = (step - 10) / 10;
        const lat = ride.pickup.lat + (ride.dropoff.lat - ride.pickup.lat) * tripRatio;
        const lng = ride.pickup.lng + (ride.dropoff.lng - ride.pickup.lng) * tripRatio;
        setDriverPosition({ lat, lng });

        if (step === 11) {
          setActiveRide((prev) => (prev ? { ...prev, status: 'in_progress' } : null));
        }

        if (step === 20) {
          clearInterval(simulationTimerRef.current);
          setActiveRide((prev) => (prev ? { ...prev, status: 'completed', paymentStatus: 'paid' } : null));
          // Trigger confetti animation
          try {
            confetti({
              particleCount: 80,
              spread: 70,
              origin: { y: 0.6 },
            });
          } catch (e) {}
        }
      }
    }, 2500);
  };

  const cancelActiveRide = async () => {
    if (!activeRide) return;
    if (simulationTimerRef.current) clearInterval(simulationTimerRef.current);
    try {
      await rideAPI.updateStatus(activeRide._id, 'cancelled');
    } catch (err) {
      console.warn('Cancel error:', err.message);
    }
    setActiveRide(null);
    setDriverPosition(null);
  };

  const resetRide = () => {
    if (simulationTimerRef.current) clearInterval(simulationTimerRef.current);
    setActiveRide(null);
    setDriverPosition(null);
  };

  return (
    <RideContext.Provider
      value={{
        locations,
        pickup,
        dropoff,
        selectedCategory,
        paymentMethod,
        isScheduled,
        scheduledDate,
        estimates,
        tripInfo,
        couponCode,
        appliedCoupon,
        couponError,
        nearbyCabs,
        activeRide,
        driverPosition,
        isLoading,
        setPickup,
        setDropoff,
        setSelectedCategory,
        setPaymentMethod,
        setIsScheduled,
        setScheduledDate,
        setCouponCode,
        applyPromoCode,
        removeCoupon,
        bookRide,
        cancelActiveRide,
        resetRide,
        refreshNearbyCabs,
      }}
    >
      {children}
    </RideContext.Provider>
  );
};

export const useRide = () => {
  const context = useContext(RideContext);
  if (!context) {
    throw new Error('useRide must be used within a RideProvider');
  }
  return context;
};
