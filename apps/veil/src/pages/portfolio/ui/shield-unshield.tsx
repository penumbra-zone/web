import type { ShieldedBalance, UnifiedAsset } from '@/pages/portfolio/api/use-unified-assets.ts';
import { Button } from '@penumbra-zone/ui/Button';
import { Tooltip } from '@penumbra-zone/ui/Tooltip';
import { useEffect, useState, useMemo, useCallback, lazy, Suspense } from 'react';
import { useRegistry } from '@/shared/api/registry.tsx';
import { getMetadata } from '@penumbra-zone/getters/value-view';
import { theme as penumbraTheme } from '@penumbra-zone/ui/theme';
import { UnshieldDialog } from '@/pages/portfolio/ui/unshield-dialog.tsx';
import { Skeleton } from '@/shared/ui/skeleton';
import { ShieldDialog } from '@/pages/portfolio/ui/shield-dialog.tsx';

/** Lazily-loaded Skip widget */
const LazySkipWidget = lazy(() => import('@skip-go/widget').then(mod => ({ default: mod.Widget })));

/** Cache for previously-computed IBC denoms to avoid redundant hashing */
const ibcDenomCache = new Map<string, string>();

/**
 * Returns a canonical IBC denom of the form `ibc/<SHA256>`.
 * The result is memoised in `ibcDenomCache`.
 * @param denom base or trace-path denom (e.g. `uatom` or `transfer/channel-0/uatom`)
 * @param channelId IBC channel when a trace-path needs to be constructed
 */
async function computeIbcDenom(denom: string, channelId: string): Promise<string> {
  const cacheKey = `${channelId}:${denom}`;
  const cached = ibcDenomCache.get(cacheKey);
  if (cached) {
    return cached;
  }

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
  const ibc = `ibc/${hashHex}`;
  ibcDenomCache.set(cacheKey, ibc);
  return ibc;
}

/** Fallback skeleton displayed while the Skip widget loads */
const SkeletonFallback = () => (
  <div className='flex h-[300px] w-full items-center justify-center p-4'>
    <Skeleton />
  </div>
);

/**
 * Resolves the IBC denom required to shield a given asset.
 * Handles Penumbra native assets, registry lookup and memoised hashing.
 * @returns ibcDenom (null while unresolved), sourceChainId, sourceDenom, error
 */
function useIbcDenom(asset: UnifiedAsset) {
  const { data: registry } = useRegistry();

  // Use the first public balance for the shielding operation
  const firstBalance = asset.publicBalances[0];
  const sourceChainId = firstBalance?.chainId;

  // Extract source denom information
  const sourceDenom = useMemo(() => {
    if (!firstBalance) {
      return undefined;
    }

    /* Prefer denom property when truthy; otherwise fall back to metadata base */
    return firstBalance.denom ? firstBalance.denom : getMetadata(firstBalance.valueView).base;
  }, [firstBalance]);

  const [ibcDenom, setIbcDenom] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // reset when asset changes
    setIbcDenom(null);
    setError(null);

    const getIbcDenom = async () => {
      if (!firstBalance || !sourceDenom) {
        return;
      }

      try {
        // Prefer `asset.metadata.base`, otherwise fall back to first denomUnit
        const originDenom =
          asset.metadata.base !== ''
            ? asset.metadata.base
            : (asset.metadata.denomUnits[0]?.denom ?? '');

        if (!originDenom) {
          throw new Error('Missing origin denom for asset');
        }

        // Native Penumbra asset doesn't need IBC calculation
        if (originDenom === 'upenumbra') {
          setIbcDenom('upenumbra');
          return;
        }

        // Find the connection for the source chain
        const connection = registry.ibcConnections.find(chain => chain.chainId === sourceChainId);

        if (!connection?.channelId) {
          throw new Error(`Missing IBC channelId for source chain ${sourceChainId}`);
        }

        // Calculate (or retrieve cached) IBC denom
        const calculated = await computeIbcDenom(originDenom, connection.channelId);
        setIbcDenom(calculated);
      } catch (err) {
        setError(err as Error);
        console.error('useIbcDenom error:', err);
      }
    };

    void getIbcDenom();
  }, [asset.metadata, asset.symbol, firstBalance, sourceDenom, sourceChainId, registry]);

  return { ibcDenom, sourceChainId, sourceDenom, error } as const;
}

/**
 * Theme object passed to Skip widget.
 * Wrapped in `Object.freeze` so its reference remains stable across renders,
 * preventing unnecessary re-mounts in `LazySkipWidget`.
 */
const theme = Object.freeze({
  brandColor: penumbraTheme.color.primary.main,
});

export function UnshieldButton({ asset }: { asset: ShieldedBalance }) {
  return <UnshieldDialog asset={asset} />;
}

export function GenericShieldButton() {
  const [isOpen, setIsOpen] = useState(false);

  const defaultRoute = {
    srcChainId: 'noble-1',
    srcAssetDenom: 'uusdc',
    destChainId: 'penumbra-1',
  };

  return (
    <>
      <Button
        actionType='accent'
        density='compact'
        priority='primary'
        onClick={() => setIsOpen(true)}
      >
        Shield Assets
      </Button>
      <ShieldDialog isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <Suspense fallback={<SkeletonFallback />}>
          <LazySkipWidget
            defaultRoute={defaultRoute}
            filter={{
              destination: {
                'penumbra-1': undefined,
              },
            }}
            theme={theme}
            enableAmplitudeAnalytics={false}
          />
        </Suspense>
      </ShieldDialog>
    </>
  );
}

export const ShieldButton = ({ asset }: { asset: UnifiedAsset }) => {
  const [isOpen, setIsOpen] = useState(false);

  const { ibcDenom, sourceChainId, sourceDenom } = useIbcDenom(asset);

  const disabled = ibcDenom == null;

  const handleClose = useCallback(() => setIsOpen(false), []);

  // Button with tooltip if needed
  const buttonElement = (
    <Button
      actionType='accent'
      density='slim'
      priority='secondary'
      onClick={() => setIsOpen(true)}
      disabled={disabled}
    >
      Shield
    </Button>
  );

  return (
    <>
      {disabled ? (
        <Tooltip message='Cannot determine IBC path for shielding'>{buttonElement}</Tooltip>
      ) : (
        buttonElement
      )}

      <ShieldDialog isOpen={isOpen} onClose={handleClose}>
        {sourceChainId && sourceDenom && ibcDenom ? (
          <Suspense fallback={<SkeletonFallback />}>
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
              enableAmplitudeAnalytics={false}
            />
          </Suspense>
        ) : (
          <div className='p-4 text-center text-red-500'>
            Error: Could not determine valid shielding route information.
          </div>
        )}
      </ShieldDialog>
    </>
  );
};
