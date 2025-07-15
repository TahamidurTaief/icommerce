"use client";

import React, { createContext, useState, useContext } from "react";

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
    openAuthModal,
    closeAuthModal,
    switchToLogin,
    switchToSignup,
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
