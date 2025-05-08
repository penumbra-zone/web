import type { ShieldedBalance, UnifiedAsset } from '@/pages/portfolio/api/use-unified-assets.ts';
import { Button } from '@penumbra-zone/ui/Button';
import { Tooltip } from '@penumbra-zone/ui/Tooltip';
import { useEffect, useState, useMemo, lazy, Suspense } from 'react';
import { X } from 'lucide-react';
import { useRegistry } from '@/shared/api/registry.tsx';
import { getMetadata } from '@penumbra-zone/getters/value-view';
import { theme as penumbraTheme } from '@penumbra-zone/ui/theme';
import { UnshieldDialog } from '@/pages/portfolio/ui/unshield-dialog.tsx';

// Use React.lazy for the Widget
const LazySkipWidget = lazy(() => import('@skip-go/widget').then(mod => ({ default: mod.Widget })));

/**
 * Computes the IBC denom hash for Penumbra-1
 * If the denom already starts with "ibc/", it's assumed to be already computed.
 * If the denom starts with "transfer/", it's assumed to be a full trace path.
 * Otherwise, constructs the trace path using channelId and denom.
 */
async function computeIbcDenom(denom: string, channelId: string): Promise<string> {
  // Check if denom is already an IBC hash
  if (denom.startsWith('ibc/')) {
    return denom;
  }
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

export function UnshieldButton({ asset }: { asset: ShieldedBalance }) {
  return <UnshieldDialog asset={asset} />;
}

const theme = {
  brandColor: penumbraTheme.color.primary.main,
  primary: {
    background: {
      normal: penumbraTheme.gradient.accentRadialBackground,
      transparent: penumbraTheme.color.base.transparent,
    },
    text: {
      normal: penumbraTheme.color.text.primary,
      lowContrast: penumbraTheme.color.text.primary,
      ultraLowContrast: penumbraTheme.color.text.primary,
    },
    ghostButtonHover: penumbraTheme.color.primary.main,
  },

  success: {
    text: penumbraTheme.color.success.main,
  },
  warning: {
    background: penumbraTheme.color.caution.main,
    text: penumbraTheme.color.text.primary,
  },
  error: {
    background: penumbraTheme.color.destructive.main,
    text: penumbraTheme.color.text.primary,
  },
};

export const ShieldButton = ({ asset }: { asset: UnifiedAsset }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [ibcDenom, setIbcDenom] = useState<string | null>(null);
  const [isDisabled, setIsDisabled] = useState(true);
  const { data: registry } = useRegistry();

  // Use the first public balance for the shielding operation
  const firstBalance = asset.publicBalances[0];
  const sourceChainId = firstBalance?.chainId;

  // Extract source denom information
  const sourceDenom = useMemo(() => {
    if (!firstBalance) {
      return undefined;
    }

    // Try using the denom property directly
    if (firstBalance.denom) {
      return firstBalance.denom;
    }

    return getMetadata(firstBalance.valueView).base;
  }, [firstBalance]);

  useEffect(() => {
    // Reset state on asset change
    setIbcDenom(null);
    setIsDisabled(true);

    const getIbcDenom = async () => {
      // Skip if no public balances or source denom
      if (!firstBalance || !sourceDenom) {
        return;
      }

      try {
        // Use base denom if available, otherwise try to get from denomUnits
        const originDenom = asset.metadata.base || (asset.metadata.denomUnits[0]?.denom ?? '');

        if (!originDenom) {
          console.error('ShieldButton: Missing origin denom for asset:', asset.symbol);
          return;
        }

        // Native Penumbra asset doesn't need IBC calculation
        if (originDenom === 'upenumbra') {
          setIbcDenom('upenumbra');
          setIsDisabled(false);
          return;
        }

        // Find the connection for the source chain
        const connection = registry.ibcConnections.find(chain => chain.chainId === sourceChainId);

        if (!connection?.channelId) {
          console.error(
            `ShieldButton: Missing IBC channelId for source chain ${sourceChainId} for asset:`,
            asset.symbol,
          );
          return;
        }

        // Calculate the IBC denom
        const calculatedDenom = await computeIbcDenom(originDenom, connection.channelId);
        setIbcDenom(calculatedDenom);
        setIsDisabled(false);
      } catch (error) {
        console.error(
          'ShieldButton: Failed to compute IBC denom for asset:',
          asset.symbol,
          'Error:',
          error,
        );
      }
    };

    void getIbcDenom();
  }, [asset.symbol, asset.metadata, sourceChainId, registry, firstBalance, sourceDenom]);

  // Button with tooltip if needed
  const buttonElement = (
    <Button
      actionType='accent'
      density='slim'
      priority='secondary'
      onClick={() => setIsOpen(true)}
      disabled={isDisabled}
    >
      Shield
    </Button>
  );

  return (
    <>
      {isDisabled ? (
        <Tooltip message='Cannot determine IBC path for shielding'>{buttonElement}</Tooltip>
      ) : (
        buttonElement
      )}

      {isOpen && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50'>
          <div className='bg-[#1E1E1E] rounded-lg p-6 max-w-2xl w-full mx-4 relative'>
            <button
              onClick={() => setIsOpen(false)}
              className='absolute top-4 right-4 text-white hover:text-gray-300'
            >
              <X size={24} />
            </button>

            {sourceChainId && sourceDenom && ibcDenom ? (
              <Suspense fallback={<div className='text-center p-4'>Loading widget...</div>}>
                <LazySkipWidget
                  key={`${sourceChainId}-${sourceDenom}-${ibcDenom}`}
                  defaultRoute={{
                    srcChainId: sourceChainId,
                    destChainId: 'penumbra-1',
                    srcAssetDenom: sourceDenom,
                    destAssetDenom: ibcDenom,
                  }}
                  filter={{
                    destination: {
                      'penumbra-1': undefined,
                    },
                    source: {
                      [sourceChainId]: undefined,
                    },
                  }}
                  theme={theme}
                />
              </Suspense>
            ) : (
              <div className='text-red-500 p-4 text-center'>
                Error: Could not determine valid shielding route information.
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
