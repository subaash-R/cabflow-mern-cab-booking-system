import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Car, Shield, User, LogOut, Compass, FileText, CheckCircle2 } from 'lucide-react';

export const Navbar = ({ currentTab, setCurrentTab }) => {
  const { user, isAuthenticated, demoLogin, logout } = useAuth();

  const handleDemoSwitch = async (role) => {
    try {
      await demoLogin(role);
      if (role === 'driver') setCurrentTab('driver');
      else if (role === 'admin') setCurrentTab('admin');
      else setCurrentTab('booking');
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <>
      {/* Quick Demo Switcher Bar */}
      <div className="demo-banner">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <span className="badge badge-primary">Demo Mode</span>
          <span style={{ color: 'var(--text-muted)' }}>
            Switch roles instantly to test any workflow:
          </span>
        </div>
        <div className="demo-buttons">
          <button
            onClick={() => handleDemoSwitch('customer')}
            className={`btn btn-sm ${user?.role === 'customer' ? 'btn-primary' : 'btn-secondary'}`}
          >
            👤 Demo Passenger
          </button>
          <button
            onClick={() => handleDemoSwitch('driver')}
            className={`btn btn-sm ${user?.role === 'driver' ? 'btn-success' : 'btn-secondary'}`}
          >
            🛞 Demo Driver
          </button>
          <button
            onClick={() => handleDemoSwitch('admin')}
            className={`btn btn-sm ${user?.role === 'admin' ? 'btn-primary' : 'btn-secondary'}`}
          >
            🛡️ Demo Admin
          </button>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <nav className="navbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <a
            href="#booking"
            onClick={(e) => {
              e.preventDefault();
              setCurrentTab('booking');
            }}
            className="nav-brand"
          >
            <div
              style={{
                width: '36px',
                height: '36px',
                background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)',
              }}
            >
              <Car size={22} color="#ffffff" />
            </div>
            <div>
              Cab<span>Flow</span>
            </div>
          </a>

          <div className="nav-links">
            <button
              onClick={() => setCurrentTab('booking')}
              className={`nav-link ${currentTab === 'booking' ? 'active' : ''}`}
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            >
              <Compass size={17} />
              Book Ride
            </button>

            <button
              onClick={() => setCurrentTab('my-rides')}
              className={`nav-link ${currentTab === 'my-rides' ? 'active' : ''}`}
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            >
              <FileText size={17} />
              My Rides
            </button>

            <button
              onClick={() => setCurrentTab('driver')}
              className={`nav-link ${currentTab === 'driver' ? 'active' : ''}`}
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            >
              <Car size={17} />
              Driver Mode
            </button>

            <button
              onClick={() => setCurrentTab('admin')}
              className={`nav-link ${currentTab === 'admin' ? 'active' : ''}`}
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            >
              <Shield size={17} />
              Admin Portal
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <img
                src={user.avatar}
                alt={user.name}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '2px solid var(--border-focus)',
                }}
              />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>{user.name}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                  {user.role}
                </span>
              </div>
              <button
                onClick={logout}
                className="btn btn-secondary btn-sm"
                title="Log Out"
                style={{ padding: '0.45rem' }}
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <button onClick={() => setCurrentTab('login')} className="btn btn-primary btn-sm">
              <User size={16} />
              Sign In
            </button>
          )}
        </div>
      </nav>
    </>
  );
};
