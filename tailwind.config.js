/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        paper: 'var(--paper)',
        ink: {
          50: 'var(--ink-50)',
          100: 'var(--ink-100)',
          200: 'var(--ink-200)',
          300: 'var(--ink-300)',
          400: 'var(--ink-400)',
          500: 'var(--ink-500)',
          600: 'var(--ink-600)',
          700: 'var(--ink-700)',
          800: 'var(--ink-800)',
          900: 'var(--ink-900)',
        },
        accent: {
          100: 'var(--accent-100)',
          200: 'var(--accent-200)',
          300: 'var(--accent-300)',
          400: 'var(--accent-400)',
          500: 'var(--accent-500)',
          600: 'var(--accent-600)',
          700: 'var(--accent-700)',
          800: 'var(--accent-800)',
        },
        success: 'var(--success)',
        warning: 'var(--warning)',
        danger: 'var(--danger)',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'Inter', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        flat: '0 1px 2px rgba(40,30,5,0.06), 0 1px 0 rgba(40,30,5,0.04)',
        raise: '0 1px 0 rgba(255,255,255,0.6) inset, 0 8px 18px -10px rgba(40,30,5,0.18)',
        'raise-lg': '0 1px 0 rgba(255,255,255,0.6) inset, 0 20px 40px -16px rgba(40,30,5,0.25)',
        'glow-y': '0 0 0 4px rgba(245,197,24,0.15), 0 8px 24px -6px rgba(245,197,24,0.5)',
      },
    },
  },
  plugins: [],
};