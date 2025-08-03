"use client";

import { motion, AnimatePresence } from "framer-motion";
import { FiX } from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";
import { useAuth } from "@/app/contexts/AuthContext";
import { useModal } from "@/app/contexts/ModalContext";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { signupUser, loginUser } from "@/app/lib/api";
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
    login,
  } = useAuth();
  const { showModal } = useModal();
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when modal closes or view switches
  useEffect(() => {
    if (!isAuthModalOpen || authModalView) {
      resetForm();
    }
  }, [isAuthModalOpen, authModalView]);

  // Reset form when modal closes or view switches
  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleGoogleLogin = () => {
    toast.info("Google login feature is under development.");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (authModalView === "signup") {
        // Validate password confirmation
        if (formData.password !== formData.confirmPassword) {
          toast.error("Passwords do not match!");
          setIsSubmitting(false);
          return;
        }

        // Signup API call
        const signupData = {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          confirm_password: formData.confirmPassword,
        };

        const signupResponse = await signupUser(signupData);
        
        if (signupResponse.error) {
          // Handle field-specific errors
          if (signupResponse.errors) {
            const errorMessages = [];
            Object.entries(signupResponse.errors).forEach(([field, messages]) => {
              if (Array.isArray(messages)) {
                errorMessages.push(`${field}: ${messages.join(', ')}`);
              } else {
                errorMessages.push(`${field}: ${messages}`);
              }
            });
            
            showModal({
              status: 'error',
              title: 'Registration Failed',
              message: errorMessages.join('\n'),
              primaryActionText: 'Try Again',
              onPrimaryAction: () => {},
            });
          } else {
            toast.error(signupResponse.error);
          }
          setIsSubmitting(false);
          return;
        }

        // Show success modal
        showModal({
          status: 'success',
          title: 'Account Created Successfully!',
          message: 'Your account has been created. You will be logged in automatically.',
          primaryActionText: 'Continue',
          onPrimaryAction: async () => {
            // Auto-login after successful signup
            try {
              const loginResponse = await loginUser(formData.email, formData.password);
              
              if (loginResponse.error) {
                toast.error("Account created but auto-login failed. Please login manually.");
              } else {
                // Update auth context state
                login(loginResponse.user, {
                  access: loginResponse.access,
                  refresh: loginResponse.refresh
                });
                
                toast.success(`Welcome ${loginResponse.user?.name || 'User'}!`);
              }
              
              // Close modals immediately
              closeAuthModal();
              resetForm();
              router.push('/'); // Redirect to home page
            } catch (loginError) {
              console.error('Auto-login failed:', loginError);
              toast.error("Account created but auto-login failed. Please login manually.");
              switchToLogin();
            }
          },
        });

      } else {
        // Login API call
        const loginResponse = await loginUser(formData.email, formData.password);
        
        if (loginResponse.error) {
          // Show error modal for invalid credentials
          showModal({
            status: 'error',
            title: 'Login Failed',
            message: 'Invalid credentials. Please check your email and password.',
            primaryActionText: 'Try Again',
            onPrimaryAction: () => {},
          });
          setIsSubmitting(false);
          return;
        }

        // Show success modal for successful login
        showModal({
          status: 'success',
          title: 'Login Successful',
          message: `Welcome back${loginResponse.user?.name ? `, ${loginResponse.user.name}` : ''}!`,
          primaryActionText: 'Continue',
          onPrimaryAction: () => {
            // Update auth context state
            login(loginResponse.user, {
              access: loginResponse.access,
              refresh: loginResponse.refresh
            });
            
            // Close modals immediately
            closeAuthModal();
            resetForm();
            
            // Handle redirect after login
            const redirectPath = localStorage.getItem('redirectAfterLogin');
            if (redirectPath) {
              localStorage.removeItem('redirectAfterLogin');
              router.push(redirectPath);
            } else {
              router.push('/'); // Default redirect to home page
            }
          },
        });
      }
    } catch (error) {
      console.error('Auth error:', error);
      
      // Parse error message for better UX
      let errorMessage = "An unexpected error occurred. Please try again.";
      let errorTitle = `${authModalView === "login" ? "Login" : "Registration"} Failed`;
      
      if (error.message) {
        if (authModalView === "login") {
          if (error.message.includes('credentials') || error.message.includes('401')) {
            errorMessage = "Invalid credentials. Please check your email and password.";
          } else if (error.message.includes('network') || error.message.includes('fetch')) {
            errorMessage = "Connection error. Please check your internet connection and try again.";
          } else {
            errorMessage = "Login failed. Please try again.";
          }
        } else {
          // Signup error handling
          if (error.message.includes('already exists')) {
            errorMessage = "An account with this email already exists.";
          } else if (error.message.includes('400')) {
            errorMessage = "Please check your input and try again.";
          } else {
            errorMessage = error.message;
          }
        }
      }

      showModal({
        status: 'error',
        title: errorTitle,
        message: errorMessage,
        primaryActionText: 'Try Again',
        onPrimaryAction: () => {},
      });
    } finally {
      setIsSubmitting(false);
    }
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
                {authModalView === "signup" && (
                  <div>
                    <label
                      className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1"
                      htmlFor="name"
                    >
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full p-3 border border-[var(--color-border)] rounded-lg bg-[var(--color-second-bg)] text-[var(--color-text-primary)] focus:ring-2 focus:ring-teal-500 transition-shadow"
                      placeholder="Enter your full name"
                    />
                  </div>
                )}
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
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full p-3 border border-[var(--color-border)] rounded-lg bg-[var(--color-second-bg)] text-[var(--color-text-primary)] focus:ring-2 focus:ring-teal-500 transition-shadow"
                    placeholder="Enter your email address"
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
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    className="w-full p-3 border border-[var(--color-border)] rounded-lg bg-[var(--color-second-bg)] text-[var(--color-text-primary)] focus:ring-2 focus:ring-teal-500 transition-shadow"
                    placeholder="Enter your password"
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
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      required
                      className="w-full p-3 border border-[var(--color-border)] rounded-lg bg-[var(--color-second-bg)] text-[var(--color-text-primary)] focus:ring-2 focus:ring-teal-500 transition-shadow"
                      placeholder="Confirm your password"
                    />
                  </div>
                )}

                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full font-bold py-3 rounded-lg transition-colors ${
                    isSubmitting 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-blue-500 hover:bg-blue-600'
                  } text-white`}
                  whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                >
                  {isSubmitting 
                    ? (authModalView === "login" ? "Signing In..." : "Creating Account...")
                    : (authModalView === "login" ? "Sign In" : "Create Account")
                  }
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
