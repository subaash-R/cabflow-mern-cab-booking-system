import React, { useState, useEffect } from 'react';
import { driverAPI, rideAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Car,
  Power,
  DollarSign,
  TrendingUp,
  Star,
  MapPin,
  Navigation,
  CheckCircle2,
  AlertTriangle,
  Key,
} from 'lucide-react';

export const DriverDashboardPage = () => {
  const { user, isAuthenticated, demoLogin } = useAuth();
  const [driver, setDriver] = useState(null);
  const [isOnline, setIsOnline] = useState(true);
  const [requests, setRequests] = useState([]);
  const [activeTrip, setActiveTrip] = useState(null);
  const [inputOtp, setInputOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    initDriver();
  }, [isAuthenticated]);

  const initDriver = async () => {
    setLoading(true);
    try {
      if (!isAuthenticated || user?.role !== 'driver') {
        await demoLogin('driver');
      }
      const res = await driverAPI.getProfile();
      if (res.success && res.data) {
        setDriver(res.data);
        setIsOnline(res.data.isOnline);
      }
      loadRequests();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadRequests = async () => {
    try {
      const res = await driverAPI.getRequests();
      if (res.success && res.data) {
        setRequests(res.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleOnline = async () => {
    try {
      const newStatus = !isOnline;
      await driverAPI.toggleStatus(newStatus);
      setIsOnline(newStatus);
      setStatusMessage(newStatus ? 'You are now ONLINE and ready to receive trips!' : 'You are now OFFLINE.');
    } catch (err) {
      console.error(err);
    }
  };

  const handleAcceptRide = async (rideId) => {
    try {
      const res = await driverAPI.acceptRide(rideId);
      if (res.success && res.data) {
        setActiveTrip(res.data);
        setRequests((prev) => prev.filter((r) => r._id !== rideId));
        setStatusMessage('Trip accepted! Head over to the passenger pickup location.');
      }
    } catch (err) {
      alert(err.message || 'Failed to accept ride');
    }
  };

  const handleArrivePickup = async () => {
    if (!activeTrip) return;
    try {
      const res = await rideAPI.updateStatus(activeTrip._id, 'arriving');
      if (res.success && res.data) {
        setActiveTrip(res.data);
        setStatusMessage('Passenger notified: You have arrived at the pickup location.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleStartTrip = async () => {
    if (!activeTrip) return;
    setOtpError('');
    try {
      const res = await rideAPI.updateStatus(activeTrip._id, 'in_progress', inputOtp);
      if (res.success && res.data) {
        setActiveTrip(res.data);
        setInputOtp('');
        setStatusMessage('OTP Verified! Trip is now in progress.');
      }
    } catch (err) {
      setOtpError(err.message || 'Invalid passenger OTP entered.');
    }
  };

  const handleCompleteTrip = async () => {
    if (!activeTrip) return;
    try {
      const res = await rideAPI.updateStatus(activeTrip._id, 'completed');
      if (res.success && res.data) {
        setActiveTrip(null);
        setStatusMessage(`Trip completed! $${res.data.fare?.total?.toFixed(2)} added to your earnings.`);
        // Reload driver stats
        const profRes = await driverAPI.getProfile();
        if (profRes.success && profRes.data) setDriver(profRes.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '2rem auto', padding: '0 1.5rem' }}>
      {/* Header Profile & Toggle */}
      <div
        className="glass-panel"
        style={{
          padding: '1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.5rem',
          marginBottom: '1.5rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <img
            src={driver?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'}
            alt="Driver"
            style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #10b981' }}
          />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: '800' }}>{driver?.name || 'Driver Partner'}</h2>
              <span className="badge badge-success">Verified Partner</span>
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              {driver?.vehicle?.color} {driver?.vehicle?.model} • Plate: <strong>{driver?.vehicle?.plateNumber}</strong>
            </div>
          </div>
        </div>

        {/* Online / Offline Switch */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            onClick={handleToggleOnline}
            className={`btn ${isOnline ? 'btn-success' : 'btn-secondary'}`}
            style={{ padding: '0.75rem 1.5rem', fontWeight: '700' }}
          >
            <Power size={18} />
            {isOnline ? 'You Are ONLINE' : 'Go ONLINE'}
          </button>
        </div>
      </div>

      {statusMessage && (
        <div
          style={{
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.4)',
            borderRadius: 'var(--radius-md)',
            padding: '0.85rem 1.2rem',
            color: '#34d399',
            marginBottom: '1.5rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span>{statusMessage}</span>
          <button
            onClick={() => setStatusMessage('')}
            style={{ background: 'none', border: 'none', color: '#34d399', cursor: 'pointer', fontSize: '1.2rem' }}
          >
            ×
          </button>
        </div>
      )}

      {/* Metrics Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            <span>Today's Earnings</span>
            <DollarSign size={18} color="#10b981" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#10b981', marginTop: '0.4rem' }}>
            ${driver?.earnings?.today?.toFixed(2) || '145.20'}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.2rem' }}>
            Total: ${driver?.earnings?.total?.toFixed(2) || '4,210.00'}
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            <span>Total Completed Trips</span>
            <TrendingUp size={18} color="#3b82f6" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: '800', marginTop: '0.4rem' }}>
            {driver?.totalTrips || 348}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#34d399', marginTop: '0.2rem' }}>
            98.5% Acceptance Rate
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            <span>Driver Rating</span>
            <Star size={18} color="#fbbf24" fill="#fbbf24" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#fbbf24', marginTop: '0.4rem' }}>
            ⭐ {driver?.rating || 4.92}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.2rem' }}>
            Based on 320 reviews
          </div>
        </div>
      </div>

      {/* Active Trip Execution Section (if in active ride) */}
      {activeTrip && (
        <div
          className="glass-panel"
          style={{
            padding: '1.5rem',
            marginBottom: '1.5rem',
            border: '2px solid var(--primary)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800' }}>Active Ride In Execution</h3>
            <span className="badge badge-primary" style={{ textTransform: 'capitalize' }}>
              Status: {activeTrip.status}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', marginBottom: '1.2rem' }}>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Passenger Pickup</div>
              <div style={{ fontWeight: '600', marginTop: '0.2rem' }}>{activeTrip.pickup?.address}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Dropoff Destination</div>
              <div style={{ fontWeight: '600', marginTop: '0.2rem' }}>{activeTrip.dropoff?.address}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Estimated Fare</div>
              <div style={{ fontSize: '1.2rem', fontWeight: '800', color: '#10b981' }}>
                ${activeTrip.fare?.total?.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Step progression buttons */}
          {activeTrip.status === 'accepted' && (
            <button onClick={handleArrivePickup} className="btn btn-primary" style={{ width: '100%' }}>
              I Have Arrived at Pickup Location
            </button>
          )}

          {activeTrip.status === 'arriving' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <label className="input-label">
                <Key size={14} /> Enter 4-Digit Passenger OTP to Start Trip:
              </label>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <input
                  type="text"
                  maxLength={4}
                  className="input-field"
                  placeholder="Enter OTP (e.g. 1234)"
                  value={inputOtp}
                  onChange={(e) => setInputOtp(e.target.value)}
                  style={{ fontSize: '1.2rem', letterSpacing: '0.2em', maxWidth: '200px' }}
                />
                <button onClick={handleStartTrip} className="btn btn-success">
                  Verify & Start Trip
                </button>
              </div>
              {otpError && <span style={{ color: 'var(--danger)', fontSize: '0.85rem' }}>{otpError}</span>}
            </div>
          )}

          {activeTrip.status === 'in_progress' && (
            <button onClick={handleCompleteTrip} className="btn btn-success" style={{ width: '100%', padding: '0.9rem' }}>
              <CheckCircle2 size={18} /> Complete Ride & Collect Payment
            </button>
          )}
        </div>
      )}

      {/* Incoming Ride Requests */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800' }}>Incoming Ride Requests</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Nearby riders requesting immediate pickup
            </p>
          </div>
          <button onClick={loadRequests} className="btn btn-secondary btn-sm">
            Refresh Radar
          </button>
        </div>

        {!isOnline ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
            Switch to <strong>ONLINE</strong> status to receive live ride dispatches.
          </div>
        ) : requests.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
            <Car size={40} color="var(--text-dim)" style={{ marginBottom: '0.5rem' }} />
            <p>Radar scanning for nearby trip requests...</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {requests.map((req) => (
              <div
                key={req._id}
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.25rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '1rem',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <span className="badge badge-warning">Incoming Request</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Category: {req.cabCategory?.toUpperCase()}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.88rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                    <div>
                      <strong style={{ color: '#10b981' }}>Pickup:</strong> {req.pickup?.address}
                    </div>
                    <div>
                      <strong style={{ color: '#ef4444' }}>Dropoff:</strong> {req.dropoff?.address}
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                  <div style={{ fontSize: '1.35rem', fontWeight: '800', color: '#10b981' }}>
                    ${req.fare?.total?.toFixed(2)}
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => handleAcceptRide(req._id)}
                      className="btn btn-success btn-sm"
                    >
                      Accept Ride
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
