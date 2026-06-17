import React, { useState, useEffect } from 'react';
import Login from './pages/Login';
import Register from './pages/Register';
import RideBookingForm from './pages/RideBookingForm';
import RideStatusScreen from './pages/RideStatusScreen';
import DriverDashboard from './pages/DriverDashboard';
import RideHistoryPage from './pages/RideHistoryPage';
import { rideAPI } from './services/api';

function App() {
  const [user, setUser] = useState(null);
  
  // Views: 
  // For Guest: 'login', 'register'
  // For Passenger: 'dashboard', 'tracking', 'history'
  // For Driver: 'dashboard', 'history'
  const [view, setView] = useState('login'); 
  
  const [activeRideId, setActiveRideId] = useState(null);
  const [hasActiveRide, setHasActiveRide] = useState(false);

  // Restore authenticated session
  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const name = localStorage.getItem('name');
    const userId = localStorage.getItem('userId');
    const email = localStorage.getItem('email');
    const driverId = localStorage.getItem('driverId');

    if (token && role && name && userId) {
      const parsedUser = { 
        token, 
        role, 
        name, 
        userId: parseInt(userId), 
        email,
        driverId: driverId ? parseInt(driverId) : null
      };
      setUser(parsedUser);
      setView('dashboard');
      
      // If passenger, check for active ride
      if (role === 'ROLE_USER') {
        checkActiveRide(parseInt(userId));
      }
    }
  }, []);

  // Check if passenger already has a trip in progress
  const checkActiveRide = async (userId) => {
    try {
      const history = await rideAPI.getRideHistory(userId);
      const active = history.find(ride => ride.status === 'REQUESTED' || ride.status === 'ACCEPTED' || ride.status === 'IN_PROGRESS');
      if (active) {
        setActiveRideId(active.id);
        setHasActiveRide(true);
      } else {
        setHasActiveRide(false);
        setActiveRideId(null);
      }
    } catch (err) {
      console.error('Error checking active ride status:', err);
    }
  };

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    
    // Store in localStorage
    localStorage.setItem('token', userData.token);
    localStorage.setItem('role', userData.role);
    localStorage.setItem('name', userData.name);
    localStorage.setItem('userId', userData.userId);
    localStorage.setItem('email', userData.email || '');
    if (userData.driverId) {
      localStorage.setItem('driverId', userData.driverId);
    }

    setView('dashboard');
    
    if (userData.role === 'ROLE_USER') {
      checkActiveRide(userData.userId);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
    setHasActiveRide(false);
    setActiveRideId(null);
    setView('login');
  };

  const handleBookingCreated = (rideData) => {
    setActiveRideId(rideData.id);
    setHasActiveRide(true);
    setView('tracking');
  };

  const handleBackToBooking = () => {
    if (user) {
      checkActiveRide(user.userId);
      setView('dashboard');
    }
  };

  const isPassenger = user?.role === 'ROLE_USER';
  const isDriver = user?.role === 'ROLE_DRIVER';

  return (
    <div className="app-container">
      {/* Navigation bar */}
      <nav className="app-nav">
        <div className="nav-brand">
          AeroCab <span>Ride Booking</span>
        </div>
        <div className="nav-links">
          {user ? (
            <>
              {isPassenger && (
                <>
                  <span 
                    className={`nav-item ${view === 'dashboard' ? 'active' : ''}`} 
                    onClick={() => setView('dashboard')}
                  >
                    Book Ride
                  </span>
                  {hasActiveRide && (
                    <span 
                      className={`nav-item ${view === 'tracking' ? 'active' : ''}`} 
                      onClick={() => setView('tracking')}
                    >
                      Track Ride
                    </span>
                  )}
                  <span 
                    className={`nav-item ${view === 'history' ? 'active' : ''}`} 
                    onClick={() => setView('history')}
                  >
                    History
                  </span>
                </>
              )}

              {isDriver && (
                <>
                  <span 
                    className={`nav-item ${view === 'dashboard' ? 'active' : ''}`} 
                    onClick={() => setView('dashboard')}
                  >
                    Portal
                  </span>
                  <span 
                    className={`nav-item ${view === 'history' ? 'active' : ''}`} 
                    onClick={() => setView('history')}
                  >
                    History
                  </span>
                </>
              )}
              
              <button className="nav-btn logout" onClick={handleLogout}>Sign Out</button>
            </>
          ) : (
            <>
              <span 
                className={`nav-item ${view === 'login' ? 'active' : ''}`} 
                onClick={() => setView('login')}
              >
                Login
              </span>
              <span 
                className={`nav-item ${view === 'register' ? 'active' : ''}`} 
                onClick={() => setView('register')}
              >
                Register
              </span>
            </>
          )}
        </div>
      </nav>

      {/* Main Content Area */}
      <main>
        {view === 'login' && (
          <Login 
            onLoginSuccess={handleLoginSuccess} 
            onSwitchToRegister={() => setView('register')} 
          />
        )}
        
        {view === 'register' && (
          <Register 
            onSwitchToLogin={() => setView('login')} 
          />
        )}
        
        {view === 'dashboard' && user && isPassenger && (
          <RideBookingForm 
            user={user} 
            onLogout={handleLogout} 
            onBookingCreated={handleBookingCreated}
            onViewHistory={() => setView('history')}
            activeRideDetected={hasActiveRide}
            onViewActiveTracking={() => setView('tracking')}
          />
        )}

        {view === 'tracking' && user && isPassenger && activeRideId && (
          <RideStatusScreen 
            rideId={activeRideId} 
            onBackToBooking={handleBackToBooking}
            user={user}
          />
        )}

        {view === 'dashboard' && user && isDriver && (
          <DriverDashboard 
            user={user} 
            onLogout={handleLogout}
            onViewHistory={() => setView('history')}
          />
        )}

        {view === 'history' && user && (
          <RideHistoryPage 
            user={user}
            onBack={() => setView('dashboard')}
          />
        )}
      </main>

      {/* Footer bar */}
      <footer className="app-footer">
        <p>&copy; 2026 AeroCab Ride-Booking Platform. Built as a Java Spring Boot & React learning module.</p>
      </footer>
    </div>
  );
}

export default App;
