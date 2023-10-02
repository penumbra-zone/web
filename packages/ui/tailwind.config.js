/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
    '../../packages/ui/components/**/*.{ts,tsx}',
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
      },
      colors: {
        border: {
          DEFAULT: 'hsl(var(--border))',
          secondary: 'var(--border-secondary)',
        },
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
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
          DEFAULT: 'var(light-grey)',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'gradient-x': 'gradient-x 1s ease-out',
      },
      keyframes: {
        'accordion-down': {
          from: { height: 0 },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: 0 },
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
        'card-radial':
          'radial-gradient(33% 50% at 15% 44%, var(--rust), transparent),radial-gradient(33% 40% at 105% 42%, var(--teal), transparent),radial-gradient(33% 80% at 85% 124%, var(--teal), transparent)',
        'button-gradient':
          'linear-gradient(90deg, var(--teal-700) 0%, var(--sand-700) 25%, var(--rust-600) 50%, var(--rust-600) 50%, var(--sand-700) 75%, var(--teal-700) 100%)',
        'text-linear': 'linear-gradient(90deg, var(--teal-700), var(--sand-700), var(--rust-600))',
        'button-gradient-secondary':
          'linear-gradient(90deg, var(--teal-420) 0%, var(--sand-420) 50%, var(--rust-420) 100%)',
        logo: "url('penumbra-logo.svg')",
      },
      backgroundPosition: {
        'right-center': 'right center',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
