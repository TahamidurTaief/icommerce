"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTheme } from "next-themes";
import { CiSearch, CiUser, CiShoppingCart, CiShop } from "react-icons/ci";
import { IoBagCheckOutline } from "react-icons/io5";
import { RiHome2Line } from "react-icons/ri";
import { IoIosArrowDown, IoMdMenu } from "react-icons/io";
import { BsSun, BsMoon } from "react-icons/bs";
import { FiUser, FiSettings, FiLogOut } from "react-icons/fi";
import { useAuth } from "@/app/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

import logo from "@/public/img/icommerce.png";
import { CategoriesData } from "@/app/lib/Data/CategoriesData"; // Import CategoriesData

// List of offers for the dropdown
const offerCategories = [
  "Bundle Deals",
  "Choice",
  "Super Deals",
  "Flash Sell",
  "Top Rated",
  "Winter Sale",
  "Summer Sale",
];

// Main navigation links as per your request
const navLinks = [
  { name: "Home", href: "/" },
  { name: "Shop", href: "/products" },
  { name: "Orders", href: "/orders" },
  { name: "Cart", href: "/cart" },
  { name: "Checkout", href: "/checkout" },
  { name: "Order Track", href: "/track-order" },
];

// Predefined widths for skeleton loaders to avoid hydration issues
const skeletonWidths = [65, 72, 58, 80, 75, 62];

const ThemeToggle = () => {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <motion.div 
        className="p-2 rounded-full w-[44px] h-[44px] bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 relative overflow-hidden"
        animate={{
          backgroundPosition: ['200% 0', '-200% 0'],
        }}
        transition={{
          duration: 2,
          ease: 'linear',
          repeat: Infinity,
        }}
        style={{
          backgroundSize: '200% 100%',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
      </motion.div>
    );
  }

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <motion.button
      onClick={toggleTheme}
      className="relative p-2 rounded-full flex justify-center items-center bg-[var(--color-muted-bg)]"
      aria-label="Toggle theme"
      whileHover={{ 
        scale: 1.1,
        backgroundColor: "var(--color-border)",
      }}
      whileTap={{ 
        scale: 0.9,
      }}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 17,
      }}
    >
      <motion.div
        animate={{ 
          rotate: theme === "dark" ? 180 : 0,
        }}
        transition={{
          type: "spring",
          stiffness: 200,
          damping: 20,
        }}
      >
        <BsSun className="theme-toggle-sun text-xl text-[var(--color-text-primary)]" />
      </motion.div>
      <motion.div
        className="absolute"
        animate={{ 
          rotate: theme === "dark" ? 0 : -180,
          opacity: theme === "dark" ? 1 : 0,
        }}
        transition={{
          type: "spring",
          stiffness: 200,
          damping: 20,
        }}
      >
        <BsMoon className="theme-toggle-moon text-xl text-[var(--color-accent-orange)]" />
      </motion.div>
    </motion.button>
  );
};

