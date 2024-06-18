import resolveConfig from 'tailwindcss/resolveConfig';
import tailwindConfig from '@repo/tailwind-config';

export const RESOLVED_TAILWIND_CONFIG = resolveConfig(tailwindConfig);
