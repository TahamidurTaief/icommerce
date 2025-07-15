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
import { useAuth } from "@/app/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

import logo from "@/public/img/icommerce.png";

// All categories for the main dropdown
const allCategories = [
  "Bundle Deals",
  "Choice",
  "Super Deals",
  "Flash Sell",
  "Top Rated",
  "Winter Sale",
  "Summer Sale",
  "Electronics",
  "Fashion",
  "Home & Kitchen",
  "Health & Beauty",
  "Sports & Outdoors",
];

// List of offers for the "Offers" dropdown
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

const ThemeToggle = () => {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="p-2 rounded-full w-[44px] h-[44px] bg-gray-200 dark:bg-gray-700 animate-pulse" />
    );
  }

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <button
      onClick={toggleTheme}
      className="relative p-2 rounded-full flex justify-center items-center bg-[var(--color-muted-bg)]"
      aria-label="Toggle theme"
    >
      <BsSun className="theme-toggle-sun text-xl text-[var(--color-text-primary)]" />
      <BsMoon className="theme-toggle-moon text-xl text-[var(--color-accent-orange)]" />
    </button>
  );
};

const NavbarSkeleton = () => (
  <div className="hidden md:block w-full z-50 sticky top-0 animate-pulse">
    <div
      className="flex flex-col w-full px-6 py-2 h-[132px]"
      style={{
        backgroundColor: "var(--color-surface)",
        borderBottom: "1px solid var(--color-border)",
      }}
    >
      <div className="container flex justify-between items-center h-full">
        <div className="h-16 w-40 bg-[var(--color-muted-bg)] rounded-lg"></div>
        <div className="h-10 w-1/2 bg-[var(--color-muted-bg)] rounded-lg"></div>
        <div className="flex justify-end items-center gap-3 w-full">
          <div className="h-11 w-11 bg-[var(--color-muted-bg)] rounded-full"></div>
          <div className="h-11 w-11 bg-[var(--color-muted-bg)] rounded-full"></div>
          <div className="h-11 w-32 bg-[var(--color-muted-bg)] rounded-full"></div>
        </div>
      </div>
    </div>
  </div>
);

const NavIcon = ({ href, icon, label, active, onClick }) => {
  const content = (
    <>
      <div
        style={{
          color: active
            ? "var(--color-button-primary)"
            : "var(--color-text-secondary)",
        }}
      >
        {icon}
      </div>
      <span
        className="text-xs font-semibold"
        style={{
          color: active
            ? "var(--color-button-primary)"
            : "var(--color-text-secondary)",
        }}
      >
        {label}
      </span>
    </>
  );

  if (onClick) {
    return (
      <button
        onClick={onClick}
        className="flex flex-col justify-center items-center gap-1"
      >
        {content}
      </button>
    );
  }

  return (
    <Link
      href={href}
      className="flex flex-col justify-center items-center gap-1"
    >
      {content}
    </Link>
  );
};

const Navbar = () => {
  const { openAuthModal } = useAuth();
  const [offersOpen, setOffersOpen] = useState(false);
  const [allCategoriesOpen, setAllCategoriesOpen] = useState(false); // State for All Categories dropdown
  const [isClient, setIsClient] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const offersRef = useRef(null);
  const allCatRef = useRef(null); // Ref for All Categories dropdown

  useEffect(() => {
    setIsClient(true);
    const handleClickOutside = (event) => {
      if (offersRef.current && !offersRef.current.contains(event.target)) {
        setOffersOpen(false);
      }
      if (allCatRef.current && !allCatRef.current.contains(event.target)) {
        setAllCategoriesOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!isClient) return <NavbarSkeleton />;

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
                  className="h-full max-h-16 w-auto dark:bg-white rounded-full p-1"
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
                <CiShoppingCart className="text-4xl p-2 rounded-full bg-[var(--color-muted-bg)] text-[var(--color-text-primary)]" />
              </Link>
              <Link href="/orders">
                <IoBagCheckOutline className="text-4xl p-2 rounded-full bg-[var(--color-muted-bg)] text-[var(--color-text-primary)]" />
              </Link>

              {isLoggedIn ? (
                <div className="flex items-center gap-2 p-2 rounded-full bg-[var(--color-muted-bg)]">
                  <h4 className="text-md font-medium text-[var(--color-text-primary)]">
                    Tahamidur
                  </h4>
                  <CiUser className="text-2xl text-[var(--color-text-primary)]" />
                </div>
              ) : (
                <motion.button
                  onClick={() => openAuthModal("login")}
                  className="flex flex-row lato items-center gap-2 py-2 px-4 rounded-full bg-[var(--color-muted-bg)]"
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

          {/* Secondary Navigation with All Categories button */}
          <div className="container relative flex justify-between items-center py-2">
            {/* All Categories Dropdown */}
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
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full left-0 mt-2 w-56 rounded-lg p-2 z-50 shadow-lg bg-[var(--color-surface)] border border-[var(--color-border)]"
                  >
                    {allCategories.map((cat) => (
                      <li key={cat}>
                        <Link
                          href="#"
                          className="block text-sm px-4 py-2 font-medium text-[var(--color-text-primary)] hover:bg-[var(--color-muted-bg)] rounded cursor-pointer"
                        >
                          {cat}
                        </Link>
                      </li>
                    ))}
                  </motion.ul>
                )}
              </AnimatePresence>
            </div>

            {/* Main Nav Links */}
            <nav className="flex items-center gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-md font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
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
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-48 rounded-lg p-2 z-50 shadow-lg bg-[var(--color-surface)] border border-[var(--color-border)]"
                    >
                      {offerCategories.map((cat) => (
                        <li key={cat}>
                          <Link
                            href="#"
                            className="block text-sm px-4 py-2 font-medium text-[var(--color-text-primary)] hover:bg-[var(--color-muted-bg)] rounded cursor-pointer"
                          >
                            {cat}
                          </Link>
                        </li>
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
                className="h-full max-h-12 w-auto dark:bg-white rounded-xl px-2 py-1"
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
            onClick={() => openAuthModal("login")}
            icon={<CiUser className="text-[22px]" />}
            label="Profile"
          />
        </div>
      </div>
    </>
  );
};

export default Navbar;