const NavbarSkeleton = () => (
  <div className="hidden md:block w-full z-50 sticky top-0">
    <div
      className="flex flex-col w-full px-6 py-2 shadow-md"
      style={{
        backgroundColor: "var(--color-surface)",
        borderBottom: "1px solid var(--color-border)",
      }}
    >
      {/* Top Section */}
      <div className="container flex justify-between items-center pt-1">
        {/* Logo Skeleton */}
        <div className="flex items-center gap-4">
          <motion.div 
            className="h-12 w-40 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded-xl relative overflow-hidden"
            animate={{
              backgroundPosition: ['200% 0', '-200% 0'],
            }}
            transition={{
              duration: 2,
              ease: 'linear',
              repeat: Infinity,
            }}
            style={{
              backgroundSize: '200% 100%',
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
          </motion.div>
        </div>

        {/* Search Bar Skeleton */}
        <div className="w-full max-w-lg flex items-center px-3 rounded-lg bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 relative overflow-hidden">
          <motion.div 
            className="w-full py-2 px-2 bg-transparent"
            animate={{
              backgroundPosition: ['200% 0', '-200% 0'],
            }}
            transition={{
              duration: 2.5,
              ease: 'linear',
              repeat: Infinity,
            }}
          >
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4 animate-pulse"></div>
          </motion.div>
          <div className="h-6 w-6 bg-gray-400 dark:bg-gray-500 rounded animate-pulse"></div>
        </div>

        {/* Right Icons Skeleton */}
        <div className="flex justify-end items-center gap-3">
          {/* Theme Toggle */}
          <motion.div 
            className="h-11 w-11 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded-full relative overflow-hidden"
            animate={{
              rotate: [0, 360],
              backgroundPosition: ['200% 0', '-200% 0'],
            }}
            transition={{
              rotate: { duration: 3, ease: 'linear', repeat: Infinity },
              backgroundPosition: { duration: 2, ease: 'linear', repeat: Infinity },
            }}
            style={{
              backgroundSize: '200% 100%',
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
          </motion.div>
          
          {/* Cart Icon */}
          <motion.div 
            className="h-11 w-11 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded-full relative overflow-hidden"
            animate={{
              scale: [1, 1.1, 1],
              backgroundPosition: ['200% 0', '-200% 0'],
            }}
            transition={{
              scale: { duration: 2, ease: 'easeInOut', repeat: Infinity },
              backgroundPosition: { duration: 2.2, ease: 'linear', repeat: Infinity },
            }}
            style={{
              backgroundSize: '200% 100%',
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
          </motion.div>
          
          {/* Orders Icon */}
          <motion.div 
            className="h-11 w-11 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded-full relative overflow-hidden"
            animate={{
              y: [0, -2, 0],
              backgroundPosition: ['200% 0', '-200% 0'],
            }}
            transition={{
              y: { duration: 1.8, ease: 'easeInOut', repeat: Infinity },
              backgroundPosition: { duration: 2.3, ease: 'linear', repeat: Infinity },
            }}
            style={{
              backgroundSize: '200% 100%',
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
          </motion.div>
          
          {/* User/Login Button */}
          <motion.div 
            className="h-11 w-32 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded-full relative overflow-hidden"
            animate={{
              backgroundPosition: ['200% 0', '-200% 0'],
            }}
            transition={{
              duration: 2.8,
              ease: 'linear',
              repeat: Infinity,
            }}
            style={{
              backgroundSize: '200% 100%',
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
            <div className="flex items-center justify-center h-full">
              <div className="h-3 w-16 bg-gray-400 dark:bg-gray-500 rounded animate-pulse"></div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom Navigation Skeleton */}
      <div className="container relative flex justify-between items-center py-2">
        {/* All Categories Button */}
        <motion.div 
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 relative overflow-hidden"
          animate={{
            backgroundPosition: ['200% 0', '-200% 0'],
          }}
          transition={{
            duration: 3,
            ease: 'linear',
            repeat: Infinity,
          }}
          style={{
            backgroundSize: '200% 100%',
          }}
        >
          <div className="h-4 w-4 bg-gray-400 dark:bg-gray-500 rounded animate-pulse"></div>
          <div className="h-3 w-24 bg-gray-400 dark:bg-gray-500 rounded animate-pulse"></div>
          <div className="h-3 w-3 bg-gray-400 dark:bg-gray-500 rounded animate-pulse"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
        </motion.div>

        {/* Navigation Links */}
        <div className="flex items-center gap-6">
          {[...Array(6)].map((_, index) => (
            <motion.div 
              key={index}
              className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded relative overflow-hidden"
              style={{
                width: `${skeletonWidths[index]}px`,
                backgroundSize: '200% 100%',
              }}
              animate={{
                backgroundPosition: ['200% 0', '-200% 0'],
              }}
              transition={{
                duration: 2 + index * 0.3,
                ease: 'linear',
                repeat: Infinity,
                delay: index * 0.2,
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
            </motion.div>
          ))}
          
          {/* Offers Dropdown */}
          <motion.div 
            className="flex items-center gap-1 relative"
            animate={{
              opacity: [0.7, 1, 0.7],
            }}
            transition={{
              duration: 2,
              ease: 'easeInOut',
              repeat: Infinity,
            }}
          >
            <div className="h-4 w-12 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded"></div>
            <div className="h-3 w-3 bg-gray-400 dark:bg-gray-500 rounded animate-pulse"></div>
          </motion.div>
        </div>
      </div>
    </div>
  </div>
);

const MobileNavbarSkeleton = () => (
  <div className="md:hidden">
    {/* Mobile Top Navbar Skeleton */}
    <div className="sticky top-0 left-0 right-0 z-50 px-4 py-2 bg-[var(--color-surface)] border-b border-[var(--color-border)]">
      <div className="flex items-center gap-3">
        {/* Logo Skeleton */}
        <motion.div 
          className="h-10 w-10 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded-full relative overflow-hidden"
          animate={{
            rotate: [0, 360],
            backgroundPosition: ['200% 0', '-200% 0'],
          }}
          transition={{
            rotate: { duration: 4, ease: 'linear', repeat: Infinity },
            backgroundPosition: { duration: 2, ease: 'linear', repeat: Infinity },
          }}
          style={{
            backgroundSize: '200% 100%',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
        </motion.div>
        
        {/* Search Bar Skeleton */}
        <motion.div 
          className="flex items-center w-full px-3 rounded-lg bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 relative overflow-hidden"
          animate={{
            backgroundPosition: ['200% 0', '-200% 0'],
          }}
          transition={{
            duration: 2.5,
            ease: 'linear',
            repeat: Infinity,
          }}
          style={{
            backgroundSize: '200% 100%',
          }}
        >
          <div className="w-full py-2">
            <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-2/3 animate-pulse"></div>
          </div>
          <div className="h-5 w-5 bg-gray-400 dark:bg-gray-500 rounded animate-pulse"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
        </motion.div>
        
        {/* Theme Toggle Skeleton */}
        <motion.div 
          className="h-10 w-10 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded-full relative overflow-hidden"
          animate={{
            scale: [1, 1.1, 1],
            backgroundPosition: ['200% 0', '-200% 0'],
          }}
          transition={{
            scale: { duration: 2, ease: 'easeInOut', repeat: Infinity },
            backgroundPosition: { duration: 2.2, ease: 'linear', repeat: Infinity },
          }}
          style={{
            backgroundSize: '200% 100%',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
        </motion.div>
      </div>
    </div>
    
    {/* Mobile Bottom Navigation Skeleton */}
    <div className="fixed bottom-0 left-0 right-0 px-6 py-3 z-50 rounded-t-2xl flex justify-between items-center bg-[var(--color-surface)] border-t border-[var(--color-border)]">
      {[...Array(4)].map((_, index) => (
        <motion.div 
          key={index}
          className="flex flex-col justify-center items-center gap-1"
          animate={{
            y: [0, -2, 0],
          }}
          transition={{
            duration: 2 + index * 0.3,
            ease: 'easeInOut',
            repeat: Infinity,
            delay: index * 0.4,
          }}
        >
          <motion.div 
            className="w-6 h-6 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded relative overflow-hidden"
            animate={{
              backgroundPosition: ['200% 0', '-200% 0'],
            }}
            transition={{
              duration: 2 + index * 0.2,
              ease: 'linear',
              repeat: Infinity,
            }}
            style={{
              backgroundSize: '200% 100%',
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
          </motion.div>
          <div className="h-2 w-8 bg-gray-300 dark:bg-gray-600 rounded animate-pulse"></div>
        </motion.div>
      ))}
    </div>
  </div>
);

const NavIcon = ({ href, icon, label, active, onClick }) => {
  const content = (
    <motion.div
      className="flex flex-col justify-center items-center gap-1"
      whileHover={{ 
        scale: 1.1,
        y: -2,
      }}
      whileTap={{ 
        scale: 0.95,
      }}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 17,
      }}
    >
      <motion.div
        style={{
          color: active
            ? "var(--color-button-primary)"
            : "var(--color-text-secondary)",
        }}
        animate={active ? {
          y: [0, -2, 0],
        } : {}}
        transition={{
          duration: 2,
          ease: "easeInOut",
          repeat: active ? Infinity : 0,
        }}
      >
        {icon}
      </motion.div>
      <motion.span
        className="text-xs font-semibold"
        style={{
          color: active
            ? "var(--color-button-primary)"
            : "var(--color-text-secondary)",
        }}
        animate={active ? {
          scale: [1, 1.05, 1],
        } : {}}
        transition={{
          duration: 2,
          ease: "easeInOut",
          repeat: active ? Infinity : 0,
        }}
      >
        {label}
      </motion.span>
    </motion.div>
  );

  if (onClick) {
    return (
      <button onClick={onClick}>
        {content}
      </button>
    );
  }

  return (
    <Link href={href}>
      {content}
    </Link>
  );
};

const Navbar = () => {
  const { openAuthModal, user, isAuthenticated, logout } = useAuth();
  const [offersOpen, setOffersOpen] = useState(false);
  const [allCategoriesOpen, setAllCategoriesOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);
  const offersRef = useRef(null);
  const allCatRef = useRef(null);

  useEffect(() => {
    setIsClient(true);
    const handleClickOutside = (event) => {
      if (offersRef.current && !offersRef.current.contains(event.target)) {
        setOffersOpen(false);
      }
      if (allCatRef.current && !allCatRef.current.contains(event.target)) {
        setAllCategoriesOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!isClient) return (
    <>
      <NavbarSkeleton />
      <MobileNavbarSkeleton />
    </>
  );

  return (
    <>
      {/* Desktop & Tablet Navbar */}
      <div className="hidden md:flex w-full z-50 sticky top-0">
        <div
          className="flex flex-col w-full px-6 py-2 shadow-md"
          style={{
            backgroundColor: "var(--color-surface)",
            borderBottom: "1px solid var(--color-border)",
          }}
        >
          <div className="container flex justify-between items-center pt-1">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Image
                  src={logo}
                  alt="iCommerce"
                  className="h-full max-h-12 w-auto dark:bg-white rounded-xl px-3 py-1"
                />
              </Link>
            </div>
            <div className="w-full max-w-lg flex items-center px-3 rounded-lg bg-[var(--color-muted-bg)]">
              <input
                type="text"
                placeholder="Search Here"
                className="poppins w-full py-2 px-2 bg-transparent outline-none border-0"
                style={{ color: "var(--color-text-primary)" }}
              />
              <button>
                <CiSearch className="text-2xl text-[var(--color-text-secondary)]" />
              </button>
            </div>
            <div className="flex justify-end items-center gap-3">
              <ThemeToggle />
              <Link href="/cart">
                <motion.div
                  whileHover={{ 
                    scale: 1.1,
                    y: -2,
                  }}
                  whileTap={{ scale: 0.95 }}
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 17,
                  }}
                >
                  <CiShoppingCart className="text-4xl p-2 rounded-full bg-[var(--color-muted-bg)] text-[var(--color-text-primary)] hover:bg-[var(--color-border)] transition-colors" />
                </motion.div>
              </Link>
              <Link href="/orders">
                <motion.div
                  whileHover={{ 
                    scale: 1.1,
                    rotate: 5,
                  }}
                  whileTap={{ scale: 0.95 }}
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 17,
                  }}
                >
                  <IoBagCheckOutline className="text-4xl p-2 rounded-full bg-[var(--color-muted-bg)] text-[var(--color-text-primary)] hover:bg-[var(--color-border)] transition-colors" />
                </motion.div>
              </Link>

              {isAuthenticated && user ? (
                <div ref={userMenuRef} className="relative">
                  <motion.button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 p-2 rounded-full bg-[var(--color-muted-bg)] hover:bg-[var(--color-border)] transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <FiUser className="text-xl text-[var(--color-text-primary)]" />
                    <h4 className="text-md font-medium text-[var(--color-text-primary)]">
                      {user.name ? user.name.split(' ')[0] : 'User'}
                    </h4>
                    <IoIosArrowDown
                      className={`transition-transform text-[var(--color-text-primary)] ${
                        userMenuOpen ? "rotate-180" : ""
                      }`}
                    />
                  </motion.button>
                  
                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div
                        initial={{ 
                          opacity: 0, 
                          y: -10,
                          scale: 0.95,
                        }}
                        animate={{ 
                          opacity: 1, 
                          y: 0,
                          scale: 1,
                        }}
                        exit={{ 
                          opacity: 0, 
                          y: -10,
                          scale: 0.95,
                        }}
                        transition={{
                          type: "spring",
                          stiffness: 500,
                          damping: 30,
                        }}
                        className="absolute top-full right-0 mt-2 w-48 rounded-lg p-2 z-50 shadow-lg bg-[var(--color-surface)] border border-[var(--color-border)]"
                      >
                        <motion.div 
                          className="px-4 py-2 border-b border-[var(--color-border)]"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 }}
                        >
                          <p className="text-sm font-medium text-[var(--color-text-primary)]">
                            {user.name || 'User'}
                          </p>
                          <p className="text-xs text-[var(--color-text-secondary)]">
                            {user.email}
                          </p>
                        </motion.div>
                        
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.2 }}
                        >
                          <Link
                            href="/profile"
                            className="flex items-center gap-3 text-sm px-4 py-2 font-medium text-[var(--color-text-primary)] hover:bg-[var(--color-muted-bg)] rounded cursor-pointer transition-colors"
                            onClick={() => setUserMenuOpen(false)}
                          >
                            <motion.div
                              whileHover={{ scale: 1.2, rotate: 15 }}
                              transition={{ type: "spring", stiffness: 400, damping: 17 }}
                            >
                              <FiUser size={16} />
                            </motion.div>
                            Profile
                          </Link>
                          
                          <Link
                            href="/orders"
                            className="flex items-center gap-3 text-sm px-4 py-2 font-medium text-[var(--color-text-primary)] hover:bg-[var(--color-muted-bg)] rounded cursor-pointer transition-colors"
                            onClick={() => setUserMenuOpen(false)}
                          >
                            <motion.div
                              whileHover={{ scale: 1.2, y: -2 }}
                              transition={{ type: "spring", stiffness: 400, damping: 17 }}
                            >
                              <IoBagCheckOutline size={16} />
                            </motion.div>
                            My Orders
                          </Link>
                          
                          <Link
                            href="/settings"
                            className="flex items-center gap-3 text-sm px-4 py-2 font-medium text-[var(--color-text-primary)] hover:bg-[var(--color-muted-bg)] rounded cursor-pointer transition-colors"
                            onClick={() => setUserMenuOpen(false)}
                          >
                            <motion.div
                              whileHover={{ rotate: 90 }}
                              transition={{ type: "spring", stiffness: 400, damping: 17 }}
                            >
                              <FiSettings size={16} />
                            </motion.div>
                            Settings
                          </Link>
                        </motion.div>
                        
                        <hr className="my-2 border-[var(--color-border)]" />
                        
                        <motion.button
                          onClick={() => {
                            logout();
                            setUserMenuOpen(false);
                          }}
                          className="w-full flex items-center gap-3 text-sm px-4 py-2 font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded cursor-pointer transition-colors"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.3 }}
                        >
                          <motion.div
                            whileHover={{ x: 2 }}
                            transition={{ type: "spring", stiffness: 400, damping: 17 }}
                          >
                            <FiLogOut size={16} />
                          </motion.div>
                          Logout
                        </motion.button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <motion.button
                  onClick={() => openAuthModal("login")}
                  className="flex items-center gap-2 py-2 px-4 rounded-full bg-[var(--color-muted-bg)] hover:bg-[var(--color-border)] transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <h4 className="text-md font-medium text-[var(--color-text-primary)]">
                    Login
                  </h4>
                  <CiUser className="text-2xl text-[var(--color-text-primary)]" />
                </motion.button>
              )}
            </div>
          </div>

          <div className="container relative flex justify-between items-center py-2">
            <div ref={allCatRef} className="relative">
              <button
                onClick={() => setAllCategoriesOpen(!allCategoriesOpen)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer bg-[var(--color-muted-bg)]"
              >
                <IoMdMenu className="text-lg text-[var(--color-text-primary)]" />
                <h2 className="text-sm font-medium poppins text-[var(--color-text-primary)]">
                  All Categories
                </h2>
                <IoIosArrowDown
                  className="transition-transform text-[var(--color-text-primary)]"
                  style={{
                    transform: allCategoriesOpen
                      ? "rotate(180deg)"
                      : "rotate(0deg)",
                  }}
                />
              </button>
              <AnimatePresence>
                {allCategoriesOpen && (
                  <motion.ul
                    initial={{ 
                      opacity: 0, 
                      y: -10,
                      scale: 0.95,
                    }}
                    animate={{ 
                      opacity: 1, 
                      y: 0,
                      scale: 1,
                    }}
                    exit={{ 
                      opacity: 0, 
                      y: -10,
                      scale: 0.95,
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 500,
                      damping: 30,
                    }}
                    className="absolute top-full left-0 mt-2 w-56 rounded-lg p-2 z-50 shadow-lg bg-[var(--color-surface)] border border-[var(--color-border)]"
                  >
                    {CategoriesData.map((cat, index) => (
                      <motion.li
                        key={cat.id}
                        onClick={() => setAllCategoriesOpen(false)}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ 
                          delay: index * 0.05,
                          type: "spring",
                          stiffness: 300,
                          damping: 20,
                        }}
                      >
                        <Link
                          href={`/products?category=${encodeURIComponent(
                            cat.title
                          )}`}
                          className="flex items-center gap-3 text-sm px-4 py-2 font-medium text-[var(--color-text-primary)] hover:bg-[var(--color-muted-bg)] rounded cursor-pointer transition-colors"
                        >
                          <motion.div
                            whileHover={{ scale: 1.2, rotate: 5 }}
                            transition={{ type: "spring", stiffness: 400, damping: 17 }}
                          >
                            <Image
                              src={cat.icon}
                              alt={cat.title}
                              width={20}
                              height={20}
                              className="rounded-full"
                            />
                          </motion.div>
                          {cat.title}
                        </Link>
                      </motion.li>
                    ))}
                  </motion.ul>
                )}
              </AnimatePresence>
            </div>

            <nav className="flex items-center gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
                >
                  {link.name}
                </Link>
              ))}
              <div ref={offersRef} className="relative">
                <button
                  onClick={() => setOffersOpen(!offersOpen)}
                  className="flex items-center gap-1 text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
                >
                  Offers
                  <IoIosArrowDown
                    className={`transition-transform ${
                      offersOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                <AnimatePresence>
                  {offersOpen && (
                    <motion.ul
                      initial={{ 
                        opacity: 0, 
                        y: -10,
                        scale: 0.95,
                      }}
                      animate={{ 
                        opacity: 1, 
                        y: 0,
                        scale: 1,
                      }}
                      exit={{ 
                        opacity: 0, 
                        y: -10,
                        scale: 0.95,
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 30,
                      }}
                      className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-48 rounded-lg p-2 z-50 shadow-lg bg-[var(--color-surface)] border border-[var(--color-border)]"
                    >
                      {offerCategories.map((cat, index) => (
                        <motion.li 
                          key={cat}
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ 
                            delay: index * 0.05,
                            type: "spring",
                            stiffness: 300,
                            damping: 20,
                          }}
                        >
                          <Link
                            href="#"
                            className="block text-sm px-4 py-2 font-medium text-[var(--color-text-primary)] hover:bg-[var(--color-muted-bg)] rounded cursor-pointer transition-colors"
                          >
                            <motion.span
                              whileHover={{ x: 5 }}
                              transition={{ type: "spring", stiffness: 400, damping: 17 }}
                            >
                              {cat}
                            </motion.span>
                          </Link>
                        </motion.li>
                      ))}
                    </motion.ul>
                  )}
                </AnimatePresence>
              </div>
            </nav>
          </div>
        </div>
      </div>

      {/* Mobile Top & Bottom Nav */}
      <div className="md:hidden">
        <div className="sticky top-0 left-0 right-0 z-50 px-4 py-2 bg-[var(--color-surface)] border-b border-[var(--color-border)]">
          <div className="flex items-center gap-3">
            <Link href="/">
              <Image
                src={logo}
                alt="iCommerce"
                className="h-full max-h-10 w-auto dark:bg-white rounded-full p-1"
              />
            </Link>
            <div className="flex items-center w-full px-3 rounded-lg bg-[var(--color-muted-bg)]">
              <input
                type="text"
                placeholder="Search Here"
                className="poppins w-full py-2 bg-transparent outline-none text-[var(--color-text-primary)]"
              />
              <button>
                <CiSearch className="text-2xl text-[var(--color-text-secondary)]" />
              </button>
            </div>
            <ThemeToggle />
          </div>
        </div>
        <div className="fixed bottom-0 left-0 right-0 px-6 py-3 z-50 rounded-t-2xl flex justify-between items-center bg-[var(--color-surface)] border-t border-[var(--color-border)]">
          <NavIcon
            href="/"
            icon={<RiHome2Line className="text-[22px]" />}
            label="Home"
            active
          />
          <NavIcon
            href="/products"
            icon={<CiShop className="text-[22px]" />}
            label="Shop"
          />
          <NavIcon
            href="/cart"
            icon={<CiShoppingCart className="text-[22px]" />}
            label="Cart"
          />
          <NavIcon
            onClick={isAuthenticated ? () => setUserMenuOpen(!userMenuOpen) : () => openAuthModal("login")}
            icon={<CiUser className="text-[22px]" />}
            label={isAuthenticated ? (user?.name ? user.name.split(' ')[0] : 'Profile') : 'Login'}
          />
        </div>
      </div>
    </>
  );
};

export default Navbar;
