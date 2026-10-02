const path = require('path');

const srcPath = path.resolve(__dirname, 'src/**/*.{js,ts,jsx,tsx}').replace(/\\/g, '/');
const indexPath = path.resolve(__dirname, 'index.html').replace(/\\/g, '/');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    indexPath,
    srcPath
  ],
  theme: {
    extend: {
      colors: {
        cream: '#F0EDDF',
        charcoal: '#292B23',
        black: '#292B23',
        red: {
          DEFAULT: '#BC4129',
          50: '#FBF5F4',
          100: '#F6E6E3',
          200: '#ECCAC3',
          300: '#E0A89C',
          400: '#CF6F5B',
          500: '#BC4129',
          600: '#A3341E',
          700: '#862916',
          800: '#6A1E0E',
          900: '#52160A',
        },
        beige: {
          DEFAULT: '#E2DFCE',
          50: '#F0EDDF',
          100: '#EAE7D8',
          200: '#E2DFCE',
          300: '#D5D1BD',
          400: '#C3C2AF',
        },
        blue: {
          DEFAULT: '#486789',
          50: '#F2F5F8',
          100: '#E2E8F0',
          200: '#C5D3E1',
          300: '#A1B7CF',
          400: '#728EB1',
          500: '#486789',
          600: '#385270',
          700: '#2C3E56',
          800: '#1F2C3E',
          900: '#141D2B',
        },
        muted: '#C3C2AF',
        slate: {
          950: '#F0EDDF',
          900: '#E2DFCE',
          850: '#E2DFCE',
          800: '#C3C2AF',
          700: '#A3A28F',
          600: '#7B7C6C',
          500: '#5C5E4F',
          400: '#292B23',
          300: '#292B23',
          200: '#292B23',
          100: '#292B23',
          50: '#292B23',
        },
        purple: {
          500: '#BC4129',
          600: '#BC4129',
          700: '#486789',
          400: '#BC4129',
          300: '#BC4129',
          200: '#BC4129',
          100: '#E2DFCE',
          900: '#E2DFCE',
          950: '#F0EDDF',
        },
        indigo: {
          500: '#486789',
          600: '#486789',
          700: '#385270',
          400: '#486789',
          300: '#486789',
          200: '#486789',
          100: '#E2DFCE',
          900: '#E2DFCE',
          950: '#F0EDDF',
        },
        cyan: {
          400: '#BC4129',
          500: '#BC4129',
          300: '#BC4129',
          200: '#BC4129',
        },
        emerald: {
          400: '#486789',
          500: '#486789',
          300: '#486789',
        },
        rose: {
          400: '#BC4129',
          500: '#BC4129',
          600: '#BC4129',
          300: '#BC4129',
        },
        amber: {
          400: '#BC4129',
          500: '#BC4129',
          300: '#BC4129',
        }
      }
    },
  },
  plugins: [],
}
