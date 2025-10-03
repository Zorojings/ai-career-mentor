import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { account } from './lib/appwrite';

// Import your page components
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkUserSession() {
      try {
        const currentUser = await account.get();
        setUser(currentUser);
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    checkUserSession();
  }, []);

  if (loading) {
    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white"></div>
        </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-900 text-white">
        <Routes>
          {/* If no user, show Auth page. If user exists, redirect to dashboard */}
          <Route path="/" element={!user ? <Auth /> : <Navigate to="/dashboard" />} />
          
          {/* Dashboard Page - Only accessible if a user is logged in */}
          <Route 
            path="/dashboard" 
            element={user ? <Dashboard user={user} setUser={setUser} /> : <Navigate to="/" />} 
          />
          
          {/* Profile Page - Only accessible if a user is logged in */}
          <Route 
            path="/profile" 
            element={user ? <Profile user={user} /> : <Navigate to="/" />} 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;