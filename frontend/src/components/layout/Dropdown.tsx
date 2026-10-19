"use client";

import React, { useState, useRef, useEffect, KeyboardEvent } from "react";
import Link from "next/link";
import { ChevronDown, ArrowRight, Sparkles } from "lucide-react";

export interface DropdownItem {
  title: string;
  description: string;
  href: string;
  icon?: React.ReactNode;
  badge?: string;
}

export interface PromoPanelData {
  headline: string;
  sentence: string;
  buttonText: string;
  buttonHref: string;
  badge?: string;
}

interface DropdownProps {
  label: string;
  items: DropdownItem[];
  promoPanel?: PromoPanelData;
  currentPath?: string;
  id?: string;
}

export function Dropdown({
  label,
  items,
  promoPanel,
  currentPath = "",
  id,
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const dropdownId = id || `dropdown-${label.toLowerCase().replace(/\s+/g, "-")}`;
  const menuId = `${dropdownId}-menu`;

  // Clear hover timeout
  const clearHoverTimeout = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
  };

  const handleMouseEnter = () => {
    // Only on pointer devices that support hover
    if (window.matchMedia("(hover: hover)").matches) {
      clearHoverTimeout();
      setIsOpen(true);
    }
  };

  const handleMouseLeave = () => {
    if (window.matchMedia("(hover: hover)").matches) {
      clearHoverTimeout();
      hoverTimeoutRef.current = setTimeout(() => {
        setIsOpen(false);
      }, 180);
    }
  };

  // Close on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      clearHoverTimeout();
    };
  }, []);

  // Keyboard navigation on the trigger button
  const handleTriggerKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
      e.preventDefault();
      setIsOpen(true);
      setTimeout(() => {
        itemRefs.current[0]?.focus();
      }, 50);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setIsOpen(false);
    }
  };

  // Keyboard navigation inside the menu
  const handleItemKeyDown = (e: KeyboardEvent<HTMLAnchorElement>, index: number) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      const nextIndex = (index + 1) % items.length;
      itemRefs.current[nextIndex]?.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const prevIndex = (index - 1 + items.length) % items.length;
      itemRefs.current[prevIndex]?.focus();
    } else if (e.key === "Escape") {
      e.preventDefault();
      setIsOpen(false);
      triggerRef.current?.focus();
    } else if (e.key === "Tab") {
      // Allow natural tab exit and close menu
      setIsOpen(false);
    }
  };

  const isCurrentSection = items.some((item) => currentPath === item.href);

  return (
    <div
      ref={containerRef}
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        ref={triggerRef}
        type="button"
        id={dropdownId}
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-controls={menuId}
        onClick={() => setIsOpen((prev) => !prev)}
        onKeyDown={handleTriggerKeyDown}
        className={`group inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-bold rounded-lg transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 ${
          isOpen || isCurrentSection
            ? "text-teal-700 dark:text-teal-400 bg-teal-50/80 dark:bg-teal-950/50 shadow-sm"
            : "text-slate-800 dark:text-slate-100 hover:text-teal-700 dark:hover:text-teal-300 hover:bg-slate-100/80 dark:hover:bg-white/[0.08]"
        }`}
      >
        <span className="tracking-wide">{label}</span>
        <ChevronDown
          size={14}
          className={`transition-transform duration-200 ${
            isOpen
              ? "rotate-180 text-teal-600 dark:text-teal-400"
              : "text-slate-500 dark:text-slate-400 group-hover:text-teal-600 dark:group-hover:text-teal-400"
          }`}
          aria-hidden="true"
        />
      </button>

      {/* Dropdown panel */}
      {isOpen && (
        <div
          id={menuId}
          role="menu"
          aria-labelledby={dropdownId}
          className={`absolute left-0 mt-2 z-50 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-white/10 shadow-2xl p-4 transition-all duration-200 ${
            promoPanel ? "w-[580px] max-w-[90vw]" : "w-[340px] max-w-[90vw]"
          }`}
          style={{
            animation: "fadeUp 0.18s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          <div className={`grid ${promoPanel ? "grid-cols-1 md:grid-cols-12 gap-5" : "grid-cols-1"}`}>
            {/* Nav items list */}
            <div className={promoPanel ? "md:col-span-7 space-y-1" : "space-y-1"}>
              {items.map((item, idx) => {
                const isActive = currentPath === item.href;
                return (
                  <Link
                    key={item.href}
                    ref={(el) => {
                      itemRefs.current[idx] = el;
                    }}
                    href={item.href}
                    role="menuitem"
                    tabIndex={0}
                    onClick={() => setIsOpen(false)}
                    onKeyDown={(e) => handleItemKeyDown(e, idx)}
                    className={`group flex items-start gap-3 p-2.5 rounded-xl transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 ${
                      isActive
                        ? "bg-teal-50 dark:bg-teal-950/40 text-teal-900 dark:text-teal-200"
                        : "hover:bg-gray-50 dark:hover:bg-white/[0.04] text-gray-900 dark:text-gray-100"
                    }`}
                  >
                    {item.icon && (
                      <div className="mt-0.5 p-1.5 rounded-lg bg-teal-50 dark:bg-white/5 text-teal-700 dark:text-teal-400 group-hover:scale-110 transition-transform">
                        {item.icon}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold tracking-tight">
                          {item.title}
                        </span>
                        {item.badge && (
                          <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.2 rounded-full bg-teal-100 dark:bg-teal-900/50 text-teal-700 dark:text-teal-300">
                            {item.badge}
                          </span>
                        )}
                        {isActive && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-teal-600 text-white ml-auto">
                            Current
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1">
                        {item.description}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Promo Panel on the right */}
            {promoPanel && (
              <div className="md:col-span-5 bg-gradient-to-br from-teal-50 to-teal-100/60 dark:from-teal-950/40 dark:to-slate-800/80 rounded-xl p-4 flex flex-col justify-between border border-teal-200/60 dark:border-teal-800/40">
                <div>
                  {promoPanel.badge && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-teal-700 text-white mb-2 shadow-xs">
                      <Sparkles size={10} /> {promoPanel.badge}
                    </span>
                  )}
                  <h4
                    className="text-sm font-extrabold text-teal-950 dark:text-teal-100"
                    style={{ fontFamily: "var(--font-heading, 'Syne', sans-serif)" }}
                  >
                    {promoPanel.headline}
                  </h4>
                  <p className="text-xs text-teal-900/80 dark:text-teal-200/70 mt-1.5 leading-relaxed">
                    {promoPanel.sentence}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-teal-200/50 dark:border-teal-800/40">
                  <Link
                    href={promoPanel.buttonHref}
                    onClick={() => setIsOpen(false)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-800 dark:text-teal-300 hover:text-teal-950 dark:hover:text-white transition-colors group"
                  >
                    {promoPanel.buttonText}{" "}
                    <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
