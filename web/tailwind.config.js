/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#0F172A',
          accent: '#E5A83B',
          'accent-dark': '#D97706',
          light: '#F8FAFC',
          surface: '#F1F5F9',
        },
        status: {
          success: '#10B981',
          danger: '#EF4444',
          info: '#3B82F6',
        },
      },
      fontFamily: { sans: ['Tajawal', 'sans-serif'] },
      borderRadius: {
        xl: '12px',
        '2xl': '16px',
      },
    },
  },
  plugins: [],
}

