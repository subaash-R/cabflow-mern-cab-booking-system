import React from 'react';
import { X, CheckCircle, Download, Printer } from 'lucide-react';

export const RideReceiptModal = ({ ride, onClose }) => {
  if (!ride) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
          <div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: '800' }}>Trip Invoice & Receipt</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Receipt #{ride._id?.slice(-8) || 'CAB-2026'} • {new Date(ride.createdAt || Date.now()).toLocaleDateString()}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Paid Stamp */}
        <div
          style={{
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: 'var(--radius-md)',
            padding: '0.75rem 1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10b981', fontWeight: '700' }}>
            <CheckCircle size={18} />
            <span>PAYMENT COMPLETED</span>
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#10b981' }}>
            ${ride.fare?.total?.toFixed(2)}
          </div>
        </div>

        {/* Trip Route Details */}
        <div
          style={{
            background: 'rgba(11, 15, 25, 0.5)',
            padding: '0.85rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1rem',
            fontSize: '0.85rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
          }}
        >
          <div>
            <strong style={{ color: '#10b981' }}>Pickup:</strong> {ride.pickup?.address}
          </div>
          <div>
            <strong style={{ color: '#ef4444' }}>Dropoff:</strong> {ride.dropoff?.address}
          </div>
          <div style={{ display: 'flex', gap: '1.5rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            <span>Distance: {ride.distanceKm} km</span>
            <span>Duration: {ride.durationMin} mins</span>
            <span>Category: {ride.cabCategory?.toUpperCase()}</span>
          </div>
        </div>

        {/* Fare Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.85rem', marginBottom: '1.2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
            <span>Base Fare</span>
            <span>${ride.fare?.baseFare?.toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
            <span>Distance & Duration Rate</span>
            <span>${((ride.fare?.distanceFare || 0) + (ride.fare?.timeFare || 0)).toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
            <span>Taxes & Service Fees</span>
            <span>${ride.fare?.tax?.toFixed(2)}</span>
          </div>
          {ride.fare?.discount > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#10b981', fontWeight: '600' }}>
              <span>Promo Discount</span>
              <span>-${ride.fare.discount.toFixed(2)}</span>
            </div>
          )}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontWeight: '800',
              fontSize: '1.05rem',
              borderTop: '1px solid var(--border-color)',
              paddingTop: '0.5rem',
              marginTop: '0.3rem',
            }}
          >
            <span>Total Charged</span>
            <span style={{ color: '#60a5fa' }}>${ride.fare?.total?.toFixed(2)}</span>
          </div>
        </div>

        {/* Footer Actions */}
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={handlePrint} className="btn btn-secondary" style={{ flex: 1 }}>
            <Printer size={16} /> Print Receipt
          </button>
          <button onClick={onClose} className="btn btn-primary" style={{ flex: 1 }}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
