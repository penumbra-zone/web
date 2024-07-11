import { create } from '@storybook/theming/create';
import logo from './public/logo.svg';

const penumbraTheme = create({
  appBg: 'black',
  appContentBg: 'black',
  appPreviewBg: 'black',
  barBg: 'black',
  base: 'dark',
  brandImage: logo,
  brandTitle: 'Penumbra UI library',
  colorPrimary: '#8d5728',
  colorSecondary: '#629994',
  fontBase: 'Poppins',
  fontCode: '"Iosevka Term",monospace',
  textColor: 'white',
  textMutedColor: '#e3e3e3',
});

export default penumbraTheme;
