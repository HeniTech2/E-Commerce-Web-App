/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0F172A",
        ink2: "#1E293B",
        paper: "#FFFFFF",
        paper2: "#F8FAFC",
        surface: "#F1F5F9",
        border: "#E2E8F0",
        primary: "#4F46E5",
        primaryDark: "#4338CA",
        primaryLight: "#EEF2FF",
        accent: "#A5B4FC",
        success: "#16A34A",
        warning: "#D97706",
        danger: "#DC2626",
        stone: "#64748B",
        stoneLight: "#94A3B8",
        clay: "#4F46E5",
        gold: "#A5B4FC",
      },
      fontFamily: {
        display: ["Plus Jakarta Sans", "sans-serif"],
        body: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      boxShadow: {
        card: "0 1px 2px 0 rgba(15, 23, 42, 0.04), 0 1px 3px 0 rgba(15, 23, 42, 0.06)",
        cardHover: "0 4px 12px -2px rgba(15, 23, 42, 0.08), 0 2px 4px -2px rgba(15, 23, 42, 0.06)",
        dropdown: "0 10px 25px -5px rgba(15, 23, 42, 0.1), 0 4px 6px -4px rgba(15, 23, 42, 0.06)",
      },
      borderRadius: {
        xl: "0.875rem",
        "2xl": "1.25rem",
      },
    },
  },
  plugins: [],
}
