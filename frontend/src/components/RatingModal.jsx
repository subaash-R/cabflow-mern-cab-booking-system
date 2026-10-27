import React, { useState } from 'react';
import { X, Star } from 'lucide-react';
import { rideAPI } from '../services/api';

export const RatingModal = ({ ride, onClose }) => {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [review, setReview] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const compliments = ['Punctual Pickup', 'Smooth Driving', 'Clean & Fresh Car', 'Great Navigation', 'Polite Driver'];

  const toggleTag = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const fullReview = [review, selectedTags.join(', ')].filter(Boolean).join(' - ');
      await rideAPI.rate(ride._id, rating, fullReview);
      setSubmitted(true);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '800' }}>Rate Your Trip</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {submitted ? (
          <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🌟</div>
            <h4 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#10b981' }}>Thank you for your feedback!</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Your rating helps keep our community safe and high quality.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            {/* Driver Avatar & Name */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
              <img
                src={ride.driverDetails?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'}
                alt="Driver"
                style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover' }}
              />
              <div style={{ fontWeight: '700', fontSize: '1.05rem' }}>
                {ride.driverDetails?.name || 'Driver Partner'}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {ride.cabCategory?.toUpperCase()} • {ride.driverDetails?.vehicle?.model}
              </div>
            </div>

            {/* Star Picker */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '0.2rem',
                    transition: 'transform 0.15s ease',
                    transform: (hoverRating || rating) >= star ? 'scale(1.15)' : 'scale(1)',
                  }}
                >
                  <Star
                    size={32}
                    color="#fbbf24"
                    fill={(hoverRating || rating) >= star ? '#fbbf24' : 'transparent'}
                  />
                </button>
              ))}
            </div>

            {/* Compliment Chips */}
            <div>
              <label className="input-label" style={{ marginBottom: '0.5rem' }}>
                Give Compliments:
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {compliments.map((comp) => {
                  const isChecked = selectedTags.includes(comp);
                  return (
                    <button
                      key={comp}
                      type="button"
                      onClick={() => toggleTag(comp)}
                      style={{
                        background: isChecked ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                        border: isChecked ? '1px solid #3b82f6' : '1px solid var(--border-color)',
                        color: isChecked ? '#60a5fa' : 'var(--text-muted)',
                        borderRadius: '9999px',
                        padding: '0.3rem 0.75rem',
                        fontSize: '0.78rem',
                        cursor: 'pointer',
                      }}
                    >
                      {comp}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Review Input */}
            <textarea
              className="input-field"
              rows={3}
              placeholder="Leave an optional comment or note about the trip..."
              value={review}
              onChange={(e) => setReview(e.target.value)}
              style={{ resize: 'none' }}
            />

            {/* Action */}
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.85rem' }}
            >
              {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
