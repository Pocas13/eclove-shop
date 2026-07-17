/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        linho: {
          50: "#FAF8F4",
          100: "#F5F2EC",
          200: "#E9E3D8",
          300: "#D8CFBE",
        },
        tinta: {
          500: "#6B6559",
          700: "#3A362F",
          900: "#24211D",
        },
        garrafa: {
          600: "#4E5C4B",
          700: "#3F4A3D",
          900: "#252B24",
        },
        latao: {
          400: "#C7A574",
          500: "#B08D57",
          600: "#8F6F41",
        },
      },
      fontFamily: {
        display: ["'Fraunces'", "serif"],
        sans: ["'Inter'", "sans-serif"],
      },
    },
  },
  plugins: [],
};
