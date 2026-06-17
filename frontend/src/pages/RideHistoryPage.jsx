import React, { useState, useEffect } from 'react';
import { rideAPI } from '../services/api';

const RideHistoryPage = ({ user, onBack }) => {
  const isDriver = user.role === 'ROLE_DRIVER';
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoading(true);
    setError('');
    try {
      let data = [];
      if (isDriver) {
        // For drivers, fetch using user.driverId (resolved from login AuthResponse)
        const driverId = user.driverId || localStorage.getItem('driverId');
        if (driverId) {
          data = await rideAPI.getAssignedRides(parseInt(driverId));
        } else {
          setError('Driver profile ID not loaded correctly. Try logging in again.');
        }
      } else {
        // For passengers, fetch using user.userId
        data = await rideAPI.getRideHistory(user.userId);
      }
      // Sort: Newest first
      data.sort((a, b) => new Date(b.requestTime) - new Date(a.requestTime));
      setRides(data);
    } catch (err) {
      console.error('Error fetching history:', err);
      setError('Could not retrieve ride history. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filteredRides = rides.filter(ride => {
    const matchesSearch = 
      ride.pickupLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ride.dropLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ride.id.toString().includes(searchTerm);
      
    const matchesStatus = statusFilter === 'ALL' || ride.status.toUpperCase() === statusFilter.toUpperCase();
    
    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  return (
    <div className="glass-card booking-card" style={{ maxWidth: '900px' }}>
      <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', textAlign: 'left', marginBottom: '2rem' }}>
        <div>
          <h2>Ride History</h2>
          <p>Review your {isDriver ? 'assigned' : 'booked'} trips on AeroCab</p>
        </div>
        <button className="btn btn-secondary" onClick={onBack} style={{ width: 'auto', padding: '0.5rem 1rem' }}>
          Back to Dashboard
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* Filter and Search Bar */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem', background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '16px', border: '1px solid var(--card-border)' }}>
        <div style={{ flex: '1', minWidth: '200px' }}>
          <label className="form-label" style={{ fontSize: '0.75rem' }}>Search Location / Ride ID</label>
          <input 
            type="text" 
            className="form-control" 
            placeholder="Type here..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div style={{ width: '150px' }}>
          <label className="form-label" style={{ fontSize: '0.75rem' }}>Status Filter</label>
          <select 
            className="form-control"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ appearance: 'none', backgroundImage: 'radial-gradient(circle, var(--primary) 10%, transparent 11%)' }}
          >
            <option value="ALL">All Statuses</option>
            <option value="REQUESTED">Requested</option>
            <option value="ACCEPTED">Accepted</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end' }}>
          <button className="btn btn-secondary" onClick={fetchHistory} style={{ height: '44px', width: 'auto' }} disabled={loading}>
            Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center" style={{ padding: '3rem 0' }}>
          <p style={{ color: 'var(--text-muted)' }}>Loading history records...</p>
        </div>
      ) : filteredRides.length === 0 ? (
        <div className="text-center" style={{ padding: '4rem 1rem', border: '1px dashed var(--card-border)', borderRadius: '16px' }}>
          <p style={{ color: 'var(--text-muted)' }}>No history entries found matching criteria.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filteredRides.map((ride) => (
            <div key={ride.id} className="history-item" style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem', background: 'rgba(255,255,255,0.015)' }}>
              <div style={{ flex: '1', minWidth: '250px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                  <span className={`status-badge ${ride.status.toLowerCase()}`}>{ride.status}</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '500' }}>RIDE #{ride.id}</span>
                </div>
                <div style={{ fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <p>🟢 Pickup: <strong>{ride.pickupLocation}</strong></p>
                  <p>🔴 Drop: <strong>{ride.dropLocation}</strong></p>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                  📅 Requested on {formatDate(ride.requestTime)}
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'center', minWidth: '100px' }}>
                <span style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-bright)' }}>₹{ride.fare.toFixed(2)}</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{ride.distance.toFixed(1)} km</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--primary)', marginTop: '0.25rem', fontWeight: '500' }}>
                  {isDriver ? `Rider ID: #${ride.userId}` : (ride.driverId ? `Driver ID: #${ride.driverId}` : 'No driver yet')}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RideHistoryPage;
