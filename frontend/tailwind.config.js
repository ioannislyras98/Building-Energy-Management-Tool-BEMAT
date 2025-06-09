/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#2d5a27",
          bold: "#1a7c3a",
          light: "#7dd3a0",
          dark: "#1a3a15",
        },
      },
      fontFamily: {
        basic: ['"Noto Sans"', "sans-serif"],
      },
      dropShadow: {
        basic: "0 3px 3px rgba(0, 0, 0, 0.25)",
      },
      backgroundImage: {
        "linear-to-t": "linear-gradient(to top, var(--tw-gradient-stops))",
      },
      zIndex: {
        999: "999",
        9999: "9999",
      },
      spacing: {
        27: "6.75rem", // 108px
      },
      blur: {
        xs: "2px",
      },
      animation: {
        fadeIn: "fadeIn 0.2s ease-in-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
};
