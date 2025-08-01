import React, { createContext, useState, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const login = async (email, password) => {
    try {
      const response = await axios.post('http://localhost:5000/api/users/login', {
        identifier: email,
        password
      });
      
      setCurrentUser(response.data);
      setIsLoggedIn(true);
      localStorage.setItem('user', JSON.stringify(response.data));
      return response.data;
    } catch (error) {
      throw new Error('Login failed');
    }
  };

  const logout = async () => {
    try {
      if (currentUser) {
        await axios.post(`http://localhost:5000/api/users/logout/${currentUser._id}`);
      }
      setCurrentUser(null);
      setIsLoggedIn(false);
      localStorage.removeItem('user');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      isLoggedIn,
      login,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);