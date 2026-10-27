import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { RideProvider } from './context/RideContext';
import { Navbar } from './components/Navbar';
import { HomePage } from './pages/HomePage';
import { MyRidesPage } from './pages/MyRidesPage';
import { DriverDashboardPage } from './pages/DriverDashboardPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { LoginPage } from './pages/LoginPage';
import { Car, Heart } from 'lucide-react';

function AppContent() {
  const [currentTab, setCurrentTab] = useState('booking');

  return (
    <div className="app-container">
      <Navbar currentTab={currentTab} setCurrentTab={setCurrentTab} />

      <main className="main-content">
        {currentTab === 'booking' && <HomePage />}
        {currentTab === 'my-rides' && <MyRidesPage onRebook={() => setCurrentTab('booking')} />}
        {currentTab === 'driver' && <DriverDashboardPage />}
        {currentTab === 'admin' && <AdminDashboardPage />}
        {currentTab === 'login' && <LoginPage onSuccess={() => setCurrentTab('booking')} />}
      </main>

      {/* Footer */}
      <footer
        style={{
          borderTop: '1px solid var(--border-color)',
          padding: '1.5rem 2rem',
          textAlign: 'center',
          fontSize: '0.85rem',
          color: 'var(--text-muted)',
          background: 'rgba(11, 15, 25, 0.95)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '700', color: 'var(--text-main)' }}>
            <Car size={18} color="#3b82f6" /> CabFlow MERN Stack System
          </div>
          <div>
            Built with React, Express, MongoDB, Node.js & Leaflet Maps
          </div>
          <div>
            &copy; {new Date().getFullYear()} CabFlow Technologies Inc. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <RideProvider>
        <AppContent />
      </RideProvider>
    </AuthProvider>
  );
}
