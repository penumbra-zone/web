'use client';

import { observer } from 'mobx-react-lite';
import { ArrowLeftRight } from 'lucide-react';
import {
  AssetSelector,
  AssetSelectorValue,
  isBalancesResponse,
  isMetadata,
} from '@penumbra-zone/ui/AssetSelector';
import { Button } from '@penumbra-zone/ui/Button';
import { useAssets } from '@/shared/state/assets';
import { useBalances } from '@/shared/state/balances';
import { useRouter } from 'next/navigation';
import { PagePath } from '@/shared/pages.ts';
import { getMetadataFromBalancesResponse } from '@penumbra-zone/getters/balances-response';
import { usePathToMetadata } from '@/shared/usePagePath';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';

const handleRouting = ({
  router,
  baseAsset,
  quoteAsset,
}: {
  router: AppRouterInstance;
  baseAsset: AssetSelectorValue | undefined;
  quoteAsset: AssetSelectorValue | undefined;
}) => {
  if (!baseAsset || !quoteAsset) {
    throw new Error('Url malformed');
  }

  let primarySymbol: string;
  let numeraireSymbol: string;

  // TODO: Create new getter in /web repo
  if (isMetadata(baseAsset)) {
    primarySymbol = baseAsset.symbol;
  } else if (isBalancesResponse(baseAsset)) {
    primarySymbol = getMetadataFromBalancesResponse(baseAsset).symbol;
  } else {
    throw new Error('unrecognized metadata for primary asset');
  }

  if (isMetadata(quoteAsset)) {
    numeraireSymbol = quoteAsset.symbol;
  } else if (isBalancesResponse(quoteAsset)) {
    numeraireSymbol = getMetadataFromBalancesResponse(quoteAsset).symbol;
  } else {
    throw new Error('unrecognized metadata for numeraireSymbol asset');
  }

  router.push(`${PagePath.Trade}/${primarySymbol}/${numeraireSymbol}`);
};

export interface PairSelectorProps {
  dialogTitle?: string;
  disabled?: boolean;
}

export const PairSelector = observer(({ disabled, dialogTitle }: PairSelectorProps) => {
  const router = useRouter();
  const { data: assets } = useAssets();
  const { data: balances } = useBalances();
  const { baseAsset, quoteAsset, error, isLoading } = usePathToMetadata();

  if (error) {
    return <div>Error loading pair selector: ${String(error)}</div>;
  }

  if (isLoading || !baseAsset || !quoteAsset) {
    return <div>Loading...</div>;
  }

  return (
    <div className='flex gap-2'>
      <AssetSelector
        value={baseAsset}
        assets={assets}
        balances={balances}
        disabled={disabled}
        dialogTitle={dialogTitle}
        onChange={val => handleRouting({ router, baseAsset: val, quoteAsset: quoteAsset })}
      />

      <Button
        priority='primary'
        iconOnly
        icon={ArrowLeftRight}
        disabled={disabled}
        onClick={() => handleRouting({ router, baseAsset: quoteAsset, quoteAsset: baseAsset })}
      >
        Swap
      </Button>

      <AssetSelector
        value={quoteAsset}
        assets={assets}
        balances={balances}
        disabled={disabled}
        dialogTitle={dialogTitle}
        onChange={val => handleRouting({ router, baseAsset: baseAsset, quoteAsset: val })}
      />
    </div>
  );
});
