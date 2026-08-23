import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: ['./src/**/*.{ts,tsx,js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0A0C10',
        surface: '#12151C',
        surface2: '#171B24',
        border: '#232833',
        muted: '#8A93A6',
        primary: '#6C5CE7',
        gain: '#34D399',
        loss: '#FB7185',
        warn: '#FBBF24',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        xl2: '1.25rem',
      },
    },
  },
  plugins: [],
};

export default config;
