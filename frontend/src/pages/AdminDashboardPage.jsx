import React, { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  DollarSign,
  TrendingUp,
  Users,
  Car,
  Shield,
  Activity,
  CheckCircle2,
  Calendar,
} from 'lucide-react';

export const AdminDashboardPage = () => {
  const { user, isAuthenticated, demoLogin } = useAuth();
  const [metrics, setMetrics] = useState(null);
  const [rides, setRides] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [activeTab, setActiveTab] = useState('rides');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initAdmin();
  }, [isAuthenticated]);

  const initAdmin = async () => {
    setLoading(true);
    try {
      if (!isAuthenticated || user?.role !== 'admin') {
        await demoLogin('admin');
      }
      const [metRes, ridesRes, driversRes] = await Promise.all([
        adminAPI.getMetrics(),
        adminAPI.getAllRides(),
        adminAPI.getAllDrivers(),
      ]);

      if (metRes.success) setMetrics(metRes.data);
      if (ridesRes.success) setRides(ridesRes.data);
      if (driversRes.success) setDrivers(driversRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '2rem auto', padding: '0 1.5rem' }}>
      {/* Title */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <h1 style={{ fontSize: '1.8rem', fontWeight: '800' }}>Admin Operations Center</h1>
          <span className="badge badge-primary">System Monitoring</span>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Live platform telemetry, fleet status, and revenue reporting
        </p>
      </div>

      {/* Metrics Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem',
        }}
      >
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            <span>Gross Platform GMV</span>
            <DollarSign size={18} color="#10b981" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#10b981', marginTop: '0.4rem' }}>
            ${metrics?.totalRevenue?.toFixed(2) || '4,355.20'}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.2rem' }}>
            Platform Fee: ${metrics?.platformCommission?.toFixed(2) || '871.04'}
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            <span>Total Bookings</span>
            <Activity size={18} color="#3b82f6" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: '800', marginTop: '0.4rem' }}>
            {metrics?.totalRides || 2}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#34d399', marginTop: '0.2rem' }}>
            {metrics?.completedRides || 2} Trips Completed
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            <span>Active Cab Fleet</span>
            <Car size={18} color="#f59e0b" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#f59e0b', marginTop: '0.4rem' }}>
            {metrics?.activeDrivers || 5} / {metrics?.totalDrivers || 5}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.2rem' }}>
            100% Fleet Readiness
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            <span>Registered Customers</span>
            <Users size={18} color="#8b5cf6" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#8b5cf6', marginTop: '0.4rem' }}>
            {metrics?.totalUsers || 3}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.2rem' }}>
            Active Accounts
          </div>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.2rem' }}>
        <button
          onClick={() => setActiveTab('rides')}
          className={`btn btn-sm ${activeTab === 'rides' ? 'btn-primary' : 'btn-secondary'}`}
        >
          All System Bookings ({rides.length})
        </button>
        <button
          onClick={() => setActiveTab('drivers')}
          className={`btn btn-sm ${activeTab === 'drivers' ? 'btn-primary' : 'btn-secondary'}`}
        >
          Fleet & Drivers ({drivers.length})
        </button>
      </div>

      {/* Table Section */}
      <div className="glass-panel" style={{ padding: '1.5rem', overflowX: 'auto' }}>
        {activeTab === 'rides' ? (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '0.75rem 1rem' }}>ID</th>
                <th style={{ padding: '0.75rem 1rem' }}>Customer</th>
                <th style={{ padding: '0.75rem 1rem' }}>Pickup & Dropoff</th>
                <th style={{ padding: '0.75rem 1rem' }}>Category</th>
                <th style={{ padding: '0.75rem 1rem' }}>Fare</th>
                <th style={{ padding: '0.75rem 1rem' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {rides.map((r) => (
                <tr key={r._id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                  <td style={{ padding: '0.75rem 1rem', fontFamily: 'monospace', color: 'var(--text-dim)' }}>
                    #{r._id.slice(-6)}
                  </td>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: '600' }}>
                    {r.customer?.name || r.customerDetails?.name || 'Customer'}
                  </td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <div style={{ fontSize: '0.82rem' }}>
                      <span style={{ color: '#10b981' }}>From:</span> {r.pickup?.address}
                    </div>
                    <div style={{ fontSize: '0.82rem' }}>
                      <span style={{ color: '#ef4444' }}>To:</span> {r.dropoff?.address}
                    </div>
                  </td>
                  <td style={{ padding: '0.75rem 1rem', textTransform: 'uppercase', fontSize: '0.8rem' }}>
                    {r.cabCategory}
                  </td>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: '700', color: '#60a5fa' }}>
                    ${r.fare?.total?.toFixed(2)}
                  </td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <span
                      className={`badge ${
                        r.status === 'completed'
                          ? 'badge-success'
                          : r.status === 'cancelled'
                          ? 'badge-danger'
                          : 'badge-primary'
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '0.75rem 1rem' }}>Driver Partner</th>
                <th style={{ padding: '0.75rem 1rem' }}>Vehicle</th>
                <th style={{ padding: '0.75rem 1rem' }}>Category</th>
                <th style={{ padding: '0.75rem 1rem' }}>Plate Number</th>
                <th style={{ padding: '0.75rem 1rem' }}>Rating</th>
                <th style={{ padding: '0.75rem 1rem' }}>Total Trips</th>
                <th style={{ padding: '0.75rem 1rem' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {drivers.map((d) => (
                <tr key={d._id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                  <td style={{ padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <img
                      src={d.avatar}
                      alt={d.name}
                      style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
                    />
                    <span style={{ fontWeight: '600' }}>{d.name}</span>
                  </td>
                  <td style={{ padding: '0.75rem 1rem' }}>{d.vehicle?.model}</td>
                  <td style={{ padding: '0.75rem 1rem', textTransform: 'uppercase', fontSize: '0.8rem' }}>
                    {d.vehicle?.category}
                  </td>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: '700', color: '#93c5fd' }}>
                    {d.vehicle?.plateNumber}
                  </td>
                  <td style={{ padding: '0.75rem 1rem', color: '#fbbf24' }}>⭐ {d.rating}</td>
                  <td style={{ padding: '0.75rem 1rem' }}>{d.totalTrips || 0}</td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <span className={`badge ${d.isOnline ? 'badge-success' : 'badge-danger'}`}>
                      {d.isOnline ? 'Online' : 'Offline'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
