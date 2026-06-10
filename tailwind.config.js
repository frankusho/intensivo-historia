/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Syne"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        ink:    '#0F1117',
        paper:  '#F7F6F2',
        slate:  '#6B7280',
        accent: '#5B4FE9',
        heat:   '#E9504F',
        leaf:   '#2D9E6B',
        gold:   '#D4A72C',
      },
    },
  },
  plugins: [],
}
