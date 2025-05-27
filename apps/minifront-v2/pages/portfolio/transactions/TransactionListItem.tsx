import React from 'react';
import { FileSearch } from 'lucide-react';

import { AssetId, Denom, Metadata } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { AddressView } from '@penumbra-zone/protobuf/penumbra/core/keys/v1/keys_pb';
import { TransactionInfo as GrpcTransactionInfo } from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';
import { Button } from '@penumbra-zone/ui/Button';
import { TransactionSummary as UiTransactionSummary } from '@penumbra-zone/ui/TransactionSummary';

export interface TransactionListItemProps {
  info: GrpcTransactionInfo;
  getTxMetadata: (assetIdOrDenom: AssetId | Denom | string | undefined) => Metadata | undefined;
  walletAddressViews: AddressView[];
  onClick: () => void; // Keep this for the overall item click
}

export const TransactionListItem: React.FC<TransactionListItemProps> = ({
  info,
  getTxMetadata,
  walletAddressViews,
  onClick,
}) => {
  // For now, the main div click is handled by the passed `onClick` prop.
  // The internal button can also trigger the same main onClick or navigate directly.

  const handleDetailButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent the main div's onClick from firing if it's different
    onClick(); // Trigger the navigation passed from TransactionCard
  };

  return (
    <div
      className='group relative cursor-pointer overflow-hidden rounded-lg shadow-sm hover:bg-actionHoverOverlay'
      onClick={onClick} // Main click area navigates
      tabIndex={0}
      role='button'
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          onClick();
        }
      }}
    >
      <UiTransactionSummary
        info={info}
        getMetadata={getTxMetadata}
        walletAddressViews={walletAddressViews}
        truncate={true}
      />
      <div className='absolute right-2 top-1/2 -translate-y-1/2 opacity-0 transition-opacity duration-300 ease-in-out group-hover:opacity-100'>
        <Button
          iconOnly
          icon={FileSearch}
          density='compact'
          actionType='accent'
          onClick={handleDetailButtonClick} // This button also triggers the main navigation
          aria-label='View Details'
        >
          View Details
        </Button>
      </div>
    </div>
  );
};
