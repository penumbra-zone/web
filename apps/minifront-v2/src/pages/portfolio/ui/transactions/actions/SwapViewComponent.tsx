import React from 'react';

import {
  Metadata,
  AssetId,
  Denom,
  ValueView as GrpcValueView,
} from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { SwapView } from '@penumbra-zone/protobuf/penumbra/core/component/dex/v1/dex_pb';
import { AddressView } from '@penumbra-zone/protobuf/penumbra/core/keys/v1/keys_pb';
import { ValueViewComponent } from '@penumbra-zone/ui/ValueView';
// import { AddressViewComponent } from '@penumbra-zone/ui/AddressView'; // Not used yet

export interface SwapViewComponentProps {
  swapView?: SwapView;
  getTxMetadata: (assetId: AssetId | Denom | undefined) => Metadata | undefined;
  walletAddressViews: AddressView[]; // For rendering address if it becomes relevant for swaps
}

export const SwapViewComponent: React.FC<SwapViewComponentProps> = ({
  swapView,
  getTxMetadata /* , walletAddressViews */,
}) => {
  if (!swapView?.swapView) {
    return <div className='text-muted-foreground text-xs'>Swap data unavailable.</div>;
  }

  const swapViewData = swapView.swapView; // This is the oneof field

  if (swapViewData.case === 'visible') {
    const visibleSwap = swapViewData.value; // Explicit cast for clarity

    const renderValue = (value?: GrpcValueView) => {
      if (!value) {
        return null;
      }
      return (
        <ValueViewComponent
          valueView={value}
          showIcon={false}
          showValue
          showSymbol
          density='compact'
        />
      );
    };

    let valueIn: GrpcValueView | undefined;
    const plainText = visibleSwap.swapPlaintext;
    const asset1 = plainText?.tradingPair?.asset1;
    const asset2 = plainText?.tradingPair?.asset2;

    // Determine input value: check delta1I then delta2I
    if (plainText?.delta1I && (plainText.delta1I.lo || plainText.delta1I.hi) && asset1) {
      const metadata = getTxMetadata(asset1);
      valueIn = new GrpcValueView({
        valueView: { case: 'knownAssetId', value: { amount: plainText.delta1I, metadata } },
      });
    } else if (plainText?.delta2I && (plainText.delta2I.lo || plainText.delta2I.hi) && asset2) {
      const metadata = getTxMetadata(asset2);
      valueIn = new GrpcValueView({
        valueView: { case: 'knownAssetId', value: { amount: plainText.delta2I, metadata } },
      });
    }

    // Determine output value: check output1 then output2 from SwapView_Visible
    // These are NoteView, so we access .value which is a ValueView (GrpcValueView)
    let valueOut: GrpcValueView | undefined;
    if (visibleSwap.output1?.value) {
      valueOut = visibleSwap.output1.value;
    } else if (visibleSwap.output2?.value) {
      valueOut = visibleSwap.output2.value;
    }
    // TODO: This logic for valueOut might be too simple if both output1 and output2 can be present or if they represent different things.
    // For now, it assumes one of them is the primary output of the swap.

    return (
      <div className='border-charcoal-secondary flex items-center justify-between border-b py-1 text-sm last:border-b-0'>
        <span className='text-light-brown'>Swap</span>
        <div className='flex items-center gap-2'>
          {renderValue(valueIn)}
          {valueIn && valueOut && <span className='text-muted-foreground'>for</span>}
          {renderValue(valueOut)}
        </div>
        {/* TODO: Add trading_fee (from visibleSwap.swapPlaintext.claimFee). Need to create a ValueView for it. */}
      </div>
    );
  } else if (swapViewData.case === 'opaque') {
    // const opaqueSwap = swapViewData.value; // Type SwapView_Opaque
    return (
      <div className='border-charcoal-secondary flex items-center justify-between border-b py-1 text-sm last:border-b-0'>
        <span className='text-light-brown'>Swap</span>
        <span className='text-muted-foreground text-xs'>(Opaque)</span>
      </div>
    );
  }

  return (
    <div className='text-muted-foreground text-xs'>Unknown swap view type: {swapViewData.case}</div>
  );
};
