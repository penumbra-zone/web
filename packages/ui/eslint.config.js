import createConfig from '@penumbra-zone/configs/tailwind-eslint';
import { resolve } from 'node:path';

export default createConfig(resolve('./src/theme/theme.css'));
