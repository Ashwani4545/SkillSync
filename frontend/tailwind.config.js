/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class", '[data-theme="dark"]'],
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["Syne", "sans-serif"],
        body:    ["DM Sans", "sans-serif"],
        mono:    ["DM Mono", "monospace"],
      },
      colors: {
        primary: "var(--color-primary)",
        "primary-dark": "var(--color-primary-dark)",
        "primary-light": "var(--color-primary-light)",
        accent: "var(--color-accent)",
        background: "var(--color-bg)",
        surface: "var(--color-surface)",
        "surface-card": "var(--color-surface-card)",
        "surface-hover": "var(--color-surface-hover)",
        "border-token": "var(--color-border)",
        "text-token": "var(--color-text)",
        "text-muted-token": "var(--color-text-muted)",
        "success-token": "var(--color-success)",
        "warning-token": "var(--color-warning)",
        "danger-token": "var(--color-danger)",
        teal: {
          50:  "#E1F5EE",
          100: "#B8E6D5",
          500: "#1D9E75",
          700: "#0F6E56",
          900: "#064035",
        },
      },
      borderRadius: {
        card: "12px",
        pill: "9999px",
        sm: "6px",
        md: "10px",
        lg: "16px",
        xl: "24px",
      },
    },
  },
  plugins: [],
};
