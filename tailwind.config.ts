import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        terracotta: {
          DEFAULT: '#C84B31',
          deep: '#A6361F',
          darker: '#7A2818',
        },
        cream: {
          DEFAULT: '#FAF3E7',
          warm: '#fdf8ee',
          deep: '#f3e9d4',
        },
        sand: {
          DEFAULT: '#e8dcc1',
          deep: '#d9c9a7',
        },
        ink: {
          DEFAULT: '#2D2A26',
          soft: '#4a3f31',
          faded: '#8a7d6a',
        },
        favor: {
          DEFAULT: '#7A8450',
          bg: '#f4f6ec',
        },
        avoid: {
          DEFAULT: '#6b2a1a',
          bg: '#fbf0ec',
        },
      },
      fontFamily: {
        display: ['var(--font-fraunces)', 'Georgia', 'serif'],
        body: ['var(--font-inter-tight)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-jetbrains-mono)', 'ui-monospace', 'monospace'],
        sanskrit: [
          'var(--font-noto-devanagari)',
          'var(--font-fraunces)',
          '"Noto Serif Devanagari"',
          'Georgia',
          'serif',
        ],
      },
      letterSpacing: {
        widest2: '0.2em',
        widest3: '0.3em',
      },
      boxShadow: {
        report: '0 24px 60px -20px rgba(45, 42, 38, 0.25)',
        cta: '0 12px 30px -12px rgba(122, 40, 24, 0.45)',
      },
      maxWidth: {
        copy: '540px',
        prose540: '540px',
      },
    },
  },
  plugins: [],
};

export default config;
