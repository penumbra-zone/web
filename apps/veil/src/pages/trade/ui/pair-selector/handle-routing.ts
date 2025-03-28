import { useRouter } from 'next/navigation';
import { getMetadataFromBalancesResponse } from '@penumbra-zone/getters/balances-response';
import { PagePath } from '@/shared/const/pages';
import {
  AssetSelectorValue,
  isBalancesResponse,
  isMetadata,
} from '@penumbra-zone/ui/AssetSelector';

export const handleRouting = ({
  router,
  baseAsset,
  quoteAsset,
}: {
  router: ReturnType<typeof useRouter>;
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
