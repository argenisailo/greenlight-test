/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Canopy-inspired color palette
        primary: {
          50: '#eff8ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#4f7cff',
          600: '#4c6fff',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
        },
        canopy: {
          sidebar: '#1a1d29',
          sidebarHover: '#252937',
          blue: '#4f7cff',
          blueHover: '#4c6fff',
          text: '#1f2937',
          textMuted: '#6b7280',
          border: '#e5e7eb',
          bg: '#f8fafc',
        },
        gray: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['0.95rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
      },
    },
  },
  plugins: [],
}