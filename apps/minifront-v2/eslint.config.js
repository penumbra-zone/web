import createConfig from '@penumbra-zone/configs/tailwind-eslint';
import { createRequire } from 'node:module';

const config = createConfig(createRequire(import.meta.url).resolve('@penumbra-zone/ui/theme.css'));

export default config;
