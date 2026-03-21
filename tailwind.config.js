/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./app/**/*.{ts,tsx}', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        border:     'hsl(var(--border))',
        input:      'hsl(var(--input))',
        ring:       'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT:    'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT:    'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT:    'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT:    'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        card: {
          DEFAULT:    'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        navy:  '#1a2b3d',
        teal:  '#008490',
        steel: '#4b6b8b',
        sand:  '#f0f6fb',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      fontFamily: {
        display: ['var(--font-comfortaa)', 'Comfortaa', 'sans-serif'],
        body:    ['var(--font-dm-sans)', '"DM Sans"', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        'accordion-down': { from: { height: '0' }, to: { height: 'var(--radix-accordion-content-height)' } },
        'accordion-up':   { from: { height: 'var(--radix-accordion-content-height)' }, to: { height: '0' } },
        fadeUp:       { from: { opacity: '0', transform: 'translateY(14px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        slideInFwd:   { from: { opacity: '0', transform: 'translateX(30px)' }, to: { opacity: '1', transform: 'translateX(0)' } },
        slideInBack:  { from: { opacity: '0', transform: 'translateX(-30px)' }, to: { opacity: '1', transform: 'translateX(0)' } },
        cardEntrance: { from: { opacity: '0', transform: 'translateY(22px) scale(0.94)' }, to: { opacity: '1', transform: 'translateY(0) scale(1)' } },
        cardIn:       { from: { opacity: '0', transform: 'translateY(8px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        chipIn:       { from: { opacity: '0', transform: 'scale(0.7) translateY(6px)' }, to: { opacity: '1', transform: 'scale(1) translateY(0)' } },
        badgePulse:   { '0%,100%': { boxShadow: '0 0 0 0 rgba(0,132,144,0)' }, '50%': { boxShadow: '0 0 0 7px rgba(0,132,144,.18)' } },
        aurora:       { from: { backgroundPosition: '50% 50%, 50% 50%' }, to: { backgroundPosition: '350% 50%, 350% 50%' } },
      },
      animation: {
        'fade-up':       'fadeUp .55s cubic-bezier(0.16,1,0.3,1) both',
        'slide-fwd':     'slideInFwd .32s cubic-bezier(0.16,1,0.3,1) both',
        'slide-back':    'slideInBack .32s cubic-bezier(0.16,1,0.3,1) both',
        'card-entrance': 'cardEntrance .55s cubic-bezier(0.34,1.56,0.64,1) both',
        'card-in':       'cardIn .3s ease forwards',
        'chip-in':       'chipIn .38s cubic-bezier(0.34,1.56,0.64,1) both',
        'badge-pulse':   'badgePulse 3s ease-in-out 1.4s infinite',
        aurora:          'aurora 60s linear infinite',
      },
    },
  },
  plugins: [],
}
