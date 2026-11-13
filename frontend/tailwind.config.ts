import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        ocean: {
          50: '#F0F9FF',
          100: '#E0F2FE',
          300: '#7DD3FC',
          600: '#0284C7',
          700: '#0369A1',
          900: '#0C4A6E',
        },
        canvas: '#F8FAFC',
        profit: {
          DEFAULT: '#10B981',
          bg: '#ECFDF5',
        },
        drawdown: {
          DEFAULT: '#F59E0B',
          bg: '#FFFBEB',
        },
      },
    },
  },
  plugins: [],
};
export default config;
