/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        abyss: {
          900: '#0D0D0F',
          800: '#111114',
          700: '#1A1A1F',
          600: '#252530',
        },
        rarity: {
          common:    '#9CA3AF',
          rare:      '#3B82F6',
          epic:      '#A855F7',
          legendary: '#F59E0B',
          abyssal:   '#EF4444',
        },
        accent: {
          purple: '#A855F7',
          gold:   '#F59E0B',
          red:    '#EF4444',
          blue:   '#3B82F6',
        },
      },
      fontFamily: {
        ui:   ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      backdropBlur: {
        glass: '12px',
      },
    },
  },
  plugins: [],
};
