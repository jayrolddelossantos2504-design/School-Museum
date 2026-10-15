/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './templates/**/*.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'gtnhs-green-dark': '#0c3125',
        'gtnhs-green': '#114232',
        'gtnhs-green-light': '#185a45',
        'gtnhs-gold': '#c68a1a',
        'gtnhs-gold-light': '#e5a93c',
        'gtnhs-parchment': '#faf8f5',
      },
      fontFamily: {
        'sans': ['Plus Jakarta Sans', 'system-ui', '-apple-system', 'sans-serif'],
        'serif': ['Playfair Display', 'Georgia', 'serif'],
        'institutional': ['Cinzel', 'serif'],
      },
      screens: {
        'xs': '320px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
      }
    }
  },
  plugins: [],
}
