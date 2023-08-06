const colors = require('tailwindcss/colors');

module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    // '../../packages/ui/**/*{.js,.ts,.jsx,.tsx}',
  ],
  theme: {
    extend: {
      colors: {
        blue: colors.blue[500],
        red: colors.red[500],
      },
    },
  },
  plugins: [],
};
