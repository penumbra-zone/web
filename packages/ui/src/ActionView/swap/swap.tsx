import { useMemo } from 'react';
import { ArrowRight } from 'lucide-react';
import { SwapView } from '@penumbra-zone/protobuf/penumbra/core/component/dex/v1/dex_pb';
import {
  getAsset1Metadata,
  getAsset2Metadata,
  getClaimFeeFromSwapView,
  getClaimTx,
} from '@penumbra-zone/getters/swap-view';
import { getOneWaySwapValues, isOneWaySwap } from '@penumbra-zone/types/swap';
import { getAmount } from '@penumbra-zone/getters/value-view';
import { isZero } from '@penumbra-zone/types/amount';
import { uint8ArrayToHex } from '@penumbra-zone/types/hex';
import { shorten } from '@penumbra-zone/types/string';
import { ActionViewBaseProps } from '../types';
import { ValueViewComponent } from '../../ValueView';
import { useDensity } from '../../utils/density';
import { Density } from '../../Density';
import { ActionWrapper } from '../shared/wrapper';
import { ActionRow } from '../shared/action-row';
import { parseSwapFees, renderAmount } from './utils';

export interface SwapActionProps extends ActionViewBaseProps {
  value: SwapView;
}

export const SwapAction = ({ value, getMetadata }: SwapActionProps) => {
  const density = useDensity();

  const isOneWay = isOneWaySwap(value);
  const swap = isOneWay ? getOneWaySwapValues(value, getMetadata) : undefined;
  const swapOutputAmount = getAmount.optional(swap?.output);
  const showOutput = !!swapOutputAmount && !isZero(swapOutputAmount);
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

    return parseSwapFees(claimFee, asset1, asset2, getMetadata);
  }, [getMetadata, value]);

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
            {!!fee && <ActionRow key='claim-fee' label='Swap Claim Fee' info={fee} />}
            {!!txId && (
              <ActionRow
                key='claim-tx'
                label='Swap Claim Transaction'
                info={shorten(txId, 8)}
                copyText={txId}
              />
            )}
            {unfilled && <ActionRow key='unfilled' label='Unfilled Amount' info={unfilled} />}
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
