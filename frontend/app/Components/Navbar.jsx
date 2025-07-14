"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTheme } from "next-themes";
import { CiSearch, CiShop, CiUser, CiShoppingCart } from "react-icons/ci";
import { IoBagCheckOutline, IoSettingsOutline } from "react-icons/io5";
import { RiHome2Line } from "react-icons/ri";
import { IoIosArrowDown, IoMdMenu, IoMdHelp } from "react-icons/io";
import { FiMessageSquare } from "react-icons/fi";
import { MdAddCall } from "react-icons/md";
import { BsSun, BsMoon } from "react-icons/bs";

import logo from "@/public/img/icommerce.png";

const categories = [
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
];
const OfferCategories = [
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
];

const ThemeToggle = () => {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        className="p-2 rounded-full w-[44px] h-[44px]"
        style={{ backgroundColor: "var(--color-muted-bg)" }}
      />
    );
  }

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <button
      onClick={toggleTheme}
      className="relative p-2 rounded-full flex justify-center items-center"
      style={{ backgroundColor: "var(--color-muted-bg)" }}
      aria-label={
        theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
      }
    >
      <BsSun
        className="theme-toggle-sun text-xl"
        style={{ color: "var(--color-text-primary)" }}
      />
      <BsMoon
        className="theme-toggle-moon text-xl"
        style={{ color: "var(--color-accent-orange)" }}
      />
    </button>
  );
};

