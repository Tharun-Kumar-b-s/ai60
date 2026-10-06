import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#F6F7FB',
        ink: '#161B3A',
        cobalt: { DEFAULT: '#3347FF', dark: '#2335D6' },
        highlight: '#FFE14D',
        mint: '#0E9F6E',
        coral: '#E5484D',
      },
      fontFamily: {
        display: ['"Bricolage Grotesque"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sans: ['Figtree', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
export default config;
