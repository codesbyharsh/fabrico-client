import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Check localStorage for user on initial load
  useEffect(() => {
    const storedUser = localStorage.getItem('fabrico_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('fabrico_user', JSON.stringify(userData));
  };

  const logout = async () => {
    try {
      if (user) {
        // Update login status in database
        await axios.put(`http://localhost:5000/api/users/${user._id}/login-status`, {
          isLoggedIn: false
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      localStorage.removeItem('fabrico_user');
    }
  };

  return (
    <AuthContext.Provider value={{
      currentUser: user,
      isLoggedIn: !!user,
      login,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};