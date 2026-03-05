/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./pages/**/*.{js,jsx}', './components/**/*.{js,jsx}'],
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
      backgroundImage: {
        app: 'radial-gradient(circle at 0 0, #3b3874 0, transparent 38%), linear-gradient(165deg, #27245c 0%, #1e1c46 40%, #161436 100%)',
      },
    },
  },
  plugins: [],
};
