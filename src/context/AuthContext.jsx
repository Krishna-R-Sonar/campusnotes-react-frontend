// campusnotes-react-frontend/src/context/AuthContext.jsx
import React, { createContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const refreshUser = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          const decoded = jwtDecode(token);

          // Fetch free analyses remaining from backend
          const analysisRes = await fetch(`${import.meta.env.VITE_API_URL}/api/notes/analyze-limit`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const analysisData = await analysisRes.json();

          setUser({
            ...decoded,
            ...data,
            freeAnalysesRemaining: analysisData.freeAnalysesRemaining || 3,
            purchasedAnalysesRemaining: data.analysisPacks * 3 || 0,
          });
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

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      refreshUser();
    }
  }, []);

  const login = (token) => {
    localStorage.setItem('token', token);
    try {
      const decoded = jwtDecode(token);
      setUser(decoded);
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