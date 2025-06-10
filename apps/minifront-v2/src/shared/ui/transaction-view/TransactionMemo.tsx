import React from 'react';
import { TransactionInfo as GrpcTransactionInfo } from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';
import { Address, AddressView } from '@penumbra-zone/protobuf/penumbra/core/keys/v1/keys_pb';
import { AddressViewComponent } from '@penumbra-zone/ui/AddressView';
import { DetailRow } from './DetailRow';
import { SectionComponentProps } from './TransactionView';
import { Text } from '@penumbra-zone/ui/Text';
import { Density } from '@penumbra-zone/ui/Density';
import { IncognitoIcon } from '@/shared/components/icons';

const findMatchingAddressView = (
  transactionAddressView: AddressView,
  walletAddressViews: AddressView[],
): AddressView | undefined => {
  if (!walletAddressViews.length || !transactionAddressView.addressView.value?.address?.inner) {
    return undefined;
  }

  const txAddrInner = transactionAddressView.addressView.value.address.inner;

  for (const walletAddr of walletAddressViews) {
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

export interface TransactionMemoProps {
  txInfo: GrpcTransactionInfo;
  walletAddressViews?: AddressView[];
}

export const TransactionMemo: React.FC<SectionComponentProps> = ({
  transactionToDisplay,
  walletAddressViews = [],
}) => {
  const memoViewData = transactionToDisplay?.bodyView?.memoView?.memoView;
  let finalReturnAddressViewToDisplay: AddressView | undefined;
  let memoText: string | undefined;
  let isUsersReturnAddress = false;

  if (memoViewData?.case === 'visible') {
    memoText = memoViewData.value.plaintext?.text;
    const returnAddressViewFromMemo: AddressView | undefined =
      memoViewData.value.plaintext?.returnAddress;

    if (returnAddressViewFromMemo?.addressView.value?.address) {
      const innerAddress: Address = returnAddressViewFromMemo.addressView.value.address;

      if (innerAddress.inner.length === 80) {
        const matchingWalletAddress = findMatchingAddressView(
          returnAddressViewFromMemo,
          walletAddressViews,
        );
        if (matchingWalletAddress) {
          finalReturnAddressViewToDisplay = matchingWalletAddress;
          isUsersReturnAddress = true;
        } else {
          finalReturnAddressViewToDisplay = returnAddressViewFromMemo;
          isUsersReturnAddress = false;
        }
      } else {
        console.warn(
          `Memo return AddressView contains an invalid Address. Inner length: ${innerAddress.inner.length}`,
          returnAddressViewFromMemo,
        );
      }
    } else if (returnAddressViewFromMemo) {
      console.warn(
        'Memo return AddressView is present but structure is incomplete:',
        returnAddressViewFromMemo,
      );
    }
  } else if (memoViewData?.case === 'opaque') {
    // For opaque memo, display like an action with just icon and "Memo" text
    return (
      <div className='flex w-full items-center justify-between gap-1 rounded-sm'>
        <i className='block text-neutral-light'>
          <IncognitoIcon />
        </i>
        <div className='flex grow items-center truncate'>
          <Text variant='smallTechnical' color='text.secondary' truncate>
            Memo
          </Text>
        </div>
      </div>
    );
  }

  const addressViewForDisplay = finalReturnAddressViewToDisplay;

  if (!addressViewForDisplay && !memoText) {
    return (
      <Text variant='smallTechnical' color='text.secondary' truncate>
        No memo or return address for this transaction.
      </Text>
    );
  }

  return (
    <div className='flex flex-col'>
      {addressViewForDisplay && (
        <DetailRow
          label='Return Address'
          value={
            <Density slim>
              <AddressViewComponent
                addressView={addressViewForDisplay}
                truncate={true}
                external={false}
                copyable={isUsersReturnAddress}
              />
            </Density>
          }
        />
      )}
      {memoText && <DetailRow label='Memo' value={memoText} truncateValue={false} />}
    </div>
  );
};
