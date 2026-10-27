import React from 'react';
import { useRide } from '../context/RideContext';
import { Tag, Info, Check } from 'lucide-react';

export const FareBreakdown = () => {
  const { estimates, selectedCategory, tripInfo, appliedCoupon, removeCoupon } = useRide();

  const currentEstimate = estimates.find((e) => e.category === selectedCategory);
  if (!currentEstimate) return null;

  const { fare } = currentEstimate;

  return (
    <div
      style={{
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-md)',
        padding: '1rem',
        marginTop: '0.75rem',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '0.75rem',
          paddingBottom: '0.5rem',
          borderBottom: '1px solid var(--border-color)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', fontWeight: '600' }}>
          <Info size={14} color="var(--primary)" />
          Trip Fare Breakdown
        </div>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          {tripInfo.distanceKm} km • ~{tripInfo.durationMin} mins
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.85rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
          <span>Base Fare</span>
          <span>${fare.baseFare.toFixed(2)}</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
          <span>Distance & Time Fare</span>
          <span>${(fare.distanceFare + fare.timeFare).toFixed(2)}</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
          <span>Govt Tax & Platform Fee</span>
          <span>${fare.tax.toFixed(2)}</span>
        </div>

        {appliedCoupon && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              color: '#10b981',
              fontWeight: '600',
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Tag size={13} /> Code: {appliedCoupon.code} ({appliedCoupon.discountPercent}% off)
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>-${fare.discount.toFixed(2)}</span>
              <button
                onClick={removeCoupon}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--danger)',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                }}
              >
                Remove
              </button>
            </div>
          </div>
        )}

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '0.5rem',
            paddingTop: '0.5rem',
            borderTop: '1px solid var(--border-color)',
            fontSize: '1.05rem',
            fontWeight: '700',
          }}
        >
          <span>Estimated Total</span>
          <span style={{ color: '#60a5fa', fontSize: '1.25rem' }}>
            ${fare.total.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
};
