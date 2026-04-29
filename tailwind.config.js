/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          50:  '#f0f4fa',
          100: '#d9e3f0',
          200: '#b3c7e1',
          300: '#7da3cc',
          400: '#4a7db4',
          500: '#2d5c94',
          600: '#1e4578',
          700: '#1a3a65',
          800: '#1a2b4a',
          900: '#141f35',
        },
        gold: {
          400: '#f5c518',
          500: '#e6b800',
        }
      },
      fontFamily: {
        sans: ['"DM Sans"', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
}
