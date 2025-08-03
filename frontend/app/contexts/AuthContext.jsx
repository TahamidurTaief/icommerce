"use client";

import React, { createContext, useState, useContext, useEffect } from "react";

// Create the context to be consumed by components
const AuthContext = createContext(null);

/**
 * AuthProvider component wraps the application to provide authentication context.
 * It manages the state for the authentication modal (open/closed, login/signup view).
 * @param {object} props - Component properties.
 * @param {React.ReactNode} props.children - The child components to be rendered within the provider.
 */
export const AuthProvider = ({ children }) => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalView, setAuthModalView] = useState("login"); // Can be 'login' or 'signup'
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check authentication status on mount
  useEffect(() => {
    checkAuthStatus();
    
    // Listen for auth required events (from 401 responses)
    const handleAuthRequired = (event) => {
      const reason = event.detail?.reason || 'Authentication required';
      console.log('Auth required:', reason);
      
      // Clear user state
      setUser(null);
      setIsAuthenticated(false);
      
      // Open login modal
      openAuthModal('login');
    };
    
    window.addEventListener('authRequired', handleAuthRequired);
    
    return () => {
      window.removeEventListener('authRequired', handleAuthRequired);
    };
  }, []);

  // Check if user is authenticated
  const checkAuthStatus = () => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      const userData = localStorage.getItem('user');
      
      if (token && userData) {
        try {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
          setIsAuthenticated(true);
        } catch (error) {
          console.error('Error parsing user data:', error);
          logout();
        }
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
    }
  };

  // Login function to update auth state
  const login = (userData, tokens) => {
    setUser(userData);
    setIsAuthenticated(true);
    
    // Store tokens and user data
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', tokens.access);
      localStorage.setItem('refreshToken', tokens.refresh);
      localStorage.setItem('user', JSON.stringify(userData));
    }
  };

  // Logout function to clear auth state
  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      localStorage.removeItem('redirectAfterLogin');
    }
  };

  // Opens the authentication modal, defaulting to the 'login' view
  const openAuthModal = (view = "login") => {
    setAuthModalView(view);
    setIsAuthModalOpen(true);
  };

  // Closes the authentication modal
  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  // Functions to switch between views inside the modal
  const switchToLogin = () => setAuthModalView("login");
  const switchToSignup = () => setAuthModalView("signup");

  // The value object contains all state and functions to be provided to consumers
  const value = {
    isAuthModalOpen,
    authModalView,
    user,
    isAuthenticated,
    openAuthModal,
    closeAuthModal,
    switchToLogin,
    switchToSignup,
    login,
    logout,
    checkAuthStatus,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * A custom hook (useAuth) to simplify accessing the authentication context.
 * It ensures the hook is used within an AuthProvider.
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
