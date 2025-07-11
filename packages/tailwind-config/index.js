import plugin from 'tailwindcss/plugin';
import tailwindCssAnimatePlugin from 'tailwindcss-animate';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
    '../../packages/ui-deprecated/components/**/*.{ts,tsx}',
    './node_modules/@penumbra-zone/ui-deprecated/components/**/*.{ts,tsx}',
    './shared/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      fontFamily: {
        body: ['Devanagari Sangam', 'sans-serif'],
        headline: ['Faktum', 'sans-serif'],
        mono: ['Iosevka Term', 'monospace'],
      },
      colors: {
        border: {
          DEFAULT: 'hsl(var(--border))',
          secondary: 'var(--border-secondary)',
          otherTonalStroke: 'rgba(250, 250, 250, 0.15)',
        },
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
          light: 'rgba(244, 156, 67, 0.25)',
          main: '#BA4D14',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        unshield: {
          light: 'rgba(193, 166, 204, 0.25)',
          main: '#705279',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        charcoal: {
          DEFAULT: 'var(--charcoal)',
          secondary: 'var(--charcoal-secondary)',
        },
        teal: {
          DEFAULT: 'var(--teal)',
          420: 'var(--teal-420)',
          700: 'var(--teal-700)',
        },
        sand: {
          DEFAULT: 'var(--sand)',
          420: 'var(--sand-420)',
          700: 'var(--sand-700)',
        },
        rust: {
          DEFAULT: 'var(--rust)',
          420: 'var(--rust-420)',
          600: 'var(--rust-600)',
        },
        black: {
          DEFAULT: 'var(--black)',
        },
        green: {
          DEFAULT: 'var(--green)',
        },
        red: {
          DEFAULT: 'var(--red)',
        },
        'light-brown': {
          DEFAULT: 'var(--light-brown)',
        },
        'light-grey': {
          DEFAULT: 'var(--light-grey)',
        },
        brown: {
          DEFAULT: 'var(--brown)',
        },
        text: {
          primary: 'var(--text-primary, #FFFFFF)',
          secondary: 'var(--text-secondary, rgba(255, 255, 255, 0.7))',
          tertiary: 'var(--text-tertiary, rgba(255, 255, 255, 0.5))',
          disabled: 'var(--text-disabled, rgba(255, 255, 255, 0.3))',
        },
        'other-tonalFill5': 'rgba(250, 250, 250, 0.05)',
        actionHoverOverlay: 'rgba(83, 174, 168, 0.15)',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'var(--radius)',
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'gradient-x': 'gradient-x 1s ease-out',
        'expand-down': 'expand 0.1s ease-in-out',
      },
      keyframes: {
        'expand-down': {
          from: { transform: 'translateY(-50%) scaleY(0)' },
          to: { transform: 'translateY(0) scaleY(1)' },
        },
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'gradient-x': {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'left center',
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center',
          },
        },
      },
      backgroundImage: {
        'card-radial': `
          radial-gradient(33% 50% at 15% 44%, color-mix(in srgb, var(--rust) 20%, transparent), transparent),
          radial-gradient(33% 40% at 105% 42%, color-mix(in srgb, var(--teal) 20%, transparent), transparent),
          radial-gradient(33% 80% at 85% 124%, color-mix(in srgb, var(--teal) 20%, transparent), transparent),
          linear-gradient(to right, var(--charcoal), var(--charcoal))
        `,
        'button-gradient':
          'linear-gradient(90deg, var(--teal-700) 0%, var(--sand-700) 25%, var(--rust-600) 50%, var(--rust-600) 50%, var(--sand-700) 75%, var(--teal-700) 100%)',
        'text-linear': 'linear-gradient(90deg, var(--teal-700), var(--sand-700), var(--rust-600))',
        'button-gradient-secondary':
          'linear-gradient(90deg, var(--teal-420) 0%, var(--sand-420) 50%, var(--rust-420) 100%)',
        logo: `
          linear-gradient(
            color-mix(in srgb, var(--charcoal) 80%, transparent),
            color-mix(in srgb, var(--charcoal) 80%, transparent)
          ),
          url('penumbra-logo.svg')
        `,
        gradientAccentRadial:
          'radial-gradient(100% 100% at 0% 0%, var(--primary-light) 0%, rgba(244, 156, 67, 0.03) 100%)',
        gradientUnshieldRadial:
          'radial-gradient(100% 100% at 0% 0%, var(--unshield-light) 0%, rgba(193, 166, 204, 0.03) 100%)',
        actionHoverOverlayImage:
          'linear-gradient(0deg, var(--Action-Hover-Overlay) 0%, var(--Action-Hover-Overlay) 100%)',
        'gradient-accent-radial-background':
          'radial-gradient(100% 100% at 0% 0%, var(--Primary-Light, rgba(244, 156, 67, 0.25)) 0%, rgba(244, 156, 67, 0.03) 100%)',
        'gradient-unshield-radial-background':
          'radial-gradient(100% 100% at 0% 0%, var(--Unshield-Light, rgba(193, 166, 204, 0.25)) 0%, rgba(193, 166, 204, 0.03) 100%)',
      },
    },
  },
  plugins: [
    tailwindCssAnimatePlugin,
    plugin(({ addUtilities, addBase, theme }) => {
      addUtilities({
        '.grid-std-spacing': {
          '@apply gap-6 md:gap-4 xl:gap-5': {},
        },
      });
      addBase({
        ':root': {
          '--text-primary': '#FFFFFF',
          '--text-secondary': 'rgba(255, 255, 255, 0.7)',
          '--text-tertiary': 'rgba(255, 255, 255, 0.5)',
          '--text-disabled': 'rgba(255, 255, 255, 0.3)',
          '--Other-Tonal-Fill-5': 'rgba(250, 250, 250, 0.05)',
          '--Action-Hover-Overlay': 'rgba(83, 174, 168, 0.15)',
          '--primary-light': 'rgba(244, 156, 67, 0.25)',
          '--unshield-light': 'rgba(193, 166, 204, 0.25)',
        },
      });
    }),
  ],
};
