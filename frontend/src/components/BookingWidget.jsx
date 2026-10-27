import React, { useState } from 'react';
import { useRide } from '../context/RideContext';
import { useAuth } from '../context/AuthContext';
import { VehicleSelector } from './VehicleSelector';
import { FareBreakdown } from './FareBreakdown';
import {
  MapPin,
  Navigation,
  ArrowUpDown,
  CreditCard,
  Clock,
  Tag,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';

export const BookingWidget = () => {
  const {
    locations,
    pickup,
    dropoff,
    setPickup,
    setDropoff,
    paymentMethod,
    setPaymentMethod,
    isScheduled,
    setIsScheduled,
    scheduledDate,
    setScheduledDate,
    appliedCoupon,
    applyPromoCode,
    couponError,
    bookRide,
    isLoading,
  } = useRide();

  const { isAuthenticated, demoLogin } = useAuth();
  const [promoInput, setPromoInput] = useState('');
  const [customPickup, setCustomPickup] = useState('');
  const [customDropoff, setCustomDropoff] = useState('');
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [bookingError, setBookingError] = useState('');

  const swapLocations = () => {
    const temp = pickup;
    setPickup(dropoff);
    setDropoff(temp);
  };

  const handleApplyPromo = async (codeToApply) => {
    const code = codeToApply || promoInput;
    const success = await applyPromoCode(code);
    if (success) setPromoInput('');
  };

  const handleBooking = async () => {
    setBookingError('');
    try {
      if (!isAuthenticated) {
        // Auto-login as passenger for zero-friction demo experience
        await demoLogin('customer');
      }
      await bookRide();
    } catch (err) {
      setBookingError(err.message || 'Failed to book ride. Please try again.');
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: '800' }}>Where to next?</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Book trusted rides across the city in seconds
          </p>
        </div>
        <button
          onClick={() => setIsCustomMode(!isCustomMode)}
          className="btn btn-secondary btn-sm"
          style={{ fontSize: '0.75rem' }}
        >
          {isCustomMode ? 'Use Preset Hotspots' : 'Custom Address'}
        </button>
      </div>

      {/* Pickup & Dropoff Inputs */}
      <div
        style={{
          background: 'rgba(11, 15, 25, 0.6)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-md)',
          padding: '1rem',
          position: 'relative',
        }}
      >
        {/* Pickup */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.85rem' }}>
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              background: '#10b981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <MapPin size={16} color="#ffffff" />
          </div>

          <div style={{ flex: 1 }}>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Pickup</label>
            {isCustomMode ? (
              <input
                type="text"
                className="input-field"
                placeholder="Enter custom pickup address"
                value={customPickup || pickup?.address}
                onChange={(e) => {
                  setCustomPickup(e.target.value);
                  setPickup({ address: e.target.value, lat: 37.785, lng: -122.406 });
                }}
                style={{ padding: '0.4rem 0.6rem', fontSize: '0.85rem' }}
              />
            ) : (
              <select
                className="input-field"
                value={pickup?.address}
                onChange={(e) => {
                  const loc = locations.find((l) => l.address === e.target.value);
                  if (loc) setPickup(loc);
                }}
                style={{ padding: '0.4rem 0.6rem', fontSize: '0.85rem' }}
              >
                {locations.map((loc, idx) => (
                  <option key={idx} value={loc.address}>
                    {loc.address}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Swap Button */}
        <button
          onClick={swapLocations}
          title="Swap Pickup & Destination"
          style={{
            position: 'absolute',
            right: '1.5rem',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'var(--bg-card-hover)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-main)',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 5,
          }}
        >
          <ArrowUpDown size={14} />
        </button>

        {/* Dropoff */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              background: '#ef4444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Navigation size={14} color="#ffffff" />
          </div>

          <div style={{ flex: 1 }}>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Destination</label>
            {isCustomMode ? (
              <input
                type="text"
                className="input-field"
                placeholder="Enter custom destination address"
                value={customDropoff || dropoff?.address}
                onChange={(e) => {
                  setCustomDropoff(e.target.value);
                  setDropoff({ address: e.target.value, lat: 37.801, lng: -122.415 });
                }}
                style={{ padding: '0.4rem 0.6rem', fontSize: '0.85rem' }}
              />
            ) : (
              <select
                className="input-field"
                value={dropoff?.address}
                onChange={(e) => {
                  const loc = locations.find((l) => l.address === e.target.value);
                  if (loc) setDropoff(loc);
                }}
                style={{ padding: '0.4rem 0.6rem', fontSize: '0.85rem' }}
              >
                {locations.map((loc, idx) => (
                  <option key={idx} value={loc.address}>
                    {loc.address}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>
      </div>

      {/* Vehicle Category Selector */}
      <VehicleSelector />

      {/* Promo Code Section */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            type="text"
            className="input-field"
            placeholder="Promo Code (e.g. FIRST50)"
            value={promoInput}
            onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
            style={{ padding: '0.5rem 0.8rem', fontSize: '0.85rem' }}
          />
          <button
            onClick={() => handleApplyPromo()}
            className="btn btn-secondary btn-sm"
            style={{ whiteSpace: 'nowrap' }}
          >
            Apply
          </button>
        </div>

        {/* Quick Promo Chips */}
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Try:</span>
          {['FIRST50', 'CABFLOW20', 'AIRPORT10'].map((code) => (
            <button
              key={code}
              onClick={() => handleApplyPromo(code)}
              style={{
                background: 'rgba(59, 130, 246, 0.1)',
                border: '1px dashed var(--primary)',
                borderRadius: '6px',
                color: '#60a5fa',
                fontSize: '0.72rem',
                padding: '0.15rem 0.4rem',
                cursor: 'pointer',
              }}
            >
              +{code}
            </button>
          ))}
        </div>

        {couponError && (
          <span style={{ color: 'var(--danger)', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
            <AlertCircle size={12} /> {couponError}
          </span>
        )}
      </div>

      {/* Fare Breakdown */}
      <FareBreakdown />

      {/* Payment Method & Schedule Options */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
        <div>
          <label className="input-label">Payment</label>
          <select
            className="input-field"
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            style={{ padding: '0.5rem', fontSize: '0.85rem' }}
          >
            <option value="card">💳 Credit/Debit Card</option>
            <option value="cash">💵 Cash on Arrival</option>
            <option value="wallet">👛 CabFlow Wallet</option>
            <option value="upi">⚡ UPI / Instant Pay</option>
          </select>
        </div>

        <div>
          <label className="input-label">Ride Time</label>
          <select
            className="input-field"
            value={isScheduled ? 'scheduled' : 'now'}
            onChange={(e) => setIsScheduled(e.target.value === 'scheduled')}
            style={{ padding: '0.5rem', fontSize: '0.85rem' }}
          >
            <option value="now">⚡ Ride Now</option>
            <option value="scheduled">📅 Schedule Later</option>
          </select>
        </div>
      </div>

      {isScheduled && (
        <div className="input-group" style={{ marginBottom: 0 }}>
          <label className="input-label">Pickup Date & Time</label>
          <input
            type="datetime-local"
            className="input-field"
            value={scheduledDate}
            onChange={(e) => setScheduledDate(e.target.value)}
          />
        </div>
      )}

      {bookingError && (
        <div style={{ color: 'var(--danger)', fontSize: '0.85rem', textAlign: 'center' }}>
          {bookingError}
        </div>
      )}

      {/* Book Button */}
      <button
        onClick={handleBooking}
        disabled={isLoading}
        className="btn btn-primary"
        style={{
          width: '100%',
          padding: '0.9rem',
          fontSize: '1.05rem',
          borderRadius: 'var(--radius-md)',
        }}
      >
        {isLoading ? 'Finding Nearby Drivers...' : 'Confirm & Request Cab'}
      </button>
    </div>
  );
};
