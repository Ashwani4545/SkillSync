"use client";

import React from "react";
import { SignIn, SignUp } from "@clerk/nextjs";
import { useTheme } from "../providers/ThemeProvider";
import { isClerkConfigured } from "@/lib/clerk";

export interface AuthSuccessData {
  name: string;
  email: string;
  provider: string;
}

interface AuthCardProps {
  initialMode?: "signin" | "signup";
  onSuccess?: (user: AuthSuccessData) => void;
  onClose?: () => void;
  isModal?: boolean;
}

/**
 * Clerk owns credential validation, OAuth redirects, email verification,
 * password recovery, MFA and session creation. No client-side auth flags.
 */
export function AuthCard({ initialMode = "signin" }: AuthCardProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  if (!isClerkConfigured()) {
    return (
      <div
        role="alert"
        style={{
          width: "100%",
          maxWidth: 460,
          padding: 24,
          borderRadius: 16,
          background: isDark ? "#0F172A" : "#FFFFFF",
          color: isDark ? "#FFFFFF" : "#0F172A",
        }}
      >
        Authentication is not configured. Add a valid Clerk publishable key and
        configure the matching backend issuer/JWKS settings.
      </div>
    );
  }

  const appearance = {
    variables: {
      colorPrimary: "#0F8A68",
      colorBackground: isDark ? "#0F172A" : "#FFFFFF",
      colorText: isDark ? "#FFFFFF" : "#0F172A",
      colorInputBackground: isDark ? "#1E293B" : "#FFFFFF",
      colorInputText: isDark ? "#FFFFFF" : "#0F172A",
      borderRadius: "0.75rem",
    },
  };

  return initialMode === "signup" ? (
    <SignUp
      routing="hash"
      signInUrl="/login"
      afterSignUpUrl="/dashboard"
      appearance={appearance}
    />
  ) : (
    <SignIn
      routing="hash"
      signUpUrl="/signup"
      afterSignInUrl="/dashboard"
      appearance={appearance}
    />
  );
}

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: "signin" | "signup";
  onSuccess?: (user: AuthSuccessData) => void;
}

export function AuthModal({
  isOpen,
  onClose,
  initialMode = "signin",
}: AuthModalProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  if (!isOpen) return null;

  return (
    <div
      id="auth-modal-overlay"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflowY: "auto",
        padding: 20,
        background: isDark ? "rgba(3, 7, 18, 0.82)" : "rgba(15, 23, 42, 0.65)",
        backdropFilter: "blur(8px)",
      }}
    >
      <div style={{ width: "100%", maxWidth: 480 }}>
        <AuthCard initialMode={initialMode} isModal onClose={onClose} />
      </div>
    </div>
  );
}
