import React, { useState } from 'react';
import { useRide } from '../context/RideContext';
import {
  Phone,
  MessageSquare,
  ShieldAlert,
  XCircle,
  CheckCircle2,
  Car,
  Star,
  Key,
} from 'lucide-react';
import { RideReceiptModal } from './RideReceiptModal';
import { RatingModal } from './RatingModal';

export const ActiveRideTracker = () => {
  const { activeRide, cancelActiveRide, resetRide } = useRide();
  const [showReceipt, setShowReceipt] = useState(false);
  const [showRating, setShowRating] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  if (!activeRide) return null;

  const isCompleted = activeRide.status === 'completed';
  const isCancelled = activeRide.status === 'cancelled';

  const driver = activeRide.driverDetails || {
    name: 'Marcus Vance',
    phone: '+1 (555) 456-7890',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    rating: 4.9,
    vehicle: {
      model: 'Toyota Camry Hybrid',
      plateNumber: '7XYZ892',
      color: 'Midnight Black',
      category: activeRide.cabCategory,
    },
  };

  const getStatusBadge = () => {
    switch (activeRide.status) {
      case 'pending':
        return <span className="badge badge-warning">Looking for Nearby Driver...</span>;
      case 'accepted':
        return <span className="badge badge-primary">Driver Accepted & Heading to You</span>;
      case 'arriving':
        return <span className="badge badge-warning pulse-animation">Driver Arrived at Pickup</span>;
      case 'in_progress':
        return <span className="badge badge-success">Ride in Progress</span>;
      case 'completed':
        return <span className="badge badge-success">Ride Completed!</span>;
      case 'cancelled':
        return <span className="badge badge-danger">Ride Cancelled</span>;
      default:
        return <span className="badge badge-primary">{activeRide.status}</span>;
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
      {/* Top Status Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '800' }}>Active Trip Status</h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Booking ID: #{activeRide._id.slice(-6)}
          </p>
        </div>
        {getStatusBadge()}
      </div>

      {/* Driver Card */}
      <div
        style={{
          background: 'rgba(11, 15, 25, 0.6)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-md)',
          padding: '1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <img
            src={driver.avatar}
            alt={driver.name}
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '50%',
              objectFit: 'cover',
              border: '2px solid #3b82f6',
            }}
          />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ fontWeight: '700', fontSize: '1rem' }}>{driver.name}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.8rem', color: '#fbbf24' }}>
                <Star size={13} fill="#fbbf24" /> {driver.rating}
              </span>
            </div>

            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
              {driver.vehicle?.color} {driver.vehicle?.model}
            </div>

            <div
              style={{
                display: 'inline-block',
                background: 'rgba(255, 255, 255, 0.08)',
                padding: '0.15rem 0.45rem',
                borderRadius: '4px',
                fontSize: '0.75rem',
                fontWeight: '700',
                letterSpacing: '0.05em',
                color: '#93c5fd',
                marginTop: '0.25rem',
              }}
            >
              {driver.vehicle?.plateNumber}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => setAlertMessage(`Calling driver: ${driver.phone}`)}
            className="btn btn-secondary btn-sm"
            style={{ padding: '0.55rem', borderRadius: '50%' }}
            title="Call Driver"
          >
            <Phone size={15} color="#10b981" />
          </button>
          <button
            onClick={() => setAlertMessage('Connecting to driver in-app chat...')}
            className="btn btn-secondary btn-sm"
            style={{ padding: '0.55rem', borderRadius: '50%' }}
            title="Chat with Driver"
          >
            <MessageSquare size={15} color="#3b82f6" />
          </button>
        </div>
      </div>

      {alertMessage && (
        <div
          style={{
            background: 'rgba(59, 130, 246, 0.1)',
            border: '1px solid var(--primary)',
            borderRadius: 'var(--radius-sm)',
            padding: '0.5rem 0.8rem',
            fontSize: '0.8rem',
            color: '#93c5fd',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span>{alertMessage}</span>
          <button
            onClick={() => setAlertMessage('')}
            style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}
          >
            ×
          </button>
        </div>
      )}

      {/* OTP Display Box */}
      {!isCompleted && !isCancelled && (
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(99, 102, 241, 0.15))',
            border: '1px dashed var(--primary)',
            borderRadius: 'var(--radius-md)',
            padding: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Key size={18} color="#60a5fa" />
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Start Ride PIN / OTP</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-main)' }}>Share with driver upon pickup</div>
            </div>
          </div>
          <div
            style={{
              fontSize: '1.35rem',
              fontWeight: '800',
              letterSpacing: '0.2em',
              color: '#60a5fa',
              background: 'rgba(0, 0, 0, 0.3)',
              padding: '0.2rem 0.75rem',
              borderRadius: '8px',
            }}
          >
            {activeRide.otp}
          </div>
        </div>
      )}

      {/* Pickup & Destination Summary */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
        <div style={{ display: 'flex', gap: '0.6rem' }}>
          <span style={{ color: '#10b981', fontWeight: 'bold' }}>From:</span>
          <span style={{ color: 'var(--text-main)' }}>{activeRide.pickup?.address}</span>
        </div>
        <div style={{ display: 'flex', gap: '0.6rem' }}>
          <span style={{ color: '#ef4444', fontWeight: 'bold' }}>To:</span>
          <span style={{ color: 'var(--text-main)' }}>{activeRide.dropoff?.address}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.2rem' }}>
          <span>Total Fare: <strong>${activeRide.fare?.total?.toFixed(2)}</strong></span>
          <span>Payment: <strong style={{ textTransform: 'uppercase' }}>{activeRide.paymentMethod}</strong></span>
        </div>
      </div>

      {/* Completion / Cancel Action Buttons */}
      {isCompleted ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          <div
            style={{
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              padding: '0.85rem',
              borderRadius: 'var(--radius-md)',
              textAlign: 'center',
              color: '#34d399',
              fontWeight: '600',
            }}
          >
            🎉 You have arrived safely at your destination!
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            <button onClick={() => setShowReceipt(true)} className="btn btn-secondary">
              View Receipt
            </button>
            <button onClick={() => setShowRating(true)} className="btn btn-primary">
              Rate Driver
            </button>
          </div>

          <button onClick={resetRide} className="btn btn-secondary" style={{ marginTop: '0.5rem' }}>
            Book Another Ride
          </button>
        </div>
      ) : isCancelled ? (
        <div>
          <button onClick={resetRide} className="btn btn-primary" style={{ width: '100%' }}>
            Book a New Ride
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={cancelActiveRide}
            className="btn btn-secondary"
            style={{ flex: 1, borderColor: 'rgba(239, 68, 68, 0.3)', color: '#f87171' }}
          >
            <XCircle size={16} /> Cancel Ride
          </button>
          <button
            onClick={() => setAlertMessage('Emergency SOS triggered: Safety response team notified!')}
            className="btn btn-danger"
            style={{ padding: '0.65rem 1rem' }}
            title="Emergency SOS"
          >
            <ShieldAlert size={18} /> SOS
          </button>
        </div>
      )}

      {/* Receipt Modal */}
      {showReceipt && (
        <RideReceiptModal ride={activeRide} onClose={() => setShowReceipt(false)} />
      )}

      {/* Rating Modal */}
      {showRating && (
        <RatingModal ride={activeRide} onClose={() => setShowRating(false)} />
      )}
    </div>
  );
};
