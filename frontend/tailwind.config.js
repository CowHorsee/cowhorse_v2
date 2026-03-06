/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: '#27245C',
          red: '#C73939',
          white: '#F2F2F2',
        },
      },
      fontFamily: {
        heading: ['Sora', 'sans-serif'],
        body: ['Manrope', 'sans-serif'],
      },
      boxShadow: {
        surface: '0 24px 36px rgba(18, 17, 36, 0.28)',
      },
    },
  },
  plugins: [],
};
