import { getAddress as getAddressFromNoteView } from '@penumbra-zone/getters/note-view';
import { ValueView } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { SwapView as DexSwapView } from '@penumbra-zone/protobuf/penumbra/core/component/dex/v1/dex_pb';
import {
  SpendView,
  OutputView,
} from '@penumbra-zone/protobuf/penumbra/core/component/shielded_pool/v1/shielded_pool_pb';
import {
  Address,
  AddressView as GrpcAddressView,
  AddressView_Opaque,
} from '@penumbra-zone/protobuf/penumbra/core/keys/v1/keys_pb';
import { ActionView as CoreActionView } from '@penumbra-zone/protobuf/penumbra/core/transaction/v1/transaction_pb';
import { AddressViewComponent } from '@penumbra-zone/ui/AddressView';
import { SectionComponentProps } from '@penumbra-zone/ui/TransactionView';
import { ValueViewComponent } from '@penumbra-zone/ui/ValueView';

import { SwapViewComponent } from './actions/SwapViewComponent';

// Helper to create an AddressView from an Address for display
const makeDisplayableAddressView = (address?: Address): GrpcAddressView | undefined => {
  if (!address) {
    return undefined;
  }
  return new GrpcAddressView({
    addressView: {
      case: 'opaque',
      value: new AddressView_Opaque({ address }),
    },
  });
};

// Helper to find matching AddressView
const findMatchingAddressView = (
  transactionAddress: GrpcAddressView,
  walletAddresses: GrpcAddressView[],
): GrpcAddressView | undefined => {
  if (!walletAddresses.length || !transactionAddress.addressView.value?.address?.inner) {
    return undefined;
  }
  const txAddrInner = transactionAddress.addressView.value.address.inner;
  for (const walletAddr of walletAddresses) {
    if (!walletAddr.addressView.value?.address?.inner) {
      continue;
    }
    const walletInner = walletAddr.addressView.value.address.inner;
    if (
      walletInner.length === txAddrInner.length &&
      walletInner.every((byte, i) => byte === txAddrInner[i])
    ) {
      return walletAddr;
    }
  }
  return undefined;
};

interface ActionDisplayProps
  extends Omit<SectionComponentProps, 'fullTxInfo' | 'transactionToDisplay'> {
  actionView: CoreActionView;
}

const ActionDisplay: React.FC<ActionDisplayProps> = ({
  actionView,
  getTxMetadata,
  walletAddressViews = [],
}) => {
  const currentActionInternal = actionView.actionView;
  const currentActionCase = currentActionInternal.case;
  const currentActionValue = currentActionInternal.value;

  const renderAddress = (addressToRender?: Address) => {
    if (!addressToRender) {
      return null;
    }
    const displayAddressView = makeDisplayableAddressView(addressToRender);
    if (!displayAddressView) {
      return null;
    }
    const matchedAddress =
      findMatchingAddressView(displayAddressView, walletAddressViews) ?? displayAddressView;
    return <AddressViewComponent addressView={matchedAddress} hideIcon />;
  };

  const renderValue = (value?: ValueView) => {
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

  switch (currentActionCase) {
    case 'spend': {
      const spendView = currentActionValue as SpendView;
      if (spendView.spendView.case === 'visible') {
        const note = spendView.spendView.value.note;
        const addressViewFromNote = note ? getAddressFromNoteView(note) : undefined;
        const actualAddress =
          addressViewFromNote && addressViewFromNote.addressView.case === 'decoded'
            ? addressViewFromNote.addressView.value.address
            : undefined;
        return (
          <div className='flex items-center justify-between border-b border-charcoal-secondary py-1 text-sm last:border-b-0'>
            <span className='text-light-brown'>Spend</span>
            <div className='flex items-center gap-2'>
              {renderValue(note?.value)}
              {actualAddress && <span className='text-muted-foreground'>from</span>}
              {renderAddress(actualAddress)}
            </div>
          </div>
        );
      } else {
        return (
          <div className='flex items-center justify-between border-b border-charcoal-secondary py-1 text-sm last:border-b-0'>
            <span className='text-light-brown'>Spend</span>
            <span className='text-xs text-muted-foreground'>(Opaque)</span>
          </div>
        );
      }
    }
    case 'output': {
      const outputView = currentActionValue as OutputView;
      if (outputView.outputView.case === 'visible') {
        const note = outputView.outputView.value.note;
        const addressViewFromNote = note ? getAddressFromNoteView(note) : undefined;
        const actualAddress =
          addressViewFromNote && addressViewFromNote.addressView.case === 'decoded'
            ? addressViewFromNote.addressView.value.address
            : undefined;
        return (
          <div className='flex items-center justify-between border-b border-charcoal-secondary py-1 text-sm last:border-b-0'>
            <span className='text-light-brown'>Output</span>
            <div className='flex items-center gap-2'>
              {renderValue(note?.value)}
              {actualAddress && <span className='text-muted-foreground'>to</span>}
              {renderAddress(actualAddress)}
            </div>
          </div>
        );
      } else {
        return (
          <div className='flex items-center justify-between border-b border-charcoal-secondary py-1 text-sm last:border-b-0'>
            <span className='text-light-brown'>Output</span>
            <span className='text-xs text-muted-foreground'>(Opaque)</span>
          </div>
        );
      }
    }
    case 'swap': {
      const swapView = currentActionValue as DexSwapView;
      return (
        <SwapViewComponent
          swapView={swapView}
          getTxMetadata={getTxMetadata}
          walletAddressViews={walletAddressViews}
        />
      );
    }
    default: {
      const caseDisplay = typeof currentActionCase === 'string' ? currentActionCase : 'unknown';
      return (
        <div className='py-1 text-xs text-muted-foreground'>
          Action type: {caseDisplay} (Display not yet implemented)
        </div>
      );
    }
  }
};

export const TransactionActions: React.FC<SectionComponentProps> = ({
  transactionToDisplay,
  getTxMetadata,
  walletAddressViews = [],
}) => {
  const actions = transactionToDisplay?.bodyView?.actionViews;

  if (!actions || actions.length === 0) {
    return (
      <div className='py-1 text-sm italic text-muted-foreground'>
        No actions in this transaction.
      </div>
    );
  }

  return (
    <div className='flex flex-col gap-0'>
      {actions.map((action, index) => {
        return (
          <ActionDisplay
            key={index}
            actionView={action}
            getTxMetadata={getTxMetadata}
            walletAddressViews={walletAddressViews}
          />
        );
      })}
    </div>
  );
};

export const TransactionActionItem: React.FC<{ action: unknown }> = ({ action: _action }) => (
  <div className='text-xs'>Action item (details coming soon)</div>
);
