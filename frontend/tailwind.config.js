/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
        display: ['"Cormorant Garamond"', 'serif'],
      },
      colors: {
        void: '#0A0908', // Warmer deep black
        obsidian: '#121110', // Charcoal/warm dark
        carbon: '#1A1817', // Lighter warm dark
        zinc: {
          DEFAULT: '#22201F',
          50: '#fafafa',
          100: '#f4f4f5',
          200: '#e4e4e7',
          300: '#d4d4d8',
          400: '#a1a1aa',
          500: '#71717a',
          600: '#52525b',
          700: '#3f3f46',
          800: '#27272a',
          900: '#18181b',
          950: '#09090b',
        },
        'soft-ink': '#2A2726',
        mist: '#8A8682',
        fog: '#B0A99F',
        cream: '#EBE5DC',
        ivory: '#F4EFE6',
        'warm-beige': '#DED6C7',
        gold: '#B89B72', // More muted artistic gold
        ember: '#D4845A',
        sepia: '#8B6355',
      },

      letterSpacing: {
        'ultra': '0.4em',
        'wide-xl': '0.25em',
        'wide-lg': '0.15em',
      },
      fontSize: {
        'fluid-hero': 'clamp(3rem, 10vw, 9rem)',
        'fluid-xl': 'clamp(2rem, 6vw, 5.5rem)',
        'fluid-lg': 'clamp(1.5rem, 4vw, 3.5rem)',
        'fluid-md': 'clamp(1rem, 2.5vw, 1.75rem)',
      },
      transitionTimingFunction: {
        'expo-out': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'expo-in-out': 'cubic-bezier(0.87, 0, 0.13, 1)',
        'circ-out': 'cubic-bezier(0, 0.55, 0.45, 1)',
      },
      transitionDuration: {
        '400': '400ms',
        '600': '600ms',
        '800': '800ms',
        '1200': '1200ms',
      },
      backgroundImage: {
        'noise': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.08'/%3E%3C/svg%3E\")",
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseGold: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        }
      },
      animation: {
        'marquee': 'marquee 25s linear infinite',
        'marquee-slow': 'marquee 40s linear infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'fade-in': 'fadeIn 0.8s ease-out forwards',
        'pulse-gold': 'pulseGold 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
