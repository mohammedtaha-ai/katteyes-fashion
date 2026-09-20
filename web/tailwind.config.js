/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: { DEFAULT: '#111111', accent: '#d4af37', light: '#f9f9f9' },
      },
      fontFamily: { sans: ['Tajawal', 'sans-serif'] },
    },
  },
  plugins: [],
}
