import type { UnifiedAsset } from '@/pages/portfolio/api/use-unified-assets.ts';
import { Button } from '@penumbra-zone/ui/Button';
import { Widget } from '@skip-go/widget';
import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { useRegistry } from '@/shared/api/registry.ts';

/**
 * Computes the IBC denom hash for Penumbra-1
 * If the denom already starts with "transfer/", it's assumed to be a full trace path
 * Otherwise, constructs the trace path using channelId and denom
 */
async function computeIbcDenom(denom: string, channelId: string): Promise<string> {
  // Check if denom already is a full trace path
  const ibcTraceStr = denom.startsWith('transfer/') ? denom : `transfer/${channelId}/${denom}`;

  // Convert string to bytes using TextEncoder
  const encoder = new TextEncoder();
  const encodedString = encoder.encode(ibcTraceStr);

  // Hash using SHA-256
  const hashBuffer = await crypto.subtle.digest('SHA-256', encodedString);

  // Convert to hex string and uppercase
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase();

  // Return in ibc/HASH format
  return `ibc/${hashHex}`;
}

// @ts-expect-error TODO: implement
export function UnshieldButton({ _asset }: { _asset: UnifiedAsset }) {
  return (
    <Button
      onClick={() => {
        // invoke dialog from minifront here
      }}
    >
      Unshield
    </Button>
  );
}

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

export const ShieldButton = ({ asset }: { asset: UnifiedAsset }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [ibcDenom, setIbcDenom] = useState<string>();
  const { data: registry } = useRegistry();

  useEffect(() => {
    const getIbcDenom = async () => {
      if (asset.publicBalance?.chains[0]) {
        try {
          // Get the channelId for the asset's origin chain
          const channelId =
            registry?.ibcConnections.find(chain => chain.chainId === asset.publicBalance?.chains[0])
              ?.channelId ?? '';

          // Use base denom if available, otherwise try to get from denomUnits
          const originDenom = asset.metadata.base || (asset.metadata.denomUnits[0]?.denom ?? '');
          if (originDenom === 'upenumbra') {
            setIbcDenom('upenumbra');
            return;
          }
          if (channelId && originDenom) {
            const denom = await computeIbcDenom(originDenom, channelId);
            setIbcDenom(denom);
          }
        } catch (error) {
          // Fallback to undefined if computation fails
        }
      }
    };

    void getIbcDenom();
  }, [asset, registry?.ibcConnections]);

  return (
    <>
      <Button
        actionType={'accent'}
        density='slim'
        priority='secondary'
        onClick={() => setIsOpen(true)}
      >
        Shield
      </Button>

      {isOpen && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50'>
          <div className='bg-[#1E1E1E] rounded-lg p-6 max-w-2xl w-full mx-4 relative'>
            <button
              onClick={() => setIsOpen(false)}
              className='absolute top-4 right-4 text-white hover:text-gray-300'
            >
              <X size={24} />
            </button>
            <Widget
              defaultRoute={{
                srcChainId: asset.publicBalance?.chains[0],
                destChainId: 'penumbra-1',
                srcAssetDenom:
                  asset.publicBalance?.valueView?.valueView.case === 'knownAssetId'
                    ? asset.publicBalance.valueView.valueView.value.metadata?.denomUnits[0]?.denom
                    : undefined,
                destAssetDenom:
                  ibcDenom ??
                  (asset.publicBalance?.valueView?.valueView.case === 'knownAssetId'
                    ? asset.publicBalance.valueView.valueView.value.metadata?.denomUnits[0]?.denom
                    : undefined),
              }}
              filter={{
                destination: {
                  'penumbra-1': undefined,
                },
                source: {
                  [asset.publicBalance?.chains[0] ?? '']: undefined,
                },
              }}
              theme={theme}
            />
          </div>
        </div>
      )}
    </>
  );
};
