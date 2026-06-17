import React, { useState } from 'react';
import { authAPI } from '../services/api';

const Register = ({ onSwitchToLogin }) => {
  const [role, setRole] = useState('USER'); // USER or DRIVER
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Driver specific fields
  const [phone, setPhone] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (role === 'USER') {
        await authAPI.registerUser(name, email, password);
        setSuccess('Passenger registered successfully! You can now log in.');
      } else {
        await authAPI.registerDriver(name, email, password, phone, vehicleNumber);
        setSuccess('Driver registered successfully! You can now log in.');
      }
      
      // Clear fields
      setName('');
      setEmail('');
      setPassword('');
      setPhone('');
      setVehicleNumber('');
    } catch (err) {
      setError(err.response?.data || 'Registration failed. Please check inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card">
      <div className="card-header">
        <h2>Create Account</h2>
        <p>Register as a passenger or driver partner</p>
      </div>

      <div className="role-selector">
        <button
          type="button"
          className={`role-btn ${role === 'USER' ? 'active' : ''}`}
          onClick={() => { setRole('USER'); setError(''); setSuccess(''); }}
          disabled={loading}
        >
          Passenger
        </button>
        <button
          type="button"
          className={`role-btn ${role === 'DRIVER' ? 'active' : ''}`}
          onClick={() => { setRole('DRIVER'); setError(''); setSuccess(''); }}
          disabled={loading}
        >
          Driver Partner
        </button>
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

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label" htmlFor="reg-name">Full Name</label>
          <input
            id="reg-name"
            type="text"
            className="form-control"
            placeholder="John Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="reg-email">Email Address</label>
          <input
            id="reg-email"
            type="email"
            className="form-control"
            placeholder="john@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="reg-password">Password</label>
          <input
            id="reg-password"
            type="password"
            className="form-control"
            placeholder="Min 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            disabled={loading}
          />
        </div>

        {role === 'DRIVER' && (
          <>
            <div className="form-group">
              <label className="form-label" htmlFor="reg-phone">Phone Number</label>
              <input
                id="reg-phone"
                type="tel"
                className="form-control"
                placeholder="+1 234 567 8900"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-vehicle">Vehicle Number Plate</label>
              <input
                id="reg-vehicle"
                type="text"
                className="form-control"
                placeholder="ABC-1234"
                value={vehicleNumber}
                onChange={(e) => setVehicleNumber(e.target.value)}
                required
                disabled={loading}
              />
            </div>
          </>
        )}

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Processing...' : 'Register'}
        </button>
      </form>

      <div className="card-switch">
        Already have an account? 
        <span onClick={onSwitchToLogin}>Login here</span>
      </div>
    </div>
  );
};

export default Register;
