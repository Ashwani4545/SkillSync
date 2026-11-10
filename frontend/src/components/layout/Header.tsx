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
  Users,
  ShieldAlert,
  Globe,
  Github,
  Compass,
  ChevronDown,
  LogOut,
  Settings,
} from "lucide-react";
import { Dropdown, DropdownItem, PromoPanelData } from "./Dropdown";
import { ThemeToggle } from "./ThemeToggle";
import { useTheme } from "../providers/ThemeProvider";
import { useClerk, useUser } from "@clerk/nextjs";
import { isClerkConfigured } from "@/lib/clerk";

export function Header() {
  if (!isClerkConfigured()) {
    return (
      <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white px-4 py-4 dark:border-white/10 dark:bg-[#0A0F1E]">
        <Link href="/" className="font-extrabold text-teal-700 dark:text-teal-400">SkillSync</Link>
        <span className="ml-4 text-sm text-slate-500">Configure Clerk to enable account access.</span>
      </header>
    );
  }
  return <ClerkHeader />;
}

function ClerkHeader() {
  const { isLoaded, isSignedIn, user } = useUser();
  const { signOut } = useClerk();
  const pathname = usePathname();
  const { theme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const isAuthenticated = isLoaded && Boolean(isSignedIn);
  const userFullName = user?.fullName || user?.firstName || "Account";
  const userName = user?.firstName || user?.username || "Account";
  const userEmail = user?.primaryEmailAddress?.emailAddress || "";
  const userAvatar = user?.imageUrl || null;

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
      badge: "1-Click",
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
    {
      title: "Recruiter 6s Eye-Tracker",
      description: "Simulate human glance & attention drop-offs",
      href: "/recruiter",
      icon: <Users size={16} />,
      badge: "Exclusive",
    },
    {
      title: "Language Bias Scanner",
      description: "Audit ageism, gendered & exclusionary tone",
      href: "/bias-scanner",
      icon: <ShieldAlert size={16} />,
      badge: "Inclusivity",
    },
    {
      title: "Cultural CV Adapter",
      description: "Convert between US, EU & Japanese formats",
      href: "/language-adapter",
      icon: <Globe size={16} />,
      badge: "Global",
    },
    {
      title: "GitHub Code Verifier",
      description: "Link repos & commit history to claimed skills",
      href: "/github",
      icon: <Github size={16} />,
      badge: "Verified",
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
      badge: "Trajectory",
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
      badge: "Graph",
    },
    {
      title: "Career Gap Advisor",
      description: "Reframe employment gaps constructively",
      href: "/gap-advisor",
      icon: <Compass size={16} />,
      badge: "Advisory",
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

  const handleSignOut = async () => {
    setShowUserMenu(false);
    await signOut({ redirectUrl: "/" });
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 dark:bg-[#0A0F1E]/95 backdrop-blur-md border-b border-gray-200 dark:border-white/10 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Brand Logo */}
        <div className="flex items-center flex-1 justify-start min-w-fit">
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
        </div>

        {/* Center: Desktop Navigation Menus (Centered) */}
        <nav
          className="hidden lg:flex items-center justify-center gap-1.5 flex-initial"
          aria-label="Main navigation"
        >
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
            className={`px-3.5 py-2 text-sm font-bold rounded-lg transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 tracking-wide ${
              pathname === "/pricing"
                ? "text-teal-700 dark:text-teal-400 bg-teal-50/80 dark:bg-teal-950/50 shadow-sm"
                : "text-slate-800 dark:text-slate-100 hover:text-teal-700 dark:hover:text-teal-300 hover:bg-slate-100/80 dark:hover:bg-white/[0.08]"
            }`}
          >
            Pricing
          </Link>
        </nav>

        {/* Right side Actions */}
        <div className="hidden sm:flex items-center flex-1 justify-end gap-3 min-w-fit">
          <ThemeToggle />

          {isAuthenticated ? (
            <div className="relative">
              <button
                type="button"
                id="header-user-profile-btn"
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-1.5 pl-2.5 pr-3 rounded-full bg-gray-100/90 dark:bg-white/[0.06] hover:bg-gray-200/80 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10 transition-all text-xs font-bold text-gray-900 dark:text-white"
              >
                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-teal-600 to-emerald-400 text-white flex items-center justify-center text-[10px] font-black shadow-sm overflow-hidden flex-shrink-0">
                  {userAvatar ? (
                    <img src={userAvatar} alt={userFullName} className="w-full h-full object-cover" />
                  ) : (
                    userFullName.charAt(0).toUpperCase()
                  )}
                </div>
                <span>{userName}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-teal-500/15 text-teal-600 dark:text-teal-400 font-extrabold tracking-wider">
                  ACCOUNT
                </span>
                <ChevronDown size={13} className="text-gray-400" />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-60 rounded-2xl bg-white dark:bg-[#0E1526] border border-gray-200 dark:border-white/10 shadow-2xl py-2 z-50 text-xs animate-fade-in">
                  <div className="px-4 py-2.5 border-b border-gray-100 dark:border-white/5 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-teal-600 to-emerald-400 text-white flex items-center justify-center text-xs font-black shadow-sm overflow-hidden flex-shrink-0">
                      {userAvatar ? (
                        <img src={userAvatar} alt={userFullName} className="w-full h-full object-cover" />
                      ) : (
                        userFullName.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-gray-900 dark:text-white truncate">{userFullName}</p>
                      <p className="text-gray-500 dark:text-gray-400 text-[11px] truncate">{userEmail}</p>
                      <span className="inline-block mt-1 text-[10px] font-extrabold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 px-2 py-0.5 rounded-full border border-teal-200 dark:border-teal-800">
                        Signed in with Clerk
                      </span>
                    </div>
                  </div>

                  <Link
                    href="/dashboard"
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-2.5 px-4 py-2 hover:bg-gray-50 dark:hover:bg-white/5 text-gray-700 dark:text-gray-200 transition-colors"
                  >
                    <User size={14} className="text-teal-600" />
                    <span>My Resumes & Dashboard</span>
                  </Link>

                  <Link
                    href="/analyze"
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-2.5 px-4 py-2 hover:bg-gray-50 dark:hover:bg-white/5 text-gray-700 dark:text-gray-200 transition-colors"
                  >
                    <FileText size={14} className="text-teal-600" />
                    <span>Run New ATS Audit</span>
                  </Link>

                  <Link
                    href="/recruiter"
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-2.5 px-4 py-2 hover:bg-gray-50 dark:hover:bg-white/5 text-gray-700 dark:text-gray-200 transition-colors"
                  >
                    <Users size={14} className="text-amber-500" />
                    <span>Recruiter Candidate Screener</span>
                  </Link>

                  <Link
                    href="/settings"
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-2.5 px-4 py-2 hover:bg-gray-50 dark:hover:bg-white/5 text-gray-700 dark:text-gray-200 transition-colors"
                  >
                    <Settings size={14} className="text-gray-500" />
                    <span>Account Settings</span>
                  </Link>

                  <div className="border-t border-gray-100 dark:border-white/5 my-1" />

                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="w-full text-left flex items-center gap-2.5 px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 font-bold transition-colors"
                  >
                    <LogOut size={14} />
                    <span>Sign out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/signin"
                id="header-login-btn"
                className="px-4 py-2 text-sm font-bold text-slate-800 dark:text-slate-100 hover:text-teal-700 dark:hover:text-teal-300 hover:bg-slate-100/80 dark:hover:bg-white/[0.08] transition-colors rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
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
