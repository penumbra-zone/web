import { AssetListItem } from './AssetListItem';
import { AccountMock } from './mock';
import { AddressViewComponent } from '@penumbra-zone/ui';
import { AddressView } from '@penumbra-zone/protobuf/penumbra/core/keys/v1/keys_pb';

export interface AccountSectionProps {
  /**
   * Account with its assets to display
   */
  account: Omit<AccountMock, 'addressView'> & { addressView?: AddressView };
}

/**
 * AccountSection component renders an account header with its assets list
 */
export const AccountSection = ({ account }: AccountSectionProps) => {
  return (
    <div className='mb-4 flex flex-col overflow-hidden'>
      <div className='p-3'>
        <AddressViewComponent addressView={account.addressView} />
      </div>
      <div className='flex flex-col gap-1'>
        {account.assets.map(asset => (
          <AssetListItem key={asset.id} asset={asset} />
        ))}
      </div>
    </div>
  );
};
