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
  if (!accounts || accounts.length === 0) {
    return (
      <div className='flex min-h-[120px] flex-col items-center justify-center p-6 text-center text-muted-foreground'>
        <p className='text-sm'>You have no assets yet.</p>
        <p className='text-xs mt-1'>
          Deposit or receive any assets first to your wallet. They will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className='flex flex-col gap-3'>
      {accounts.map(account => (
        <AccountSection key={account.id} account={account} />
      ))}
    </div>
  );
};
