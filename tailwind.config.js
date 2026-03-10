/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'SF Pro Text', 'Segoe UI', 'sans-serif'],
      },
      colors: {
        glass: 'rgba(255,255,255,0.03)',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
