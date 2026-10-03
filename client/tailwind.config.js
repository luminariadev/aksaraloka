/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        serif: ['Lora', 'Georgia', 'serif'],
        display: ['"Playfair Display"', 'Lora', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
      },
      colors: {
        parchment: {
          50: '#FDFBF7',
          100: '#FAF8F5',
          200: '#F4EFE6',
          300: '#EAE1D2',
          400: '#DDD0BC',
          500: '#CCAFA2',
        },
        ink: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          500: '#64748B',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A',
        },
        warmBrown: {
          50: '#FAF8F5',
          100: '#F5ECE3',
          200: '#EBDCCE',
          300: '#DCC3AD',
          400: '#BA9477',
          500: '#8E6747',
          600: '#714F33',
          700: '#543922',
          800: '#392514',
          900: '#23150A',
        },
        amberGold: {
          50: '#FFFBEB',
          100: '#FEF3C7',
          200: '#FDE68A',
          300: '#FCD34D',
          400: '#FBBF24',
          500: '#F59E0B',
          600: '#D97706',
          700: '#B45309',
        },
        emeraldSage: {
          50: '#F0FDF4',
          100: '#DCFCE7',
          200: '#BBF7D0',
          500: '#22C55E',
          600: '#16A34A',
          700: '#15803D',
          800: '#166534',
        },
      },
      boxShadow: {
        'book': '0 4px 6px -1px rgba(44, 30, 20, 0.08), 0 2px 4px -2px rgba(44, 30, 20, 0.06), -4px 0 6px -2px rgba(44, 30, 20, 0.1)',
        'book-lg': '0 20px 25px -5px rgba(44, 30, 20, 0.12), 0 8px 10px -6px rgba(44, 30, 20, 0.08), -6px 0 10px -3px rgba(44, 30, 20, 0.14)',
        'card-warm': '0 1px 3px 0 rgba(44, 30, 20, 0.06), 0 1px 2px -1px rgba(44, 30, 20, 0.04)',
        'card-warm-hover': '0 10px 20px -3px rgba(44, 30, 20, 0.08), 0 4px 6px -4px rgba(44, 30, 20, 0.04)',
      },
      borderRadius: {
        'book': '4px 12px 12px 4px',
      },
    },
  },
  plugins: [],
};
