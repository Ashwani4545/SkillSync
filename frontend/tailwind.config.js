/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["Syne", "sans-serif"],
        body:    ["DM Sans", "sans-serif"],
        mono:    ["DM Mono", "monospace"],
      },
      colors: {
        teal: {
          50:  "#E1F5EE",
          100: "#B8E6D5",
          500: "#1D9E75",
          700: "#0F6E56",
          900: "#064035",
        },
      },
      borderRadius: {
        sm: "6px",
        md: "10px",
        lg: "16px",
        xl: "24px",
      },
    },
  },
  plugins: [],
};
