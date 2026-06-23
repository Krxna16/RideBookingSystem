import React, { useState, useEffect } from 'react';
import { rideAPI } from '../services/api';

const DriverDashboard = ({ user, onLogout, onViewHistory }) => {
  const driverId = user.driverId || localStorage.getItem('driverId');

  // Driver States
  const [isAvailable, setIsAvailable] = useState(true);
  const [assignedRides, setAssignedRides] = useState([]);
  const [requestedRides, setRequestedRides] = useState([]);
  
  // Feedback
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (driverId) {
      fetchDriverData(false);

      // Auto-refresh pool and assignments every 5 seconds
      const interval = setInterval(() => {
        fetchDriverData(true);
      }, 5000);

      return () => clearInterval(interval);
    } else {
      setError('Driver identity could not be verified. Try signing in again.');
    }
  }, [driverId]);

  const fetchDriverData = async (silent = false) => {
    if (!silent) {
      setLoading(true);
      setError('');
    }
    try {
      // 1. Fetch assigned rides
      const assignedData = await rideAPI.getAssignedRides(parseInt(driverId));
      setAssignedRides(assignedData);

      // 2. Fetch pending "REQUESTED" rides
      const requestedData = await rideAPI.getRequestedRides();
      setRequestedRides(requestedData);

      // 3. Fetch driver availability status from backend database
      const availability = await rideAPI.getDriverAvailability(parseInt(driverId));
      setIsAvailable(availability);

      // If we had a dashboard load error previously, clear it
      setError(prev => prev === 'Failed to refresh dashboard details.' ? '' : prev);
    } catch (err) {
      console.error('Error fetching driver dashboard data:', err);
      setError('Failed to refresh dashboard details.');
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  };

  // Toggle availability
  const handleToggleAvailability = async () => {
    setError('');
    setSuccess('');
    try {
      const nextState = !isAvailable;
      await rideAPI.toggleDriverAvailability(parseInt(driverId), nextState);
      setIsAvailable(nextState);
      setSuccess(`Availability successfully updated to: ${nextState ? 'ONLINE' : 'OFFLINE'}`);
    } catch (err) {
      console.error('Error toggling availability:', err);
      setError('Could not update availability state.');
    }
  };

  // Accept a pending ride
  const handleAcceptRide = async (rideId) => {
    setError('');
    setSuccess('');
    try {
      await rideAPI.acceptRide(rideId, parseInt(driverId));
      setSuccess(`Ride #${rideId} successfully accepted!`);
      fetchDriverData();
    } catch (err) {
      console.error('Error accepting ride:', err);
      setError(err.response?.data || 'Failed to accept ride. Another driver may have taken it.');
    }
  };

  // Update trip lifecycle status (IN_PROGRESS, COMPLETED, CANCELLED)
  const handleUpdateStatus = async (rideId, status) => {
    setError('');
    setSuccess('');
    try {
      await rideAPI.updateRideStatus(rideId, status, parseInt(driverId));
      setSuccess(`Trip status updated: ${status.replace('_', ' ')}`);
      fetchDriverData();
    } catch (err) {
      console.error(`Error updating status to ${status}:`, err);
      setError(err.response?.data || 'Failed to update trip status.');
    }
  };

  // Metrics calculations
  const activeTrips = assignedRides.filter(r => r.status === 'ACCEPTED' || r.status === 'IN_PROGRESS');
  const completedTrips = assignedRides.filter(r => r.status === 'COMPLETED');
  const totalEarnings = completedTrips.reduce((sum, r) => sum + r.fare, 0);

  return (
    <div className="glass-card booking-card" style={{ maxWidth: '850px' }}>
      {/* Header */}
      <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', textAlign: 'left', marginBottom: '2rem' }}>
        <div>
          <h2>Driver Partner Portal</h2>
          <p>Welcome back, <strong>{user.name}</strong> (Partner ID: #{driverId})</p>
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

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* Driver Controls & Statistics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {/* Availability Card */}
        <div style={{ background: 'rgba(255,255,255,0.015)', border: '1px solid var(--card-border)', borderRadius: '16px', padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'stretch' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '500' }}>DUTY STATUS</span>
            <span style={{ 
              width: '10px', 
              height: '10px', 
              borderRadius: '50%', 
              background: isAvailable ? 'var(--success)' : 'var(--text-muted)',
              boxShadow: isAvailable ? '0 0 8px var(--success)' : 'none'
            }}></span>
          </div>
          <p style={{ fontSize: '1.1rem', fontWeight: '700', color: isAvailable ? 'var(--success)' : 'var(--text-muted)', marginBottom: '0.75rem' }}>
            {isAvailable ? 'ONLINE & READY' : 'OFFLINE'}
          </p>
          <button 
            className="btn btn-secondary" 
            onClick={handleToggleAvailability}
            style={{ padding: '0.4rem', fontSize: '0.8rem', background: isAvailable ? 'rgba(239, 68, 68, 0.08)' : 'rgba(16, 185, 129, 0.08)', color: isAvailable ? 'var(--error)' : 'var(--success)', borderColor: isAvailable ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)' }}
          >
            {isAvailable ? 'Go Offline' : 'Go Online'}
          </button>
        </div>

        {/* Earnings Card */}
        <div style={{ background: 'rgba(255,255,255,0.015)', border: '1px solid var(--card-border)', borderRadius: '16px', padding: '1.25rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '500' }}>TOTAL EARNINGS</span>
          <p style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--success)', marginTop: '0.25rem' }}>₹{totalEarnings.toFixed(2)}</p>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>From {completedTrips.length} completed trips</span>
        </div>

        {/* Assignments Card */}
        <div style={{ background: 'rgba(255,255,255,0.015)', border: '1px solid var(--card-border)', borderRadius: '16px', padding: '1.25rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '500' }}>ACTIVE TASKS</span>
          <p style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--primary)', marginTop: '0.25rem' }}>{activeTrips.length}</p>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Assigned to you</span>
        </div>
      </div>

      {/* Grid for Active Assignments and Available Pool */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {/* Active Assignments */}
        <div>
          <h3 className="mb-4" style={{ fontSize: '1.25rem', color: 'var(--text-bright)', borderBottom: '1px solid var(--card-border)', paddingBottom: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Active Assignments ({activeTrips.length})</span>
            <button className="btn btn-secondary" onClick={() => fetchDriverData(false)} style={{ width: 'auto', padding: '0.25rem 0.75rem', fontSize: '0.85rem' }} disabled={loading}>
              Refresh
            </button>
          </h3>

          {activeTrips.length === 0 ? (
            <div className="text-center" style={{ padding: '2.5rem', border: '1px dashed var(--card-border)', borderRadius: '16px', background: 'rgba(255,255,255,0.01)' }}>
              <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No active bookings currently assigned. Go online or check the requests queue below.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {activeTrips.map(ride => (
                <div key={ride.id} className="history-item" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '1.25rem', background: 'rgba(99, 102, 241, 0.03)', borderColor: 'rgba(99, 102, 241, 0.2)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                        <span className={`status-badge ${ride.status.toLowerCase()}`}>{ride.status}</span>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-bright)', fontWeight: '600' }}>BOOKING #{ride.id}</span>
                      </div>
                      <p style={{ margin: '0.25rem 0', fontSize: '0.95rem' }}>🟢 From: <strong>{ride.pickupLocation}</strong></p>
                      <p style={{ fontSize: '0.95rem' }}>🔴 To: <strong>{ride.dropLocation}</strong></p>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                        Distance: <strong>{ride.distance.toFixed(1)} km</strong> | Passenger ID: <strong>#{ride.userId}</strong>
                      </p>
                    </div>
                    <span style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--success)' }}>₹{ride.fare.toFixed(2)}</span>
                  </div>

                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    {ride.status === 'ACCEPTED' && (
                      <button 
                        className="btn btn-primary" 
                        onClick={() => handleUpdateStatus(ride.id, 'IN_PROGRESS')}
                        style={{ flex: 2 }}
                      >
                        Start Trip
                      </button>
                    )}
                    {ride.status === 'IN_PROGRESS' && (
                      <button 
                        className="btn btn-primary" 
                        onClick={() => handleUpdateStatus(ride.id, 'COMPLETED')}
                        style={{ flex: 2, background: 'linear-gradient(135deg, var(--success) 0%, #059669 100%)', boxShadow: '0 4px 15px var(--success-glow)' }}
                      >
                        Complete Trip
                      </button>
                    )}
                    <button 
                      className="btn btn-secondary" 
                      onClick={() => handleUpdateStatus(ride.id, 'CANCELLED')}
                      style={{ flex: 1, color: 'var(--error)', borderColor: 'rgba(239, 68, 68, 0.2)' }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Requested Pool Queue (Manually claimable) */}
        <div>
          <h3 className="mb-4" style={{ fontSize: '1.25rem', color: 'var(--text-bright)', borderBottom: '1px solid var(--card-border)', paddingBottom: '0.5rem' }}>
            Available Ride Requests Pool ({requestedRides.length})
          </h3>

          {requestedRides.length === 0 ? (
            <div className="text-center" style={{ padding: '2rem', border: '1px dashed var(--card-border)', borderRadius: '16px' }}>
              <p style={{ color: 'var(--text-muted)' }}>No pending ride requests available currently.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {requestedRides.map(ride => (
                <div key={ride.id} className="history-item" style={{ background: 'rgba(255,255,255,0.005)' }}>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: '600' }}>REQUEST #{ride.id}</span>
                    <p style={{ margin: '0.25rem 0', fontSize: '0.9rem' }}>From: <strong>{ride.pickupLocation}</strong></p>
                    <p style={{ fontSize: '0.9rem' }}>To: <strong>{ride.dropLocation}</strong></p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                      Distance: {ride.distance.toFixed(1)} km | Fare: ₹{ride.fare.toFixed(2)}
                    </p>
                  </div>
                  <button 
                    className="btn btn-primary" 
                    onClick={() => handleAcceptRide(ride.id)}
                    style={{ width: 'auto', padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                    disabled={!isAvailable}
                  >
                    Accept Request
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default DriverDashboard;
