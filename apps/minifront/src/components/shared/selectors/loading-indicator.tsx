import { RESOLVED_TAILWIND_CONFIG } from '@repo/tailwind-config/resolved-tailwind-config';
import { LineWave } from 'react-loader-spinner';

/**
 * A loading indicator shared by several selectors.
 */
export const LoadingIndicator = () => (
  <LineWave
    visible
    height='30'
    width='30'
    color={RESOLVED_TAILWIND_CONFIG.theme.colors['light-grey'].DEFAULT}
  />
);
