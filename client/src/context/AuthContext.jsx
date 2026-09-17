import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  // Mock logged-in user or guest
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('rentora_user');
    return saved ? JSON.parse(saved) : null;
  });

  const login = (email, password, role = 'customer') => {
    const mockUser = {
      id: 'usr_' + Date.now(),
      name: email.split('@')[0].replace('.', ' ').toUpperCase(),
      email: email,
      phone: '+91 98765 43210',
      role: role, // 'customer' | 'vendor'
      city: 'Ahmedabad',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      verified: true
    };
    setUser(mockUser);
    localStorage.setItem('rentora_user', JSON.stringify(mockUser));
    return mockUser;
  };

  const signup = (userData) => {
    const mockUser = {
      id: 'usr_' + Date.now(),
      name: userData.fullName || userData.ownerName || 'Rentora User',
      email: userData.email,
      phone: userData.phone || '+91 98765 43210',
      role: userData.role || 'customer',
      shopName: userData.shopName || '',
      city: userData.city || 'Ahmedabad',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      verified: true
    };
    setUser(mockUser);
    localStorage.setItem('rentora_user', JSON.stringify(mockUser));
    return mockUser;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('rentora_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
