import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [roles, setRoles] = useState([]);
  const [customerProfile, setCustomerProfile] = useState(null);
  const [vendorProfile, setVendorProfile] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Derive helper flags
  const isCustomer = roles.includes('CUSTOMER');
  const isVendor = roles.includes('VENDOR');
  const isSuperAdmin = roles.includes('SUPER_ADMIN');

  // Derive primary role for navigation
  const primaryRole = isSuperAdmin ? 'SUPER_ADMIN' : isVendor ? 'VENDOR' : isCustomer ? 'CUSTOMER' : null;

  // Initialize auth state from local storage and verify with backend
  const checkAuth = useCallback(async () => {
    try {
      const savedToken = localStorage.getItem('rentora_token');
      const savedUserData = localStorage.getItem('rentora_user');

      if (savedUserData) {
        try {
          const parsed = JSON.parse(savedUserData);
          setUser(parsed.user || parsed);
          setRoles(parsed.roles || (parsed.role ? [parsed.role.toUpperCase()] : ['CUSTOMER']));
          setCustomerProfile(parsed.customerProfile || null);
          setVendorProfile(parsed.vendorProfile || null);
        } catch {
          // ignore corrupted local state
        }
      }

      if (savedToken) {
        setAccessToken(savedToken);
        // Verify with live backend session
        const response = await api.get('/auth/me');
        if (response.data?.success) {
          const { user: fetchedUser, roles: fetchedRoles, customerProfile: cp, vendorProfile: vp } = response.data.data;
          setUser(fetchedUser);
          setRoles(fetchedRoles || []);
          setCustomerProfile(cp);
          setVendorProfile(vp);
          localStorage.setItem('rentora_user', JSON.stringify({
            user: fetchedUser,
            roles: fetchedRoles,
            customerProfile: cp,
            vendorProfile: vp
          }));
        }
      }
    } catch {
      // If verification fails, clear invalid session
      localStorage.removeItem('rentora_token');
      localStorage.removeItem('rentora_refresh_token');
      localStorage.removeItem('rentora_user');
      setUser(null);
      setRoles([]);
      setCustomerProfile(null);
      setVendorProfile(null);
      setAccessToken(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  /**
   * Log in user against backend /api/v1/auth/login
   */
  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', {
        email: email.trim(),
        password
      });

      const { user: loggedInUser, roles: userRoles, customerProfile: cp, vendorProfile: vp, accessToken: token, refreshToken } = response.data.data;

      setUser(loggedInUser);
      setRoles(userRoles || []);
      setCustomerProfile(cp);
      setVendorProfile(vp);
      setAccessToken(token);

      localStorage.setItem('rentora_token', token);
      if (refreshToken) {
        localStorage.setItem('rentora_refresh_token', refreshToken);
      }
      localStorage.setItem('rentora_user', JSON.stringify({
        user: loggedInUser,
        roles: userRoles,
        customerProfile: cp,
        vendorProfile: vp
      }));

      const primary = (userRoles || []).includes('SUPER_ADMIN')
        ? 'SUPER_ADMIN'
        : (userRoles || []).includes('VENDOR')
        ? 'VENDOR'
        : 'CUSTOMER';

      return {
        success: true,
        user: loggedInUser,
        roles: userRoles,
        primaryRole: primary
      };
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Login failed. Please check your credentials.';
      const errors = error.response?.data?.errors;
      throw new Error(message, { cause: errors });
    }
  };

  /**
   * Register Customer or Vendor against backend /api/v1/auth/register
   */
  const signup = async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);

      const { user: registeredUser, roles: userRoles, customerProfile: cp, vendorProfile: vp, accessToken: token, refreshToken } = response.data.data;

      setUser(registeredUser);
      setRoles(userRoles || []);
      setCustomerProfile(cp);
      setVendorProfile(vp);
      setAccessToken(token);

      localStorage.setItem('rentora_token', token);
      if (refreshToken) {
        localStorage.setItem('rentora_refresh_token', refreshToken);
      }
      localStorage.setItem('rentora_user', JSON.stringify({
        user: registeredUser,
        roles: userRoles,
        customerProfile: cp,
        vendorProfile: vp
      }));

      const primary = (userRoles || []).includes('VENDOR') ? 'VENDOR' : 'CUSTOMER';

      return {
        success: true,
        user: registeredUser,
        roles: userRoles,
        primaryRole: primary
      };
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Registration failed.';
      const errors = error.response?.data?.errors;
      throw new Error(message, { cause: errors });
    }
  };

  /**
   * Log out active session
   */
  const logout = async () => {
    try {
      const storedRefreshToken = localStorage.getItem('rentora_refresh_token');
      await api.post('/auth/logout', { refreshToken: storedRefreshToken });
    } catch {
      // ignore network errors on logout
    } finally {
      localStorage.removeItem('rentora_token');
      localStorage.removeItem('rentora_refresh_token');
      localStorage.removeItem('rentora_user');
      setUser(null);
      setRoles([]);
      setCustomerProfile(null);
      setVendorProfile(null);
      setAccessToken(null);
    }
  };

  /**
   * Change password
   */
  const changePassword = async (currentPassword, newPassword) => {
    const response = await api.post('/auth/change-password', {
      currentPassword,
      newPassword
    });
    if (response.data?.data?.accessToken) {
      localStorage.setItem('rentora_token', response.data.data.accessToken);
      setAccessToken(response.data.data.accessToken);
    }
    return response.data;
  };

  /**
   * Update Profile Details
   */
  const updateProfile = async (profileData) => {
    const response = await api.patch('/auth/profile', profileData);
    if (response.data?.success) {
      const updatedUser = response.data.data.user;
      setUser(updatedUser);
      const saved = JSON.parse(localStorage.getItem('rentora_user') || '{}');
      localStorage.setItem('rentora_user', JSON.stringify({ ...saved, user: updatedUser }));
    }
    return response.data;
  };

  /**
   * Upgrade Customer to Vendor Store
   */
  const becomeVendor = async (storeData) => {
    const response = await api.post('/auth/become-vendor', storeData);
    if (response.data?.success) {
      const { user: updatedUser, roles: updatedRoles, vendorProfile: vp, accessToken: token } = response.data.data;
      setUser(updatedUser);
      setRoles(updatedRoles);
      setVendorProfile(vp);
      if (token) {
        localStorage.setItem('rentora_token', token);
        setAccessToken(token);
      }
      localStorage.setItem('rentora_user', JSON.stringify({
        user: updatedUser,
        roles: updatedRoles,
        customerProfile,
        vendorProfile: vp
      }));
    }
    return response.data;
  };

  /**
   * Request password reset link
   */
  const forgotPassword = async (email) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  };

  /**
   * Reset password with single-use token
   */
  const resetPassword = async (token, newPassword) => {
    const response = await api.post('/auth/reset-password', { token, newPassword });
    return response.data;
  };

  const hasRole = (roleName) => roles.includes(roleName.toUpperCase());

  return (
    <AuthContext.Provider
      value={{
        user,
        roles,
        customerProfile,
        vendorProfile,
        accessToken,
        isLoading,
        isAuthenticated: !!user,
        isCustomer,
        isVendor,
        isSuperAdmin,
        primaryRole,
        login,
        signup,
        logout,
        changePassword,
        updateProfile,
        becomeVendor,
        forgotPassword,
        resetPassword,
        hasRole,
        checkAuth
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
