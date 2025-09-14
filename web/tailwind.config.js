/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Chicken Party Theme Colors
        'chicken': {
          50: '#fef7f0',
          100: '#fdeee0', 
          200: '#fad9bd',
          300: '#f6bd94',
          400: '#f19969',
          500: '#ec7c47',
          600: '#dd5f2b',
          700: '#b84722',
          800: '#933925',
          900: '#743022'
        },
        'crust': {
          50: '#fdf8f6',
          100: '#f2e8e5', 
          200: '#eaddd7',
          300: '#e0cfc5',
          400: '#d2bab0',
          500: '#bfa094',
          600: '#a18072',
          700: '#8b6f5f',
          800: '#745e52',
          900: '#5d4a41'
        },
        'golden': {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a', 
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f'
        }
      },
      fontFamily: {
        'display': ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
