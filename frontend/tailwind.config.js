/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'ink-navy': '#16233F',
        paper: '#EEF2F1',
        'signal-amber': '#F2A007',
        moss: '#3F7A55',
        rust: '#C1531B',
        slate: '#4A5560',
        'stamp-gray': '#8A8F94',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['"IBM Plex Sans"', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'stamp-down': 'stampDown 0.15s ease-out',
        'shimmer': 'shimmer 2s linear infinite',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
        'timeline-progress': 'timelineProgress 0.6s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        stampDown: {
          '0%': { transform: 'rotate(-6deg) scale(1.15)', opacity: '0' },
          '70%': { transform: 'rotate(-6deg) scale(1.05)', opacity: '1' },
          '100%': { transform: 'rotate(-6deg) scale(1)', opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
        timelineProgress: {
          '0%': { height: '0' },
          '100%': { height: 'var(--timeline-height)' },
        },
      },
    },
  },
  plugins: [],
};
