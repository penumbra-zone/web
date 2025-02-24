import { useMemo } from 'react';
import { ArrowRight } from 'lucide-react';
import { isZero } from '@penumbra-zone/types/amount';
import { shorten } from '@penumbra-zone/types/string';
import { uint8ArrayToHex } from '@penumbra-zone/types/hex';
import { getAmount, getMetadata } from '@penumbra-zone/getters/value-view';
import { SwapClaimView } from '@penumbra-zone/protobuf/penumbra/core/component/dex/v1/dex_pb';
import { ValueView } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import {
  getOutput1Value,
  getOutput2Value,
  getSwapClaimFee,
  getOutputData,
} from '@penumbra-zone/getters/swap-claim-view';
import { Density } from '../../Density';
import { ValueViewComponent } from '../../ValueView';
import { useDensity } from '../../utils/density';
import { ActionRow } from '../shared/action-row';
import { ActionWrapper } from '../shared/wrapper';
import { parseSwapFees } from './utils';
import { ActionViewBaseProps } from '../types';

export interface SwapClaimActionProps extends ActionViewBaseProps {
  value: SwapClaimView;
}

/**
 * Based on the visibility of the SwapClaim view, retrieves its values from the `value`
 * property for 'visible', and from `outputData` for 'opaque'.
 */
const useSwapClaimValues = ({ value, getMetadataByAssetId }: SwapClaimActionProps) => {
  if (value.swapClaimView.case === 'visible') {
    const value1 = getOutput1Value.optional(value);
    const value2 = getOutput2Value.optional(value);

    return {
      value1,
      value2,
    };
  }

  const outputData = getOutputData.optional(value);
  const value1 =
    outputData?.lambda1 &&
    new ValueView({
      valueView:
        outputData.tradingPair?.asset1 && getMetadataByAssetId
          ? {
              case: 'knownAssetId',
              value: {
                amount: outputData.lambda1,
                metadata: getMetadataByAssetId(outputData.tradingPair.asset1),
              },
            }
          : {
              case: 'unknownAssetId',
              value: {
                amount: outputData.lambda1,
                assetId: outputData.tradingPair?.asset1,
              },
            },
    });

  const value2 =
    outputData?.lambda2 &&
    new ValueView({
      valueView:
        outputData.tradingPair?.asset2 && getMetadataByAssetId
          ? {
              case: 'knownAssetId',
              value: {
                amount: outputData.lambda2,
                metadata: getMetadataByAssetId(outputData.tradingPair.asset2),
              },
            }
          : {
              case: 'unknownAssetId',
              value: {
                amount: outputData.lambda2,
                assetId: outputData.tradingPair?.asset2,
              },
            },
    });

  return {
    value1,
    value2,
  };
};

export const SwapClaimAction = ({ value, getMetadataByAssetId }: SwapClaimActionProps) => {
  const density = useDensity();

  const { value1, value2 } = useSwapClaimValues({ value, getMetadataByAssetId });

  const amount1 = getAmount.optional(value1);
  const amount2 = getAmount.optional(value2);

  const txId = useMemo(() => {
    if (value.swapClaimView.case === 'opaque' || !value.swapClaimView.value?.swapTx) {
      return undefined;
    }
    return uint8ArrayToHex(value.swapClaimView.value.swapTx.inner);
  }, [value]);

  const fee = useMemo(() => {
    const claimFee = getSwapClaimFee.optional(value);
    const asset1 = getMetadata.optional(value1);
    const asset2 = getMetadata.optional(value2);
    return parseSwapFees(claimFee, asset1, asset2, getMetadataByAssetId);
  }, [getMetadataByAssetId, value1, value2, value]);

  return (
    <ActionWrapper
      title='Swap Claim'
      opaque={value.swapClaimView.case === 'opaque'}
      infoRows={
        <>
          {!!fee && <ActionRow label='Swap Claim Fee' info={fee} />}
          {!!txId && <ActionRow label='Swap Transaction' info={shorten(txId, 8)} copyText={txId} />}
        </>
      }
    >
      <Density slim>
        <ValueViewComponent
          valueView={value1}
          showValue={amount1 && !isZero(amount1)}
          priority={density === 'sparse' ? 'primary' : 'tertiary'}
        />
        <ArrowRight className='size-3 text-neutral-contrast' />
        <ValueViewComponent
          valueView={value2}
          showValue={amount2 && !isZero(amount2)}
          priority={density === 'sparse' ? 'primary' : 'tertiary'}
        />
      </Density>
    </ActionWrapper>
  );
};
