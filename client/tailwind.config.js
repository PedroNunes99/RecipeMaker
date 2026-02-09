export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sage: {
          50: '#f4f7f5',
          100: '#e2e9e5',
          200: '#c5d3cd',
          300: '#a8bdba',
          400: '#88a69d',
          DEFAULT: '#6e8c81',
          600: '#587067',
          700: '#43544d',
          800: '#2e3934',
          900: '#19201c',
        },
        earth: {
          50: '#f9f6f2',
          100: '#f2ece5',
          200: '#e5d9cc',
          300: '#d9c6b3',
          400: '#ccb39a',
          DEFAULT: '#b28d6c',
          600: '#947254',
          700: '#755842',
          800: '#573d2f',
          900: '#39251c',
        },
        cream: {
          DEFAULT: '#fcfaf7',
          dark: '#f5f0e6',
        }
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
      }
    },
  },
  plugins: [],
}
