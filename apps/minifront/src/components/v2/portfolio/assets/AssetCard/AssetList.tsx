import { AccountSection } from './AccountSection';
import { AccountMock } from './mock';

export interface AssetListProps {
  /**
   * Accounts with their assets to display
   */
  accounts: AccountMock[];
}

/**
 * AssetList component renders a list of accounts with their assets
 */
export const AssetList = ({ accounts }: AssetListProps) => {
  return (
    <div className="flex flex-col gap-3">
      {accounts.map(account => (
        <AccountSection key={account.id} account={account} />
      ))}
    </div>
  );
}; 