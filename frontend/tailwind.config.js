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
          purple: '#7C3AED',
          'purple-dark': '#6D28D9',
          'purple-light': '#8B5CF6',
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
