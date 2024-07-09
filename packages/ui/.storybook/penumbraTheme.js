import { create } from '@storybook/theming/create';
import logo from './public/logo.svg';

const penumbraTheme = create({
  base: 'dark',
  brandImage: logo,
  colorPrimary: '#8d5728',
  colorSecondary: '#629994',
});

export default penumbraTheme;
