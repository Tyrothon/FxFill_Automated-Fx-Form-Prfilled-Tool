import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const savedAuth = localStorage.getItem('isAuthenticated');
    return savedAuth ? JSON.parse(savedAuth) : false;
  });

  const defaultUser = {
    email: '',
    fullName: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    avatarUrl: '',
    notifications: true,
  };

  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : defaultUser;
  });

  useEffect(() => {
    localStorage.setItem('isAuthenticated', JSON.stringify(isAuthenticated));
  }, [isAuthenticated]);

  useEffect(() => {
    localStorage.setItem('user', JSON.stringify(user));
  }, [user]);

  const login = (email) => {
    setIsAuthenticated(true);
    if (email) {
      setUser(prev => ({ ...prev, email }));
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
  };

  const updateProfile = (updates) => {
    setUser(prev => ({ ...prev, ...updates }));
  };

  const setNotifications = (enabled) => {
    setUser(prev => ({ ...prev, notifications: !!enabled }));
  };

  const setAvatar = (avatarUrl) => {
    setUser(prev => ({ ...prev, avatarUrl }));
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, user, updateProfile, setNotifications, setAvatar }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};