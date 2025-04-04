// campus-notes-vite/src/context/AuthContext.jsx
import React, { createContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Function to refresh user data from the server
  const refreshUser = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data); // Update user state with latest data, including credits
        } else {
          console.error('Failed to refresh user data');
          localStorage.removeItem('token');
          setUser(null);
        }
      } catch (error) {
        console.error('Error refreshing user data:', error);
        localStorage.removeItem('token');
        setUser(null);
      }
    }
  };

  // On app load, fetch latest user data if token exists
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      refreshUser();
    }
  }, []); // Empty dependency array ensures this runs once on mount

  const login = (token) => {
    localStorage.setItem('token', token);
    try {
      const decoded = jwtDecode(token);
      setUser(decoded);
      // Optionally call refreshUser here to ensure latest data after login
      refreshUser();
    } catch (error) {
      console.error('Failed to decode token:', error);
      localStorage.removeItem('token');
      setUser(null);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => React.useContext(AuthContext);
