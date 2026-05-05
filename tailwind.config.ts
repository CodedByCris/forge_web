import type { Config } from 'tailwindcss'

export default {
  content: [
    './app/**/*.{js,vue,ts}',
    './nuxt.config.ts',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        forge: {
          bg:        '#0F0F0F',
          surface:   '#1A1A1A',
          surfaceAlt:'#242424',
          primary:   '#FF6200',
          accent:    '#FF9A3C',
          text:      '#EEEEEE',
          textSec:   '#CCCCCC',
          muted:     '#666666',
          success:   '#10B981',
          divider:   '#2A2A2A',
          xp:        '#8B5CF6',
        },
      },
      keyframes: {
        fadeInUp: {
          '0%':   { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%':   { opacity: '0', transform: 'scale(0.92)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        'fade-in-up':  'fadeInUp 0.6s ease forwards',
        'fade-in':     'fadeIn 0.4s ease forwards',
        'scale-in':    'scaleIn 0.25s ease forwards',
      },
      boxShadow: {
        'orange-glow':       '0 0 24px rgba(255,98,0,0.4)',
        'orange-glow-lg':    '0 0 40px rgba(255,98,0,0.55)',
        'orange-glow-hover': '0 0 32px rgba(255,98,0,0.65)',
      },
    },
  },
  plugins: [],
} satisfies Config
