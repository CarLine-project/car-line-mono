/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#2196F3",
          dark: "#1976D2",
          light: "#90CAF9",
        },
        cream: "#F5F7FA",
        "dark-blue": "#1976D2",
        "medium-blue": "#2196F3",
        "light-blue": "#90CAF9",
        "text-primary": "#37474F",
        background: {
          DEFAULT: "#FFFFFF",
          light: "#F5F7FA",
        },
      },
    },
  },
  plugins: [],
};
