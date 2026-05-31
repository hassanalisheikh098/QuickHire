/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#3fcf8e',
        'background-light': '#f6f8f7',
        'background-dark': '#0a0a0a',
        'sidebar-dark': '#1a1a1a',
        'card-dark': '#1c1c1c',
        'border-dark': '#2a2a2a',
        'text-muted': '#888888',
      },
      fontFamily: {
        display: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        DEFAULT: '0.5rem',
        lg: '1rem',
        xl: '1.5rem',
        full: '9999px',
      },
      keyframes: {
        ping: { '75%, 100%': { transform: 'scale(2)', opacity: '0' } },
      },
    },
  },
  plugins: [],
}
