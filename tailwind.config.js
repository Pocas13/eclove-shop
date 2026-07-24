/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        areia: { 50: "#FBFAF7", 100: "#F3F0E9", 200: "#E7E0D4", 300: "#D5C9B8" },
        tinta: { 500: "#6B6B66", 700: "#3B3B37", 900: "#171815" },
        mare: { 500: "#8A733F", 600: "#6C5930", 700: "#4D4024" },
        prata: { 400: "#D5C9B8", 500: "#B8AA98", 600: "#8F8170" },
        calcario: { 50: "#FBFAF7", 100: "#F3F0E9", 200: "#E7E0D4", 300: "#D5C9B8" },
        grafite: { 500: "#6B6B66", 700: "#3B3B37", 900: "#171815" },
        barro: { 400: "#B79A5B", 500: "#8A733F", 600: "#6C5930", 700: "#4D4024" },
        folha: { 500: "#315D4A", 700: "#244536" },
      },
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        sans: ["'DM Sans'", "sans-serif"],
      },
      boxShadow: { soft: "0 18px 45px rgba(23,24,21,.08)" },
    },
  },
  plugins: [],
};
