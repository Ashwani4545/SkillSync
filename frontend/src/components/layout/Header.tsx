"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FileText,
  Wand2,
  GitCompare,
  MessageSquare,
  TrendingUp,
  BarChart2,
  ShieldCheck,
  DollarSign,
  HelpCircle,
  MapPin,
  Menu,
  X,
  Sparkles,
  LogIn,
  User,
  ArrowRight,
  Zap,
} from "lucide-react";
import { Dropdown, DropdownItem, PromoPanelData } from "./Dropdown";
import { ThemeToggle } from "./ThemeToggle";
import { useTheme } from "../providers/ThemeProvider";

export function Header() {
  const pathname = usePathname();
  const { theme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState("Ashwani");

  // Sync auth state from localStorage or cookies
  useEffect(() => {
    const checkAuth = () => {
      if (typeof window === "undefined") return;
      const auth =
        localStorage.getItem("user_authenticated") === "true" ||
        document.cookie.includes("user_authenticated=true");
      setIsAuthenticated(auth);
      const name = localStorage.getItem("user_name");
      if (name) setUserName(name.split(" ")[0]);
    };

    checkAuth();
    window.addEventListener("storage", checkAuth);
    return () => window.removeEventListener("storage", checkAuth);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Prevent scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  // 1. Tools Dropdown items
  const toolItems: DropdownItem[] = [
    {
      title: "Resume Analyzer",
      description: "30+ ATS checks & multi-persona score",
      href: "/analyze",
      icon: <FileText size={16} />,
      badge: "Core",
    },
    {
      title: "JD Adapter",
      description: "Tailor resume bullets to any job description",
      href: "/jd-adapter",
      icon: <Wand2 size={16} />,
    },
    {
      title: "A/B Tester",
      description: "Compare two versions head-to-head",
      href: "/compare",
      icon: <GitCompare size={16} />,
    },
    {
      title: "Interview Predictor",
      description: "Predict questions triggered by resume claims",
      href: "/interview-prep",
      icon: <MessageSquare size={16} />,
      badge: "AI",
    },
  ];

  const toolsPromo: PromoPanelData = {
    badge: "ATS AI Audit",
    headline: "Scan In 10 Seconds",
    sentence: "See why ATS bots and recruiters filter your resume in 6 seconds.",
    buttonText: "Run Free Scan",
    buttonHref: "/analyze",
  };

  // 2. Career Dropdown items
  const careerItems: DropdownItem[] = [
    {
      title: "Career Path",
      description: "Predict next role & identify skill gaps",
      href: "/career-path",
      icon: <TrendingUp size={16} />,
    },
    {
      title: "Industry Benchmark",
      description: "Compare skills against top 10% in role",
      href: "/benchmark",
      icon: <BarChart2 size={16} />,
    },
    {
      title: "Skill Authenticity",
      description: "Verify evidenced vs unsupported claims",
      href: "/analyze#skills",
      icon: <ShieldCheck size={16} />,
    },
    {
      title: "Salary Calibration",
      description: "Understand your real market value",
      href: "/salary",
      icon: <DollarSign size={16} />,
      badge: "V2 Preview",
    },
  ];

  const careerPromo: PromoPanelData = {
    badge: "Top 10% Data",
    headline: "Benchmark Skills",
    sentence: "Find out what elite candidates in your field have that you don't.",
    buttonText: "View Benchmark",
    buttonHref: "/benchmark",
  };

  // 3. Resources Dropdown items
  const resourceItems: DropdownItem[] = [
    {
      title: "How It Works",
      description: "Step-by-step ATS scoring & verification process",
      href: "/analyze#how-it-works",
      icon: <HelpCircle size={16} />,
    },
    {
      title: "Product Roadmap",
      description: "Current features and upcoming V2 pipeline",
      href: "/#roadmap",
      icon: <MapPin size={16} />,
    },
    {
      title: "Frequently Asked Questions",
      description: "Answers to common resume and scoring questions",
      href: "/analyze#faq",
      icon: <HelpCircle size={16} />,
    },
  ];

  const handleSignOut = () => {
    localStorage.removeItem("user_authenticated");
    localStorage.removeItem("user_name");
    localStorage.removeItem("user_email");
    localStorage.removeItem("user_provider");
    localStorage.removeItem("user_plan");
    document.cookie = "user_authenticated=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    setIsAuthenticated(false);
    window.location.href = "/";
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white/90 dark:bg-[#0A0F1E]/90 backdrop-blur-md border-b border-gray-200 dark:border-white/10 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Brand Logo */}
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="flex items-center gap-2.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 rounded-lg p-1"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-700 to-teal-500 flex items-center justify-center text-white font-extrabold text-lg shadow-md shadow-teal-700/20">
              S
            </div>
            <div className="flex flex-col">
              <span
                className="text-xl font-extrabold tracking-tight text-teal-700 dark:text-teal-400"
                style={{ fontFamily: "var(--font-heading, 'Syne', sans-serif)" }}
              >
                SkillSync
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Menus */}
          <nav className="hidden lg:flex items-center gap-1" aria-label="Main navigation">
            <Dropdown
              label="Tools"
              items={toolItems}
              promoPanel={toolsPromo}
              currentPath={pathname}
            />

            <Dropdown
              label="Career"
              items={careerItems}
              promoPanel={careerPromo}
              currentPath={pathname}
            />

            <Dropdown
              label="Resources"
              items={resourceItems}
              currentPath={pathname}
            />

            {/* Direct Pricing Link */}
            <Link
              href="/pricing"
              className={`px-3 py-2 text-sm font-semibold rounded-lg transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 ${
                pathname === "/pricing"
                  ? "text-teal-700 dark:text-teal-300 bg-teal-50/50 dark:bg-white/[0.04]"
                  : "text-gray-700 dark:text-gray-200 hover:text-teal-700 dark:hover:text-teal-300 hover:bg-gray-100/60 dark:hover:bg-white/[0.04]"
              }`}
            >
              Pricing
            </Link>
          </nav>
        </div>

        {/* Right side Actions */}
        <div className="hidden sm:flex items-center gap-3">
          <ThemeToggle />

          {isAuthenticated ? (
            <div className="flex items-center gap-2.5">
              <Link
                href="/dashboard"
                className="px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800"
              >
                Dashboard
              </Link>
              <button
                type="button"
                onClick={handleSignOut}
                className="text-xs font-semibold text-gray-500 hover:text-red-500 transition-colors"
              >
                Sign out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/signin"
                id="header-login-btn"
                className="px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:text-teal-700 dark:hover:text-teal-300 transition-colors rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
              >
                Login
              </Link>
              <Link
                href="/signup"
                id="header-free-account-btn"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold bg-gradient-to-r from-teal-700 to-teal-500 hover:from-teal-600 hover:to-teal-400 text-white shadow-md shadow-teal-700/20 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
              >
                <Sparkles size={14} /> Free account
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex sm:hidden items-center gap-2">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-expanded={mobileMenuOpen}
            aria-label="Toggle navigation menu"
            className="p-2 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div
          className="sm:hidden fixed inset-x-0 top-16 bottom-0 z-40 bg-white dark:bg-[#0A0F1E] border-t border-gray-200 dark:border-white/10 overflow-y-auto p-5"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile Navigation"
        >
          <div className="space-y-6">
            {/* Tools section */}
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400 mb-2">
                Tools
              </p>
              <div className="grid grid-cols-1 gap-1">
                {toolItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 text-gray-900 dark:text-white"
                  >
                    <div className="p-1.5 rounded-lg bg-teal-50 dark:bg-white/5 text-teal-700 dark:text-teal-300">
                      {item.icon}
                    </div>
                    <div>
                      <div className="text-sm font-bold">{item.title}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {item.description}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Career section */}
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400 mb-2">
                Career Intelligence
              </p>
              <div className="grid grid-cols-1 gap-1">
                {careerItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 text-gray-900 dark:text-white"
                  >
                    <div className="p-1.5 rounded-lg bg-teal-50 dark:bg-white/5 text-teal-700 dark:text-teal-300">
                      {item.icon}
                    </div>
                    <div>
                      <div className="text-sm font-bold">{item.title}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {item.description}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Direct Links */}
            <div className="pt-2 border-t border-gray-100 dark:border-white/10 space-y-1">
              <Link
                href="/pricing"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between p-2.5 rounded-xl font-bold text-gray-900 dark:text-white"
              >
                <span>Pricing</span>
                <ArrowRight size={16} className="text-gray-400" />
              </Link>
              <Link
                href="/analyze#faq"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between p-2.5 rounded-xl font-bold text-gray-900 dark:text-white"
              >
                <span>FAQs</span>
                <ArrowRight size={16} className="text-gray-400" />
              </Link>
            </div>

            {/* Auth actions */}
            <div className="pt-4 border-t border-gray-100 dark:border-white/10 space-y-2.5">
              {isAuthenticated ? (
                <div className="space-y-2">
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full py-3 px-4 rounded-xl font-bold text-center block bg-teal-600 text-white"
                  >
                    Go to Workspace Dashboard
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      handleSignOut();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full py-2.5 text-center text-sm font-semibold text-red-500"
                  >
                    Sign out
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Link
                    href="/signup"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full py-3 px-4 rounded-full font-bold text-center block bg-gradient-to-r from-teal-700 to-teal-500 text-white shadow-md"
                  >
                    Create Free Account
                  </Link>
                  <Link
                    href="/signin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full py-2.5 rounded-full text-center text-sm font-bold block border border-gray-300 dark:border-white/20 text-gray-900 dark:text-white"
                  >
                    Login to Account
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
