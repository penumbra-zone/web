import { useMemo } from 'react';
import { ArrowRight } from 'lucide-react';
import { SwapView } from '@penumbra-zone/protobuf/penumbra/core/component/dex/v1/dex_pb';
import { Metadata, ValueView } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
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
import { ValueViewComponent } from '../../ValueView';
import { useDensity } from '../../utils/density';
import { Density } from '../../Density';
import { ActionWrapper } from './wrapper';
import { ActionRow } from './action-row';

export interface SwapActionProps {
  value: SwapView;
}

const renderAmount = (value?: ValueView) => {
  if (!value) {
    return undefined;
  }
  const symbol = getMetadata.optional(value)?.symbol;
  return symbol ? `${getFormattedAmtFromValueView(value)} ${symbol}` : undefined;
};

export const SwapAction = ({ value }: SwapActionProps) => {
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

  // This function calculates metadata based on fee's AssetId from input or output metadata.
  // TODO: implement fees paid from non-input/output assets (e.g. connect with registry)
  const fee = useMemo(() => {
    const claimFee = getClaimFeeFromSwapView.optional(value);
    if (!claimFee) {
      return undefined;
    }

    let metadata: Metadata | undefined = undefined;
    const asset1 = getAsset1Metadata.optional(value);
    const asset2 = getAsset2Metadata.optional(value);
    if (claimFee.assetId?.equals(asset1?.penumbraAssetId)) {
      metadata = asset1;
    }
    if (claimFee.assetId?.equals(asset2?.penumbraAssetId)) {
      metadata = asset1;
    }

    if (metadata) {
      return renderAmount(
        new ValueView({
          valueView: {
            case: 'knownAssetId',
            value: {
              metadata,
              amount: claimFee.amount,
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
            assetId: claimFee.assetId,
            amount: claimFee.amount,
          },
        },
      }),
    );
  }, [value]);

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
            {!!fee && <ActionRow label='Swap Claim fee' info={fee} />}
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
