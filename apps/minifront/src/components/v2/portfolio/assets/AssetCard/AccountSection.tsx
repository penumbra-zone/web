import { AssetListItem } from './AssetListItem';
import { AccountMock } from './mock';
import { AddressViewComponent } from '@penumbra-zone/ui';

export interface AccountSectionProps {
  /**
   * Account with its assets to display
   */
  account: AccountMock;
}

/**
 * AccountSection component renders an account header with its assets list
 */
export const AccountSection = ({ account }: AccountSectionProps) => {
  return (
    <div className="flex flex-col overflow-hidden mb-4">
      <div className="p-3">
        <AddressViewComponent addressView={account.addressView}/>
      </div>
      <div className="flex flex-col gap-1">
        {account.assets.map(asset => (
          <AssetListItem key={asset.id} asset={asset} />
        ))}
      </div>
    </div>
  );
}; 