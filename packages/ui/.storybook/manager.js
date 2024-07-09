import { addons } from '@storybook/manager-api';
import penumbraTheme from './penumbraTheme';

addons.setConfig({
  showToolbar: true,
  theme: penumbraTheme,
  sidebar: {
    collapsedRoots: ['Deprecated'],
  },
});