const Navbar = () => {
  const [breakpoint, setBreakpoint] = useState(null);
  const [showMore, setShowMore] = useState(false);
  const [allCategoriesOpen, setAllCategoriesOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);

  const allCatRef = useRef(null);
  const showMoreRef = useRef(null);

  useEffect(() => {
    setIsClient(true);
    const updateSize = () => {
      const width = window.innerWidth;
      if (width < 952) setBreakpoint("mobile");
      else if (width < 1085) setBreakpoint("tablet");
      else if (width < 1232) setBreakpoint("laptop");
      else if (width < 1400) setBreakpoint("desktop");
      else if (width < 1530) setBreakpoint("desktop2");
      else setBreakpoint("largescreen");
    };
    updateSize();
    window.addEventListener("resize", updateSize);

    const handleClickOutside = (event) => {
      if (showMoreRef.current && !showMoreRef.current.contains(event.target))
        setShowMore(false);
      if (allCatRef.current && !allCatRef.current.contains(event.target))
        setAllCategoriesOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      window.removeEventListener("resize", updateSize);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  if (!isClient) return null;

  let visibleCount = 8;
  if (breakpoint === "mobile") visibleCount = 3;
  else if (breakpoint === "tablet") visibleCount = 4;
  else if (breakpoint === "laptop") visibleCount = 5;
  else if (breakpoint === "desktop") visibleCount = 6;
  else if (breakpoint === "desktop2") visibleCount = 7;

  const visibleCategories = OfferCategories.slice(0, visibleCount);
  const moreCategories = OfferCategories.slice(visibleCount);

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
            <div className="flex items-center gap-4 w-full">
              <Link href="/">
                <Image
                  src={logo}
                  alt="iCommerce"
                  className="h-full max-h-20 dark:max-h-16 w-auto dark:bg-white rounded-full px-3"
                />
              </Link>
            </div>

            <div
              className="w-full flex items-center px-3 rounded-lg"
              style={{ backgroundColor: "var(--color-muted-bg)" }}
            >
              <input
                type="text"
                placeholder="Search Here"
                className="poppins w-full py-2 px-2 bg-transparent outline-none border-0 outline-0"
                style={{ color: "var(--color-text-primary)" }}
              />
              <Link href="#">
                <CiSearch
                  className="text-2xl"
                  style={{ color: "var(--color-text-secondary)" }}
                />
              </Link>
            </div>

            <div className="w-full flex justify-end items-center gap-3">
              <ThemeToggle />
              <Link href="/cart">
                <CiShoppingCart
                  className="text-4xl p-2 rounded-full"
                  style={{
                    backgroundColor: "var(--color-muted-bg)",
                    color: "var(--color-text-primary)",
                  }}
                />
              </Link>
              <IoBagCheckOutline
                className="text-4xl p-2 rounded-full"
                style={{
                  backgroundColor: "var(--color-muted-bg)",
                  color: "var(--color-text-primary)",
                }}
              />
              <div
                className="flex items-center gap-2 p-2 rounded-full"
                style={{ backgroundColor: "var(--color-muted-bg)" }}
              >
                <h4
                  className="text-md font-medium"
                  style={{ color: "var(--color-text-primary)" }}
                >
                  Tahamidur
                </h4>
                <CiUser
                  className="text-2xl"
                  style={{ color: "var(--color-text-primary)" }}
                />
              </div>
            </div>
          </div>

          <div className="container relative pb-8">
            <nav className="flex justify-between items-center py-2">
              <div
                ref={allCatRef}
                className="flex flex-col absolute top-1 left-0"
              >
                <div
                  onClick={() => setAllCategoriesOpen(!allCategoriesOpen)}
                  className="flex items-center gap-2 px-5 py-2 rounded-2xl cursor-pointer"
                  style={{ backgroundColor: "var(--color-muted-bg)" }}
                >
                  <div className="flex flex-row items-center gap-3">
                    <IoMdMenu
                      className="text-lg"
                      style={{ color: "var(--color-text-primary)" }}
                    />
                    <h2
                      className="text-sm font-medium poppins"
                      style={{ color: "var(--color-text-primary)" }}
                    >
                      All Categories
                    </h2>
                    <IoIosArrowDown
                      className="transition-transform"
                      style={{
                        color: "var(--color-text-primary)",
                        transform: allCategoriesOpen
                          ? "rotate(180deg)"
                          : "rotate(0deg)",
                      }}
                    />
                  </div>
                  {allCategoriesOpen && (
                    <ul
                      className="absolute top-full left-0 mt-1 rounded-lg p-2 z-50 lato shadow-lg"
                      style={{
                        backgroundColor: "var(--color-surface)",
                        border: "1px solid var(--color-border)",
                      }}
                    >
                      {categories.map((cat, idx) => (
                        <li
                          key={idx}
                          className="text-sm px-4 py-2 lato font-medium hover:bg-[var(--color-muted-bg)] rounded cursor-pointer"
                          style={{ color: "var(--color-text-primary)" }}
                        >
                          {cat}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
              <ul
                className="flex gap-3 absolute right-0 top-1 text-sm font-medium justify-end items-end mr-0"
                style={{ color: "var(--color-text-secondary)" }}
              >
                {visibleCategories.map((cat, idx) => (
                  <li
                    key={idx}
                    className="py-2 px-4 hover:bg-[var(--color-muted-bg)] rounded-full poppins cursor-pointer"
                  >
                    {cat}
                  </li>
                ))}
                {moreCategories.length > 0 && (
                  <li className="relative">
                    <button
                      onClick={() => setShowMore(!showMore)}
                      ref={showMoreRef}
                      className="flex items-center gap-1 py-2 px-4 hover:bg-[var(--color-muted-bg)] rounded-full poppins"
                    >
                      More{" "}
                      <IoIosArrowDown
                        className="transition-transform"
                        style={{
                          transform: showMore
                            ? "rotate(180deg)"
                            : "rotate(0deg)",
                        }}
                      />
                    </button>
                    {showMore && (
                      <ul
                        className="absolute right-0 z-50 flex flex-col gap-1 mt-2 shadow-md rounded-md p-2"
                        style={{
                          backgroundColor: "var(--color-surface)",
                          border: "1px solid var(--color-border)",
                        }}
                      >
                        {moreCategories.map((cat, idx) => (
                          <li
                            key={idx}
                            className="py-2 px-4 hover:bg-[var(--color-muted-bg)] rounded poppins whitespace-nowrap cursor-pointer"
                            style={{ color: "var(--color-text-secondary)" }}
                          >
                            {cat}
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                )}
              </ul>
            </nav>
          </div>
        </div>
      </div>

      {/* Mobile Navbar */}
      <div
        className="md:hidden sticky top-0 left-0 right-0 z-50 px-4 py-2"
        style={{
          backgroundColor: "var(--color-surface)",
          borderBottom: "1px solid var(--color-border)",
        }}
      >
        <div className="flex items-center gap-3">
          <Link href="/">
            <Image
              src={logo}
              alt="iCommerce"
              className="h-full max-h-12 dark:max-h-10 w-auto dark:bg-white rounded-full px-3"
            />
          </Link>

          <div
            className="flex items-center w-full px-3 rounded-lg"
            style={{ backgroundColor: "var(--color-muted-bg)" }}
          >
            <input
              type="text"
              placeholder="Search Here"
              className="poppins w-full py-2 bg-transparent outline-none"
              style={{ color: "var(--color-text-primary)" }}
            />
            <Link href="#">
              <CiSearch
                className="text-2xl"
                style={{ color: "var(--color-text-secondary)" }}
              />
            </Link>
          </div>
          <ThemeToggle />
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div
        className="md:hidden fixed bottom-0 left-0 right-0 px-6 py-3 z-50 rounded-t-2xl flex justify-between items-center"
        style={{
          backgroundColor: "var(--color-surface)",
          borderTop: "1px solid var(--color-border)",
        }}
      >
        <NavIcon
          href="#"
          icon={<RiHome2Line className="text-[22px]" />}
          label="Home"
          active
        />
        <NavIcon
          href="#"
          icon={<CiShop className="text-[22px]" />}
          label="Shop"
        />
        <NavIcon
          href="/cart"
          icon={<CiShoppingCart className="text-[22px]" />}
          label="Cart"
        />
        <NavIcon
          href="#"
          icon={<CiUser className="text-[22px]" />}
          label="Profile"
        />
      </div>

      {/* DESKTOP SIDE MENU */}
      <div
        className="hidden md:flex flex-col gap-4 fixed bottom-[30%] -right-2 border rounded-tl-lg rounded-bl-lg p-4 shadow-lg"
        style={{
          backgroundColor: "var(--color-surface)",
          borderColor: "var(--color-border)",
        }}
      >
        <div className="hover:scale-110 transition-transform duration-150">
          <Link href="">
            <FiMessageSquare
              className="text-xl"
              style={{ color: "var(--color-text-primary)" }}
            />
          </Link>
        </div>
        <div className="hover:scale-110 transition-transform duration-150">
          <Link href="">
            <MdAddCall
              className="text-xl"
              style={{ color: "var(--color-text-primary)" }}
            />
          </Link>
        </div>
        <div className="hover:scale-110 transition-transform duration-150">
          <Link href="">
            <IoSettingsOutline
              className="text-xl"
              style={{ color: "var(--color-text-primary)" }}
            />
          </Link>
        </div>
        <div className="hover:scale-110 transition-transform duration-150">
          <Link href="">
            <IoMdHelp
              className="text-xl"
              style={{ color: "var(--color-text-primary)" }}
            />
          </Link>
        </div>
      </div>
    </>
  );
};

const NavIcon = ({ href, icon, label, active }) => (
  <div className="flex flex-col justify-center items-center">
    <Link href={href}>
      <div
        style={{
          color: active
            ? "var(--color-button-primary)"
            : "var(--color-text-secondary)",
        }}
      >
        {icon}
      </div>
    </Link>
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
  </div>
);

export default Navbar;
