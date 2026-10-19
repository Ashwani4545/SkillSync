"use client";

import React from "react";
import { X } from "lucide-react";

export type ChipVariant = "success" | "warning" | "danger" | "neutral" | "primary" | "accent";

interface ChipProps {
  label: string;
  variant?: ChipVariant;
  icon?: React.ReactNode;
  removable?: boolean;
  onRemove?: () => void;
  onClick?: () => void;
  className?: string;
  size?: "sm" | "md";
}

export function Chip({
  label,
  variant = "neutral",
  icon,
  removable = false,
  onRemove,
  onClick,
  className = "",
  size = "md",
}: ChipProps) {
  const variantStyles: Record<ChipVariant, string> = {
    success:
      "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60",
    warning:
      "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60",
    danger:
      "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800/60",
    neutral:
      "bg-gray-100 text-gray-700 border-gray-200 dark:bg-white/5 dark:text-gray-300 dark:border-white/10",
    primary:
      "bg-teal-50 text-teal-800 border-teal-200 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-800/60",
    accent:
      "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800/60",
  };

  const sizeStyles = {
    sm: "text-xs px-2.5 py-0.5 gap-1",
    md: "text-xs px-3 py-1 gap-1.5",
  };

  const isClickable = !!onClick;

  return (
    <span
      onClick={onClick}
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={
        isClickable
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      className={`inline-flex items-center font-medium rounded-full border transition-all duration-150 ${
        variantStyles[variant]
      } ${sizeStyles[size]} ${
        isClickable ? "cursor-pointer hover:opacity-85 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-teal-500" : ""
      } ${className}`}
    >
      {icon && <span className="inline-flex shrink-0">{icon}</span>}
      <span className="truncate">{label}</span>
      {removable && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove?.();
          }}
          aria-label={`Remove ${label}`}
          className="ml-0.5 inline-flex items-center justify-center rounded-full hover:bg-black/10 dark:hover:bg-white/20 p-0.5 focus:outline-none focus:ring-1 focus:ring-current"
        >
          <X size={12} />
        </button>
      )}
    </span>
  );
}
