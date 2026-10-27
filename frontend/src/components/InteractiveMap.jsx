import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useRide } from '../context/RideContext';

// Helper component to auto fit map bounds
const ChangeMapView = ({ pickup, dropoff, driverPosition }) => {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    const points = [];
    if (pickup?.lat && pickup?.lng) points.push([pickup.lat, pickup.lng]);
    if (dropoff?.lat && dropoff?.lng) points.push([dropoff.lat, dropoff.lng]);
    if (driverPosition?.lat && driverPosition?.lng) points.push([driverPosition.lat, driverPosition.lng]);

    if (points.length >= 2) {
      const bounds = L.latLngBounds(points);
      map.fitBounds(bounds, { padding: [60, 60], maxZoom: 15 });
    } else if (points.length === 1) {
      map.setView(points[0], 13);
    }
  }, [pickup, dropoff, driverPosition, map]);

  return null;
};

// Create custom icons with DivIcon for reliable zero-asset rendering
const createCustomIcon = (emoji, bg, shadowColor) => {
  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `
      <div style="
        background: ${bg};
        color: white;
        width: 38px;
        height: 38px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
        box-shadow: 0 4px 15px ${shadowColor};
        border: 2px solid #ffffff;
      ">
        ${emoji}
      </div>
    `,
    iconSize: [38, 38],
    iconAnchor: [19, 19],
    popupAnchor: [0, -20],
  });
};

const pickupIcon = createCustomIcon('📍', '#10b981', 'rgba(16, 185, 129, 0.6)');
const dropoffIcon = createCustomIcon('🏁', '#ef4444', 'rgba(239, 68, 68, 0.6)');
const cabIcon = createCustomIcon('🚕', '#1e293b', 'rgba(59, 130, 246, 0.5)');
const activeDriverIcon = createCustomIcon('🚖', '#3b82f6', 'rgba(59, 130, 246, 0.8)');

export const InteractiveMap = () => {
  const { pickup, dropoff, nearbyCabs, activeRide, driverPosition } = useRide();

  // Route points
  const routePolyline =
    pickup && dropoff
      ? [
          [pickup.lat, pickup.lng],
          [dropoff.lat, dropoff.lng],
        ]
      : [];

  const centerPosition = pickup ? [pickup.lat, pickup.lng] : [37.7879, -122.4074];

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: '520px' }}>
      <MapContainer
        center={centerPosition}
        zoom={13}
        scrollWheelZoom={true}
        style={{ width: '100%', height: '100%', minHeight: '520px', borderRadius: '16px' }}
      >
        <ChangeMapView pickup={pickup} dropoff={dropoff} driverPosition={driverPosition} />

        {/* Modern dark map tiles from CartoDB */}
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />

        {/* Pickup Marker */}
        {pickup && (
          <Marker position={[pickup.lat, pickup.lng]} icon={pickupIcon}>
            <Popup>
              <strong>Pickup:</strong>
              <br />
              {pickup.address}
            </Popup>
          </Marker>
        )}

        {/* Dropoff Marker */}
        {dropoff && (
          <Marker position={[dropoff.lat, dropoff.lng]} icon={dropoffIcon}>
            <Popup>
              <strong>Destination:</strong>
              <br />
              {dropoff.address}
            </Popup>
          </Marker>
        )}

        {/* Route Line */}
        {routePolyline.length > 0 && (
          <Polyline
            positions={routePolyline}
            pathOptions={{
              color: '#3b82f6',
              weight: 5,
              opacity: 0.85,
              dashArray: activeRide ? '8, 8' : undefined,
            }}
          />
        )}

        {/* Live Active Driver Marker */}
        {driverPosition && (
          <Marker position={[driverPosition.lat, driverPosition.lng]} icon={activeDriverIcon}>
            <Popup>
              <strong>Your Driver:</strong> {activeRide?.driverDetails?.name || 'Assigned Driver'}
              <br />
              Vehicle: {activeRide?.driverDetails?.vehicle?.model || 'Cab'}
              <br />
              Status: <span style={{ textTransform: 'capitalize' }}>{activeRide?.status}</span>
            </Popup>
          </Marker>
        )}

        {/* Nearby Available Cabs on Map (when no active ride) */}
        {!activeRide &&
          nearbyCabs.map((cab) => (
            <Marker
              key={cab._id}
              position={[cab.currentLocation.lat, cab.currentLocation.lng]}
              icon={cabIcon}
            >
              <Popup>
                <strong>{cab.name}</strong> ({cab.vehicle.model})
                <br />
                {cab.vehicle.category.toUpperCase()} • Rating: ⭐ {cab.rating}
                <br />
                ETA: ~{cab.etaMinutes} mins away
              </Popup>
            </Marker>
          ))}
      </MapContainer>

      {/* Map Overlay Badge */}
      <div
        style={{
          position: 'absolute',
          top: '16px',
          right: '16px',
          zIndex: 400,
          background: 'rgba(19, 27, 46, 0.92)',
          padding: '0.5rem 1rem',
          borderRadius: '9999px',
          border: '1px solid var(--border-color)',
          fontSize: '0.85rem',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          boxShadow: 'var(--shadow-card)',
        }}
      >
        <span
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: '#10b981',
            display: 'inline-block',
          }}
        />
        {activeRide
          ? `Ride Status: ${activeRide.status.toUpperCase()}`
          : `${nearbyCabs.length} Cabs nearby`}
      </div>
    </div>
  );
};
