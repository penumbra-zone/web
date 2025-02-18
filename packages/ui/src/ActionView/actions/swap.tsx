import { useMemo } from 'react';
import { ArrowRight } from 'lucide-react';
import { SwapView } from '@penumbra-zone/protobuf/penumbra/core/component/dex/v1/dex_pb';
import { Metadata, ValueView } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { Fee } from '@penumbra-zone/protobuf/penumbra/core/component/fee/v1/fee_pb';
import {
  getAsset1Metadata,
  getAsset2Metadata,
  getClaimFeeFromSwapView,
  getClaimTx,
} from '@penumbra-zone/getters/swap-view';
import { getOneWaySwapValues, isOneWaySwap } from '@penumbra-zone/types/swap';
import { getAmount, getMetadata } from '@penumbra-zone/getters/value-view';
import { isZero } from '@penumbra-zone/types/amount';
import { getFormattedAmtFromValueView } from '@penumbra-zone/types/value-view';
import { uint8ArrayToHex } from '@penumbra-zone/types/hex';
import { shorten } from '@penumbra-zone/types/string';
import { GetMetadataByAssetId } from '../types';
import { ValueViewComponent } from '../../ValueView';
import { useDensity } from '../../utils/density';
import { Density } from '../../Density';
import { ActionWrapper } from './wrapper';
import { ActionRow } from './action-row';

export interface SwapActionProps {
  value: SwapView;
  /** A helper needed to calculate the Swap fees */
  getMetadataByAssetId: GetMetadataByAssetId;
}

const renderAmount = (value?: ValueView) => {
  if (!value) {
    return undefined;
  }
  const symbol = getMetadata.optional(value)?.symbol;
  return symbol ? `${getFormattedAmtFromValueView(value)} ${symbol}` : undefined;
};

/**
 * For Swap and SwapClaim actions, fees contain only the assetId and amount. This function
 * calculates a Metadata from this assetId. It firstly tries to get the info from the action itself,
 * and if it fails, it takes the Metadata from the registry (or ViewService, if passed).
 */
export const parseSwapFees = (
  fee?: Fee,
  asset1?: Metadata,
  asset2?: Metadata,
  getMetadataByAssetId?: SwapActionProps['getMetadataByAssetId'],
): string | undefined => {
  if (!fee) {
    return undefined;
  }

  let metadata: Metadata | undefined = undefined;
  if (fee.assetId?.equals(asset1?.penumbraAssetId)) {
    metadata = asset1;
  }
  if (fee.assetId?.equals(asset2?.penumbraAssetId)) {
    metadata = asset1;
  }

  if (!metadata && fee.assetId && getMetadataByAssetId) {
    metadata = getMetadataByAssetId(fee.assetId);
  }

  if (metadata) {
    return renderAmount(
      new ValueView({
        valueView: {
          case: 'knownAssetId',
          value: {
            metadata,
            amount: fee.amount,
          },
        },
      }),
    );
  }

  return renderAmount(
    new ValueView({
      valueView: {
        case: 'unknownAssetId',
        value: {
          assetId: fee.assetId,
          amount: fee.amount,
        },
      },
    }),
  );
};

export const SwapAction = ({ value, getMetadataByAssetId }: SwapActionProps) => {
  const density = useDensity();

  const isOneWay = isOneWaySwap(value);
  const swap = isOneWay ? getOneWaySwapValues(value) : undefined;
  const showOutput = !!getAmount.optional(swap?.output) && !isZero(getAmount(swap?.output));
  const isVisible = value.swapView.case === 'visible';

  const unfilled = useMemo(() => {
    return renderAmount(swap?.unfilled);
  }, [swap]);

  const txId = useMemo(() => {
    const claim = getClaimTx.optional(value);
    if (!claim) {
      return undefined;
    }
    return uint8ArrayToHex(claim.inner);
  }, [value]);

  const fee = useMemo(() => {
    const claimFee = getClaimFeeFromSwapView.optional(value);
    const asset1 = getAsset1Metadata.optional(value);
    const asset2 = getAsset2Metadata.optional(value);

    return parseSwapFees(claimFee, asset1, asset2, getMetadataByAssetId);
  }, [getMetadataByAssetId, value]);

  if (!isOneWay) {
    return (
      <ActionWrapper title='Two-way swap: unsupported' opaque={value.swapView.case === 'opaque'} />
    );
  }

  return (
    <ActionWrapper
      title='Swap'
      opaque={!isVisible}
      infoRows={
        isVisible && (
          <>
            {!!fee && <ActionRow label='Swap Claim Fee' info={fee} />}
            {!!txId && (
              <ActionRow label='Swap Claim Transaction' info={shorten(txId, 8)} copyText={txId} />
            )}
            {unfilled && <ActionRow label='Unfilled Amount' info={unfilled} />}
          </>
        )
      }
    >
      {swap && (
        <Density slim>
          <ValueViewComponent
            valueView={swap.input}
            priority={density === 'sparse' ? 'primary' : 'tertiary'}
          />
          <ArrowRight className='size-3 text-neutral-contrast' />
          <ValueViewComponent
            valueView={swap.output}
            showValue={showOutput}
            priority={density === 'sparse' ? 'primary' : 'tertiary'}
          />
        </Density>
      )}
    </ActionWrapper>
  );
};
