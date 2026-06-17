import React, { useState, useEffect } from 'react';
import { rideAPI } from '../services/api';

const RideBookingForm = ({ user, onLogout, onBookingCreated, onViewHistory, activeRideDetected, onViewActiveTracking }) => {
  // Passenger Form States
  const [pickup, setPickup] = useState('');
  const [drop, setDrop] = useState('');
  const [distance, setDistance] = useState(1); // default 1 km
  
  // Feedback States
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Passenger: Book Ride
  const handleBookRide = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const data = await rideAPI.bookRide(user.userId, pickup, drop, parseFloat(distance));
      setSuccess(data.status === 'ACCEPTED' 
        ? 'Ride booked! A driver has been assigned.' 
        : 'Ride requested! Searching for available drivers...'
      );
      
      // Clear input fields
      setPickup('');
      setDrop('');
      setDistance(1);
      
      // Let parent component know a ride was successfully booked
      setTimeout(() => {
        onBookingCreated(data);
      }, 1500);

    } catch (err) {
      console.error('Error booking ride:', err);
      setError(err.response?.data || 'Failed to request ride. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Base fare of 50.0 + 15.0 per km
  const estimatedFare = 50.0 + (distance * 15.0);

  return (
    <div className="glass-card booking-card">
      <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', textAlign: 'left', marginBottom: '2.5rem' }}>
        <div>
          <h2>Book a Ride</h2>
          <p>Welcome back, passenger <strong>{user.name}</strong></p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-secondary" onClick={onViewHistory} style={{ width: 'auto', padding: '0.5rem 1rem' }}>
            History
          </button>
          <button className="btn btn-secondary logout" onClick={onLogout} style={{ width: 'auto', padding: '0.5rem 1rem' }}>
            Logout
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          {success}
        </div>
      )}

      {/* Alert banner if passenger already has a trip active */}
      {activeRideDetected && (
        <div style={{ 
          background: 'rgba(99, 102, 241, 0.08)', 
          border: '1px solid rgba(99, 102, 241, 0.25)', 
          borderRadius: '16px', 
          padding: '1rem 1.25rem', 
          marginBottom: '2rem', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center' 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>🚘</span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-main)', fontWeight: '500' }}>Active Ride Session Detected</span>
          </div>
          <button 
            className="btn btn-primary" 
            onClick={onViewActiveTracking}
            style={{ width: 'auto', padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
          >
            Track Active Ride
          </button>
        </div>
      )}

      <form onSubmit={handleBookRide}>
        <h3 className="mb-4" style={{ fontSize: '1.25rem', color: 'var(--text-bright)' }}>Enter Trip Details</h3>
        <div className="form-group">
          <label className="form-label" htmlFor="pickup">Pickup Location</label>
          <input
            id="pickup"
            type="text"
            className="form-control"
            placeholder="Street Name, Area, City"
            value={pickup}
            onChange={(e) => setPickup(e.target.value)}
            required
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="drop">Dropoff Location</label>
          <input
            id="drop"
            type="text"
            className="form-control"
            placeholder="Destination Landmark, City"
            value={drop}
            onChange={(e) => setDrop(e.target.value)}
            required
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <label className="form-label" htmlFor="distance">Distance (kms)</label>
            <span style={{ fontSize: '0.9rem', color: 'var(--primary)', fontWeight: '600' }}>{distance} km</span>
          </div>
          <input
            id="distance"
            type="range"
            min="1"
            max="50"
            step="0.5"
            style={{ width: '100%', accentColor: 'var(--primary)' }}
            value={distance}
            onChange={(e) => setDistance(parseFloat(e.target.value))}
            disabled={loading}
          />
          <div className="form-helper" style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', background: 'rgba(255,255,255,0.01)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--card-border)' }}>
            <span style={{ fontSize: '0.85rem' }}>Estimated Fare:</span>
            <strong style={{ color: 'var(--success)', fontSize: '1.1rem' }}>₹{estimatedFare.toFixed(2)}</strong>
          </div>
        </div>

        <button type="submit" className="btn btn-primary mt-4" disabled={loading}>
          {loading ? 'Processing Booking...' : 'Request Cab Now'}
        </button>
      </form>
    </div>
  );
};

export default RideBookingForm;
