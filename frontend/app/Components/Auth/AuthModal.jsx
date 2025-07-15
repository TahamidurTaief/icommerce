"use client";

import { motion, AnimatePresence } from "framer-motion";
import { FiX } from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";
import { useAuth } from "@/app/contexts/AuthContext";
import { useState } from "react";
import { toast } from "react-toastify";
import Image from "next/image";
// NOTE: You should replace this placeholder with your actual illustration.
import authIllustration from "@/public/img/auth/auth-illustration.jpg";

// Animation variants for the modal
const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const modalVariants = {
  hidden: { opacity: 0, y: -50, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", damping: 25, stiffness: 200, delay: 0.1 },
  },
  exit: { opacity: 0, y: 50, scale: 0.95 },
};

const AuthModal = () => {
  const {
    isAuthModalOpen,
    closeAuthModal,
    authModalView,
    switchToLogin,
    switchToSignup,
  } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleGoogleLogin = () => {
    toast.info("Google login feature is under development.");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (authModalView === "signup" && password !== confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }
    // Placeholder for actual authentication logic
    toast.success(
      `Successfully ${authModalView === "login" ? "logged in" : "signed up"}!`
    );
    closeAuthModal();
  };

  return (
    <AnimatePresence>
      {isAuthModalOpen && (
        <motion.div
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          onClick={closeAuthModal}
        >
          <motion.div
            className="bg-[var(--color-background)] rounded-2xl max-w-4xl w-full shadow-2xl relative overflow-hidden grid grid-cols-1 md:grid-cols-2"
            variants={modalVariants}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Left Panel: Illustration */}
            <div className="hidden md:flex flex-col items-center justify-center bg-[var(--color-second-bg)] p-3 rounded-xl text-center">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                <Image
                  src={authIllustration}
                  alt="Authentication Illustration"
                  className="w-full h-full rounded-xl"
                  priority
                  onError={(e) => {
                    e.target.src =
                      "https://placehold.co/300x300/313c48/f9fafb?text=Instant+Support";
                  }}
                />
                {/* <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mt-4">
                  Instant support & reply
                </h2>
                <p className="text-[var(--color-text-secondary)] mt-2">
                  Arogga will receive your order and be able to reply to you
                  once you place an order and ask for help.
                </p> */}
              </motion.div>
            </div>

            {/* Right Panel: Form */}
            <div className="p-8">
              <button
                onClick={closeAuthModal}
                className="absolute top-4 right-4 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
                aria-label="Close modal"
              >
                <FiX size={24} />
              </button>

              <h2 className="text-3xl font-bold text-[var(--color-text-primary)] mb-2">
                {authModalView === "login" ? "Login" : "Sign Up"}
              </h2>
              <p className="text-[var(--color-text-secondary)] mb-6">
                Login to make an order, access your orders, special offers,
                health tips, and more!
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label
                    className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1"
                    htmlFor="email"
                  >
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full p-3 border border-[var(--color-border)] rounded-lg bg-[var(--color-second-bg)] text-[var(--color-text-primary)] focus:ring-2 focus:ring-teal-500 transition-shadow"
                  />
                </div>
                <div>
                  <label
                    className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1"
                    htmlFor="password"
                  >
                    Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full p-3 border border-[var(--color-border)] rounded-lg bg-[var(--color-second-bg)] text-[var(--color-text-primary)] focus:ring-2 focus:ring-teal-500 transition-shadow"
                  />
                </div>
                {authModalView === "signup" && (
                  <div>
                    <label
                      className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1"
                      htmlFor="confirmPassword"
                    >
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      id="confirmPassword"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="w-full p-3 border border-[var(--color-border)] rounded-lg bg-[var(--color-second-bg)] text-[var(--color-text-primary)] focus:ring-2 focus:ring-teal-500 transition-shadow"
                    />
                  </div>
                )}

                <motion.button
                  type="submit"
                  className="w-full bg-blue-500 text-white font-bold py-3 rounded-lg hover:bg-blue-600 transition-colors"
                  whileTap={{ scale: 0.98 }}
                >
                  {authModalView === "login" ? "Send" : "Create Account"}
                </motion.button>
              </form>

              <div className="flex items-center my-6">
                <div className="flex-grow border-t border-[var(--color-border)]"></div>
                <span className="mx-4 text-sm text-[var(--color-text-secondary)]">
                  or
                </span>
                <div className="flex-grow border-t border-[var(--color-border)]"></div>
              </div>

              <motion.button
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center gap-3 p-3 border border-[var(--color-border)] rounded-lg hover:bg-[var(--color-second-bg)] transition-colors"
                whileTap={{ scale: 0.98 }}
              >
                <FcGoogle size={22} />
                <span className="font-semibold text-[var(--color-text-primary)]">
                  Sign in with Google
                </span>
              </motion.button>

              <div className="text-center mt-6">
                <p className="text-sm text-[var(--color-text-secondary)]">
                  {authModalView === "login"
                    ? "Don't have an account?"
                    : "Already have an account?"}
                  <button
                    onClick={
                      authModalView === "login" ? switchToSignup : switchToLogin
                    }
                    className="font-semibold text-teal-400 hover:underline ml-1"
                  >
                    {authModalView === "login" ? "Sign Up" : "Login"}
                  </button>
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AuthModal;
