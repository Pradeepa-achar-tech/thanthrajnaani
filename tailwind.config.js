/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        accent: {
          50:  '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        },
        // Supporting aurora palette (used for glows, gradients, accents)
        aurora: {
          violet: '#8b5cf6',
          fuchsia: '#d946ef',
          pink: '#ec4899',
          cyan: '#22d3ee',
        },
        ink: '#06070f', // deep base behind the aurora
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['Sora', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glow-orange': '0 0 50px -12px rgba(249, 115, 22, 0.55)',
        'glow-fuchsia': '0 0 50px -12px rgba(217, 70, 239, 0.5)',
        'glow-violet': '0 0 50px -12px rgba(139, 92, 246, 0.5)',
        'glow-cyan': '0 0 50px -12px rgba(34, 211, 238, 0.45)',
      },
      keyframes: {
        'aurora-1': {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '50%': { transform: 'translate(8%, 6%) scale(1.15)' },
        },
        'aurora-2': {
          '0%, 100%': { transform: 'translate(0, 0) scale(1.1)' },
          '50%': { transform: 'translate(-7%, 5%) scale(0.95)' },
        },
        'aurora-3': {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '50%': { transform: 'translate(6%, -8%) scale(1.2)' },
        },
        'gradient-pan': {
          '0%': { backgroundPosition: '0% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'cursor-blink': {
          '0%, 49%': { opacity: '1' },
          '50%, 100%': { opacity: '0' },
        },
      },
      animation: {
        'aurora-1': 'aurora-1 18s ease-in-out infinite',
        'aurora-2': 'aurora-2 24s ease-in-out infinite',
        'aurora-3': 'aurora-3 21s ease-in-out infinite',
        'gradient-pan': 'gradient-pan 6s linear infinite',
        'fade-in': 'fade-in 0.35s ease-out both',
        'cursor-blink': 'cursor-blink 1s steps(1) infinite',
      },
    },
  },
  plugins: [],
}
