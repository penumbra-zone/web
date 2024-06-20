import { BalancesResponse } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';
import { Metadata } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import { getAssetIdFromValueView } from '@penumbra-zone/getters/value-view';
import { getAssetId } from '@penumbra-zone/getters/metadata';
import { useStakingTokenMetadata } from '../../state/shared';
import { ReactNode } from 'react';

const hasStakingToken = (
  balancesResponses: BalancesResponse[] = [],
  stakingAssetMetadata?: Metadata,
): boolean => {
  return balancesResponses.some(asset =>
    getAssetIdFromValueView
      .optional()(asset.balanceView)
      ?.equals(getAssetId.optional()(stakingAssetMetadata)),
  );
};

export const useShouldRender = (balancesResponses: BalancesResponse[] = [], amount: number) => {
  const stakingTokenMetadata = useStakingTokenMetadata();
  const userHasStakingToken = hasStakingToken(balancesResponses, stakingTokenMetadata.data);
  const showNonNativeFeeWarning = amount > 0 && !userHasStakingToken;

  return showNonNativeFeeWarning;
};

export const NonNativeFeeWarning = ({
  balancesResponses,
  amount,
  wrap = children => children,
}: {
  balancesResponses?: BalancesResponse[];
  amount: number;
  wrap?: (children: ReactNode) => ReactNode;
}) => {
  const shouldRender = useShouldRender(balancesResponses, amount);

  if (!shouldRender) return null;

  return wrap(
    <div className='rounded border border-yellow-500 p-4 text-yellow-500'>
      <strong>Privacy Warning:</strong>
      <span className='block'>
        Using non-native tokens for transaction fees may pose a privacy risk. It is recommended to
        use the native token (UM) for better privacy and security.
      </span>
    </div>,
  );
};
