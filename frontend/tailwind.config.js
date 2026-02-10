/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ascent: {
          blue: '#2563EB',
          'blue-dark': '#1D4ED8',
          'blue-light': '#3B82F6',
        },
        learning: {
          teal: '#0D9488',
          'teal-dark': '#0F766E',
          'teal-light': '#14B8A6',
        },
        navy: {
          900: '#0a1d45',
          800: '#0f2554',
          700: '#142d63',
        },
      },
    },
  },
  plugins: [],
};
