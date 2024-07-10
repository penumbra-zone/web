import { LineWave } from 'react-loader-spinner';

import resolveConfig from 'tailwindcss/resolveConfig';
import tailwindConfig from '@repo/tailwind-config';

// eslint-disable-next-line
const lightGrey: string = (resolveConfig(tailwindConfig).theme.colors as any)['light-grey'].DEFAULT;

/**
 * A loading indicator shared by several selectors.
 */
export const LoadingIndicator = () => <LineWave visible height='30' width='30' color={lightGrey} />;
