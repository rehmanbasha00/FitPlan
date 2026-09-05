import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/app/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        accent: {
          DEFAULT: '#FF6A45',
          soft: '#FFE7DC',
          dark: '#E8552F'
        },
        ink: {
          DEFAULT: '#1F2126',
          soft: '#6B7280'
        },
        night: {
          DEFAULT: '#13151D',
          soft: '#1C2030'
        },
        surface: {
          DEFAULT: '#FFFFFF',
          muted: '#F6F6F8',
          shell: '#EFEFF2'
        }
      },
      borderRadius: {
        '2xl': '1.25rem',
        '3xl': '1.75rem',
        '4xl': '2rem'
      },
      boxShadow: {
        card: '0 12px 30px -12px rgba(31, 33, 38, 0.12)',
        soft: '0 4px 14px -4px rgba(31, 33, 38, 0.08)'
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif']
      }
    }
  },
  plugins: []
};

export default config;
