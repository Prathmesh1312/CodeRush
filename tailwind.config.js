/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
      colors: {
        brand: {
          50: "#eff6ff",
          100: "#dbeafe",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          900: "#1e3a8a",
        },
        dark: {
          900: "#0a0f1e",
          800: "#0d1526",
          700: "#111827",
          600: "#1f2937",
          500: "#374151",
        },
      },
      keyframes: {
        "fade-in": { "0%": { opacity: "0", transform: "translateY(20px)" }, "100%": { opacity: "1", transform: "translateY(0)" } },
        "pulse-ring": { "0%,100%": { opacity: "1" }, "50%": { opacity: "0.5" } },
        "slide-up": { "0%": { opacity: "0", transform: "translateY(40px)" }, "100%": { opacity: "1", transform: "translateY(0)" } },
        "glow": { "0%,100%": { boxShadow: "0 0 20px rgba(59,130,246,0.4)" }, "50%": { boxShadow: "0 0 40px rgba(59,130,246,0.8)" } },
      },
      animation: {
        "fade-in": "fade-in 0.5s ease-out forwards",
        "pulse-ring": "pulse-ring 2s ease-in-out infinite",
        "slide-up": "slide-up 0.6s ease-out forwards",
        "glow": "glow 2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
