import React from 'react';
import { useRide } from '../context/RideContext';
import { BookingWidget } from '../components/BookingWidget';
import { ActiveRideTracker } from '../components/ActiveRideTracker';
import { InteractiveMap } from '../components/InteractiveMap';
import { Shield, Clock, Award, Zap } from 'lucide-react';

export const HomePage = () => {
  const { activeRide } = useRide();

  return (
    <div>
      {/* Main Booking & Map Section */}
      <div className="grid-booking-layout">
        {/* Left Side: Booking Widget or Active Ride Tracker */}
        <div>
          {activeRide ? <ActiveRideTracker /> : <BookingWidget />}
        </div>

        {/* Right Side: Leaflet Interactive Map */}
        <div className="glass-panel" style={{ padding: '0.75rem', overflow: 'hidden', minHeight: '560px' }}>
          <InteractiveMap />
        </div>
      </div>

      {/* Feature Highlights Banner */}
      <div
        style={{
          maxWidth: '1600px',
          margin: '1.5rem auto 0 auto',
          padding: '0 2rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1.2rem',
        }}
      >
        <div
          className="glass-panel"
          style={{
            padding: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
          }}
        >
          <div
            style={{
              background: 'rgba(59, 130, 246, 0.15)',
              padding: '0.75rem',
              borderRadius: '12px',
              color: '#3b82f6',
            }}
          >
            <Shield size={24} />
          </div>
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: '700' }}>Verified Drivers</h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Background checked and top-rated</p>
          </div>
        </div>

        <div
          className="glass-panel"
          style={{
            padding: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
          }}
        >
          <div
            style={{
              background: 'rgba(16, 185, 129, 0.15)',
              padding: '0.75rem',
              borderRadius: '12px',
              color: '#10b981',
            }}
          >
            <Zap size={24} />
          </div>
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: '700' }}>Instant Pickup</h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Average arrival in under 4 minutes</p>
          </div>
        </div>

        <div
          className="glass-panel"
          style={{
            padding: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
          }}
        >
          <div
            style={{
              background: 'rgba(245, 158, 11, 0.15)',
              padding: '0.75rem',
              borderRadius: '12px',
              color: '#f59e0b',
            }}
          >
            <Clock size={24} />
          </div>
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: '700' }}>Transparent Pricing</h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No hidden fees, exact upfront fares</p>
          </div>
        </div>

        <div
          className="glass-panel"
          style={{
            padding: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
          }}
        >
          <div
            style={{
              background: 'rgba(139, 92, 246, 0.15)',
              padding: '0.75rem',
              borderRadius: '12px',
              color: '#8b5cf6',
            }}
          >
            <Award size={24} />
          </div>
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: '700' }}>24/7 Support</h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Real-time emergency & trip assistance</p>
          </div>
        </div>
      </div>
    </div>
  );
};
