import { Widget } from '@skip-go/widget';

const defaultRoute = {
  srcChainId: 'noble-1',
  srcAssetDenom: 'ausdy',
  destChainId: 'penumbra-1',
};

const filter = {
  destination: {
    'penumbra-1': undefined,
  },
};

const theme = {
  brandColor: '#b463e9',
  primary: {
    background: {
      normal: '#000000',
      transparent: 'rgba(30, 30, 30, 0.8)',
    },
    text: {
      normal: '#FFFFFF',
      lowContrast: '#CCCCCC',
      ultraLowContrast: '#888888',
    },
    ghostButtonHover: '#b463e9',
  },
  secondary: {
    background: {
      normal: '#2A2A2A',
      transparent: 'rgba(42, 42, 42, 0.8)',
      hover: '#3A3A3A',
    },
  },
  success: {
    text: '#4CAF50',
  },
  warning: {
    background: '#FF9800',
    text: '#FFFFFF',
  },
  error: {
    background: '#F44336',
    text: '#FFFFFF',
  },
};

export const DepositSkip = () => {
  return <Widget defaultRoute={defaultRoute} filter={filter} theme={theme} />;
};
