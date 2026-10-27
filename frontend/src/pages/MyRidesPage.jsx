import React, { useState, useEffect } from 'react';
import { rideAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useRide } from '../context/RideContext';
import { FileText, MapPin, Navigation, Calendar, Star, RotateCcw, CheckCircle } from 'lucide-react';
import { RideReceiptModal } from '../components/RideReceiptModal';
import { RatingModal } from '../components/RatingModal';

export const MyRidesPage = ({ onRebook }) => {
  const { isAuthenticated, demoLogin } = useAuth();
  const { setPickup, setDropoff } = useRide();
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedReceiptRide, setSelectedReceiptRide] = useState(null);
  const [selectedRatingRide, setSelectedRatingRide] = useState(null);

  useEffect(() => {
    loadRides();
  }, [isAuthenticated]);

  const loadRides = async () => {
    setLoading(true);
    try {
      if (!isAuthenticated) {
        await demoLogin('customer');
      }
      const res = await rideAPI.getMyRides();
      if (res.success && res.data) {
        setRides(res.data);
      }
    } catch (err) {
      console.error('Failed to load rides:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredRides = rides.filter((r) => {
    if (activeFilter === 'all') return true;
    return r.status === activeFilter;
  });

  const handleRebook = (ride) => {
    if (ride.pickup && ride.dropoff) {
      setPickup(ride.pickup);
      setDropoff(ride.dropoff);
      if (onRebook) onRebook();
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return <span className="badge badge-success">Completed</span>;
      case 'cancelled':
        return <span className="badge badge-danger">Cancelled</span>;
      case 'in_progress':
        return <span className="badge badge-primary">In Progress</span>;
      default:
        return <span className="badge badge-warning">{status}</span>;
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '2rem auto', padding: '0 1.5rem' }}>
      {/* Header & Filter Tabs */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: '800' }}>Your Ride History</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Review past receipts, download invoices, and manage your trips
          </p>
        </div>

        {/* Filter Pills */}
        <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(255, 255, 255, 0.05)', padding: '0.3rem', borderRadius: '12px' }}>
          {['all', 'completed', 'cancelled'].map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className="btn btn-sm"
              style={{
                background: activeFilter === filter ? 'var(--primary)' : 'transparent',
                color: activeFilter === filter ? '#ffffff' : 'var(--text-muted)',
                textTransform: 'capitalize',
              }}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          Loading your past trips...
        </div>
      ) : filteredRides.length === 0 ? (
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
          <FileText size={48} color="var(--text-dim)" style={{ marginBottom: '1rem' }} />
          <h3 style={{ fontSize: '1.2rem', marginBottom: '0.4rem' }}>No rides found</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            You haven't taken any rides in this category yet.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filteredRides.map((ride) => (
            <div
              key={ride._id}
              className="glass-panel"
              style={{
                padding: '1.25rem 1.5rem',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '1.2rem',
                alignItems: 'center',
              }}
            >
              {/* Route & Date */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
                  {getStatusBadge(ride.status)}
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Calendar size={13} /> {new Date(ride.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.88rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <MapPin size={15} color="#10b981" />
                    <span>{ride.pickup?.address}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Navigation size={15} color="#ef4444" />
                    <span>{ride.dropoff?.address}</span>
                  </div>
                </div>
              </div>

              {/* Vehicle & Stats */}
              <div>
                <div style={{ fontWeight: '700', fontSize: '0.95rem' }}>
                  {ride.cabCategory?.toUpperCase()} • {ride.distanceKm} km
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  Duration: ~{ride.durationMin} mins
                </div>

                {ride.rating?.score ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#fbbf24', fontSize: '0.85rem', marginTop: '0.4rem' }}>
                    <Star size={14} fill="#fbbf24" /> Rated: {ride.rating.score}/5
                  </div>
                ) : (
                  ride.status === 'completed' && (
                    <button
                      onClick={() => setSelectedRatingRide(ride)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#60a5fa',
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        padding: 0,
                        marginTop: '0.4rem',
                      }}
                    >
                      + Rate this trip
                    </button>
                  )
                )}
              </div>

              {/* Price & Actions */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.6rem' }}>
                <div style={{ fontSize: '1.35rem', fontWeight: '800', color: '#60a5fa' }}>
                  ${ride.fare?.total?.toFixed(2)}
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={() => setSelectedReceiptRide(ride)}
                    className="btn btn-secondary btn-sm"
                  >
                    <FileText size={14} /> Receipt
                  </button>

                  <button
                    onClick={() => handleRebook(ride)}
                    className="btn btn-primary btn-sm"
                  >
                    <RotateCcw size={14} /> Re-book
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedReceiptRide && (
        <RideReceiptModal ride={selectedReceiptRide} onClose={() => setSelectedReceiptRide(null)} />
      )}

      {selectedRatingRide && (
        <RatingModal
          ride={selectedRatingRide}
          onClose={() => {
            setSelectedRatingRide(null);
            loadRides();
          }}
        />
      )}
    </div>
  );
};
