import { Widget } from '@skip-go/widget';

const defaultRoute = {
  srcChainId: 'osmosis-1',
  srcAssetDenom: 'ibc/498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4', // $USDC on osmosis
  destChainId: 'penumbra-1',
  destAssetDenom: 'ibc/F082B65C88E4B6D5EF1DB243CDA1D331D002759E938A0F5CD3FFDC5D53B3E349', // $UM on penumbra
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
