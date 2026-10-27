import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Lock, Mail, Phone, Car, ArrowRight, Shield } from 'lucide-react';

export const LoginPage = ({ onSuccess }) => {
  const { login, register, demoLogin } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'customer',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isRegister) {
        await register(formData);
      } else {
        await login(formData.email, formData.password);
      }
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = async (role) => {
    setLoading(true);
    try {
      await demoLogin(role);
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '480px', margin: '3rem auto', padding: '0 1rem' }}>
      <div className="glass-panel" style={{ padding: '2rem' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 0.85rem auto',
            }}
          >
            <Car size={30} color="#ffffff" />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '800' }}>
            {isRegister ? 'Create an Account' : 'Welcome to CabFlow'}
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            {isRegister
              ? 'Join millions of passengers and drivers today'
              : 'Sign in to manage bookings and request rides'}
          </p>
        </div>

        {/* Quick Demo 1-Click Cards */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label className="input-label" style={{ marginBottom: '0.5rem', justifyContent: 'center' }}>
            ⚡ 1-Click Instant Demo Login:
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={() => handleDemo('customer')}
              className="btn btn-secondary btn-sm"
              style={{ padding: '0.6rem 0.4rem', fontSize: '0.78rem' }}
            >
              👤 Passenger
            </button>
            <button
              type="button"
              onClick={() => handleDemo('driver')}
              className="btn btn-secondary btn-sm"
              style={{ padding: '0.6rem 0.4rem', fontSize: '0.78rem' }}
            >
              🛞 Driver
            </button>
            <button
              type="button"
              onClick={() => handleDemo('admin')}
              className="btn btn-secondary btn-sm"
              style={{ padding: '0.6rem 0.4rem', fontSize: '0.78rem' }}
            >
              🛡️ Admin
            </button>
          </div>
        </div>

        <div
          style={{
            textAlign: 'center',
            position: 'relative',
            margin: '1.2rem 0',
          }}
        >
          <span style={{ background: 'var(--bg-card)', padding: '0 0.8rem', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
            OR SIGN IN WITH CREDENTIALS
          </span>
        </div>

        {error && (
          <div
            style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: 'var(--radius-sm)',
              padding: '0.65rem 0.85rem',
              color: '#f87171',
              fontSize: '0.82rem',
              marginBottom: '1rem',
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {isRegister && (
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">
                <User size={13} /> Full Name
              </label>
              <input
                type="text"
                required
                className="input-field"
                placeholder="e.g. John Doe"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
          )}

          <div className="input-group" style={{ marginBottom: 0 }}>
            <label className="input-label">
              <Mail size={13} /> Email Address
            </label>
            <input
              type="email"
              required
              className="input-field"
              placeholder="name@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div className="input-group" style={{ marginBottom: 0 }}>
            <label className="input-label">
              <Lock size={13} /> Password
            </label>
            <input
              type="password"
              required
              className="input-field"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          {isRegister && (
            <>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label">
                  <Phone size={13} /> Phone Number
                </label>
                <input
                  type="tel"
                  className="input-field"
                  placeholder="+1 (555) 000-0000"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label">Account Role</label>
                <select
                  className="input-field"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                >
                  <option value="customer">Passenger (Book Cabs)</option>
                  <option value="driver">Driver Partner (Earn with CabFlow)</option>
                </select>
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.85rem', marginTop: '0.5rem' }}
          >
            {loading ? 'Processing...' : isRegister ? 'Create Account' : 'Sign In'}
            <ArrowRight size={16} />
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.2rem' }}>
          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setError('');
            }}
            style={{
              background: 'none',
              border: 'none',
              color: '#60a5fa',
              fontSize: '0.85rem',
              cursor: 'pointer',
            }}
          >
            {isRegister
              ? 'Already have an account? Sign in here'
              : "Don't have an account? Create one now"}
          </button>
        </div>
      </div>
    </div>
  );
};
