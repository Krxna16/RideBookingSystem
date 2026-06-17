import React, { useState, useEffect } from 'react';
import { rideAPI } from '../services/api';

const RideStatusScreen = ({ rideId, onBackToBooking, user }) => {
  const [ride, setRide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchRideDetails();
    
    // Auto-refresh status every 8 seconds
    const interval = setInterval(fetchRideDetails, 8000);
    return () => clearInterval(interval);
  }, [rideId]);

  const fetchRideDetails = async () => {
    setError('');
    try {
      const data = await rideAPI.getRideDetails(rideId);
      setRide(data);
    } catch (err) {
      console.error('Error fetching ride details:', err);
      setError('Could not fetch active ride updates.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRide = async () => {
    if (!window.confirm('Are you sure you want to cancel this ride request?')) return;
    
    setActionLoading(true);
    setError('');
    try {
      const data = await rideAPI.updateRideStatus(rideId, 'CANCELLED');
      setRide(data);
      alert('Ride request has been successfully cancelled.');
    } catch (err) {
      console.error('Error cancelling ride:', err);
      setError(err.response?.data || 'Failed to cancel the ride. It may have progressed already.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading && !ride) {
    return (
      <div className="glass-card booking-card text-center" style={{ padding: '4rem 2rem' }}>
        <p style={{ color: 'var(--text-muted)' }}>Connecting to AeroCab tracking system...</p>
      </div>
    );
  }

  if (!ride) {
    return (
      <div className="glass-card booking-card text-center" style={{ padding: '4rem 2rem' }}>
        <p style={{ color: 'var(--error)', marginBottom: '1.5rem' }}>Active ride data could not be recovered.</p>
        <button className="btn btn-primary" onClick={onBackToBooking}>Return to Booking</button>
      </div>
    );
  }

  // Active status index for tracking progress
  // STATUSES: REQUESTED -> ACCEPTED -> IN_PROGRESS -> COMPLETED
  const statuses = ['REQUESTED', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED'];
  const currentStatus = ride.status.toUpperCase();
  const currentStep = statuses.indexOf(currentStatus);
  const isCancelled = currentStatus === 'CANCELLED';

  return (
    <div className="glass-card booking-card">
      <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', textAlign: 'left', marginBottom: '2rem' }}>
        <div>
          <h2>Ride Tracking</h2>
          <p>Real-time status updates for Booking #{ride.id}</p>
        </div>
        <button className="btn btn-secondary" onClick={onBackToBooking} style={{ width: 'auto', padding: '0.5rem 1rem' }}>
          New Booking
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* Progress Lifecycle Timeline */}
      {!isCancelled ? (
        <div style={{ margin: '2rem 0', padding: '1rem', background: 'rgba(255,255,255,0.01)', borderRadius: '16px', border: '1px solid var(--card-border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', marginBottom: '1rem' }}>
            {/* Background progress bar */}
            <div style={{ 
              position: 'absolute', 
              top: '15px', 
              left: '5%', 
              right: '5%', 
              height: '3px', 
              background: 'rgba(255,255,255,0.08)', 
              zIndex: 1 
            }}></div>
            
            {/* Active progress bar highlight */}
            {currentStep > 0 && (
              <div style={{ 
                position: 'absolute', 
                top: '15px', 
                left: '5%', 
                width: `${(currentStep / (statuses.length - 1)) * 90}%`, 
                height: '3px', 
                background: 'linear-gradient(to right, var(--primary), var(--secondary))', 
                zIndex: 2,
                transition: 'width 0.5s ease'
              }}></div>
            )}

            {statuses.map((status, index) => {
              const active = index <= currentStep;
              const current = index === currentStep;
              return (
                <div key={status} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 3, width: '22%' }}>
                  <div style={{ 
                    width: '30px', 
                    height: '30px', 
                    borderRadius: '50%', 
                    background: current 
                      ? 'var(--primary)' 
                      : (active ? 'var(--success)' : '#101524'), 
                    border: `2px solid ${current ? 'var(--primary)' : (active ? 'var(--success)' : 'var(--card-border)')}`,
                    boxShadow: current ? '0 0 12px var(--primary)' : 'none',
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    color: active ? '#ffffff' : 'var(--text-muted)',
                    fontSize: '0.8rem',
                    fontWeight: 'bold',
                    transition: 'all 0.3s ease'
                  }}>
                    {index + 1}
                  </div>
                  <span style={{ 
                    fontSize: '0.7rem', 
                    fontWeight: current ? '700' : '500', 
                    color: current 
                      ? 'var(--text-bright)' 
                      : (active ? 'var(--text-main)' : 'var(--text-muted)'),
                    marginTop: '0.5rem',
                    textAlign: 'center',
                    textTransform: 'uppercase',
                    letterSpacing: '0.02em'
                  }}>
                    {status.replace('_', ' ')}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="alert alert-error" style={{ background: 'rgba(239, 68, 68, 0.08)', justifyContent: 'center', fontWeight: '600', padding: '1.5rem' }}>
          🛑 THIS RIDE HAS BEEN CANCELLED
        </div>
      )}

      {/* Ride Details Panel */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '2rem' }}>
        <div style={{ background: 'rgba(255,255,255,0.015)', border: '1px solid var(--card-border)', borderRadius: '16px', padding: '1.25rem' }}>
          <h3 style={{ fontSize: '1rem', color: 'var(--text-bright)', marginBottom: '1rem', borderBottom: '1px solid var(--card-border)', paddingBottom: '0.5rem' }}>
            Trip Parameters
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.9rem' }}>
            <div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Pickup Location</p>
              <p style={{ fontWeight: '600', color: 'var(--text-main)' }}>{ride.pickupLocation}</p>
            </div>
            <div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Drop Location</p>
              <p style={{ fontWeight: '600', color: 'var(--text-main)' }}>{ride.dropLocation}</p>
            </div>
            <div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Distance</p>
              <p style={{ fontWeight: '600', color: 'var(--text-main)' }}>{ride.distance.toFixed(1)} km</p>
            </div>
            <div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Fare Charged</p>
              <p style={{ fontWeight: '700', color: 'var(--success)', fontSize: '1.1rem' }}>₹{ride.fare.toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Driver Details card */}
        {ride.driverId ? (
          <div style={{ 
            background: 'rgba(99, 102, 241, 0.04)', 
            border: '1px solid rgba(99, 102, 241, 0.15)', 
            borderRadius: '16px', 
            padding: '1.25rem',
            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.05)'
          }}>
            <h3 style={{ fontSize: '1rem', color: 'var(--primary)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>🚘</span> Driver Allocated
            </h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ fontSize: '0.95rem', fontWeight: '600', color: 'var(--text-bright)' }}>AeroCab Partner ID #{ride.driverId}</p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  Trip assigned and updated.
                </p>
              </div>
              <div className="status-badge accepted" style={{ animation: 'none', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--success)', borderColor: 'rgba(16, 185, 129, 0.3)' }}>
                EN ROUTE
              </div>
            </div>
          </div>
        ) : (
          !isCancelled && (
            <div style={{ 
              background: 'rgba(245, 158, 11, 0.03)', 
              border: '1px solid rgba(245, 158, 11, 0.15)', 
              borderRadius: '16px', 
              padding: '1.25rem', 
              textAlign: 'center' 
            }}>
              <p style={{ color: 'var(--warning)', fontWeight: '600', marginBottom: '0.25rem' }}>
                ⏳ Allocating Driver...
              </p>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Searching for closest available AeroCab driver partners. Please hold.
              </p>
            </div>
          )
        )}
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '1rem' }}>
        {/* Only allow cancellation if requested or accepted, and not cancelled/completed */}
        {(currentStatus === 'REQUESTED' || currentStatus === 'ACCEPTED') && (
          <button 
            className="btn btn-secondary" 
            onClick={handleCancelRide}
            disabled={actionLoading}
            style={{ color: 'var(--error)', borderColor: 'rgba(239, 68, 68, 0.25)', flex: 1 }}
          >
            {actionLoading ? 'Cancelling Trip...' : 'Cancel Request'}
          </button>
        )}
        
        <button className="btn btn-primary" onClick={fetchRideDetails} style={{ flex: 1 }}>
          Refresh Track
        </button>
      </div>
    </div>
  );
};

export default RideStatusScreen;
