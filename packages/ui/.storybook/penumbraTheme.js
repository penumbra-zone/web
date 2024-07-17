import { create } from '@storybook/theming/create';
import logo from './public/logo.svg';

const penumbraTheme = create({
  base: 'dark',
  brandImage: logo,
  brandTitle: 'Penumbra UI library',
  colorPrimary: '#8d5728',
  colorSecondary: '#629994',
  fontBase: 'Poppins',
  fontCode: '"Iosevka Term",monospace',
  textMutedColor: '#e3e3e3',
});

export default penumbraTheme;
