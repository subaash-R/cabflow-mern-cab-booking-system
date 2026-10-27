import React from 'react';
import { useRide } from '../context/RideContext';
import { Users, Clock } from 'lucide-react';

export const VehicleSelector = () => {
  const { estimates, selectedCategory, setSelectedCategory, isLoading } = useRide();

  if (isLoading && (!estimates || estimates.length === 0)) {
    return (
      <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        Calculating fastest routes and live fares...
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
      <label className="input-label" style={{ marginBottom: '0.2rem' }}>
        Select Ride Option
      </label>

      {estimates.map((item) => {
        const isSelected = selectedCategory === item.category;

        return (
          <div
            key={item.category}
            onClick={() => setSelectedCategory(item.category)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.85rem 1rem',
              borderRadius: 'var(--radius-md)',
              background: isSelected ? 'rgba(59, 130, 246, 0.12)' : 'rgba(255, 255, 255, 0.03)',
              border: isSelected
                ? '2px solid var(--primary)'
                : '1px solid var(--border-color)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              transform: isSelected ? 'scale(1.01)' : 'scale(1)',
            }}
          >
            {/* Vehicle Icon & Details */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <div
                style={{
                  fontSize: '2rem',
                  background: 'rgba(255, 255, 255, 0.06)',
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {item.icon}
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontWeight: '700', fontSize: '0.95rem' }}>{item.name}</span>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.2rem',
                      fontSize: '0.75rem',
                      color: 'var(--text-muted)',
                    }}
                  >
                    <Users size={12} /> {item.capacity}
                  </span>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    fontSize: '0.78rem',
                    color: 'var(--text-muted)',
                    marginTop: '0.15rem',
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                    <Clock size={12} /> {item.etaMinutes} min away
                  </span>
                  <span>•</span>
                  <span style={{ color: '#38bdf8' }}>{item.tag}</span>
                </div>
              </div>
            </div>

            {/* Price */}
            <div style={{ textAlign: 'right' }}>
              <div
                style={{
                  fontSize: '1.2rem',
                  fontWeight: '800',
                  color: isSelected ? '#60a5fa' : 'var(--text-main)',
                }}
              >
                ${item.fare?.total?.toFixed(2)}
              </div>
              {item.fare?.discount > 0 && (
                <div
                  style={{
                    fontSize: '0.75rem',
                    color: '#10b981',
                    textDecoration: 'none',
                    fontWeight: '600',
                  }}
                >
                  Save ${item.fare.discount.toFixed(2)}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
