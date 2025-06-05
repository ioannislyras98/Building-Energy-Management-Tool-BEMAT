/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'oklch(44.15% 0.0735 147.66)',
          bold: 'oklch(57.34% 0.1369 149.89)',
          light: 'oklch(0.75 0.1369 149.89)',
        },
      },
      fontFamily: {
        basic: ['"Noto Sans"', 'sans-serif'],
      },
      dropShadow: {
        basic: '0 3px 3px rgba(0, 0, 0, 0.25)',
      },
      backgroundImage: {
        'linear-to-t': 'linear-gradient(to top, var(--tw-gradient-stops))',
      },
      zIndex: {
        '999': '999',
        '9999': '9999',
      },
      spacing: {
        '27': '6.75rem', // 108px
      },
      blur: {
        'xs': '2px',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
