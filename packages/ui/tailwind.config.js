const sharedConfig = require('tailwind-config/tailwind.config.js');

// module.exports = {
//   // prefix ui lib classes to avoid conflicting with the app
//   prefix: 'ui-',
//   presets: [sharedConfig],
// };

module.exports = {
  prefix: 'ui-',
  content: ['./pages/**/*.tsx', './components/**/*.tsx'],

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
