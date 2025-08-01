import { useState, useEffect } from 'react';
import { Card } from '@penumbra-zone/ui/Card';
import { Text } from '@penumbra-zone/ui/Text';
import { Tabs } from '@penumbra-zone/ui/Tabs';
import { Density } from '@penumbra-zone/ui/Density';
import { useBackground } from '@/shared/contexts/background-context';
import { ShieldingInfoDialog } from './shielding-info-dialog';
import { SkipDepositTab } from '../skip-deposit/skip-deposit-form';
import { DepositForm } from '@/pages/shielding/ui/deposit/deposit-form';
import { WithdrawForm } from '@/pages/shielding/ui/withdraw/withdraw-form';
import { ShieldingTransactionCard } from './shielding-transaction-card';

// Tab configuration
const SHIELDING_TABS = [
  { value: 'skip-deposit', label: 'Skip Deposit', title: 'Shielding Assets' },
  { value: 'deposit', label: 'Deposit', title: 'Shielding Assets' },
  { value: 'withdraw', label: 'Withdraw', title: 'Unshielding Assets' },
];

type ShieldingTab = 'skip-deposit' | 'deposit' | 'deposit-dev' | 'withdraw';

export const Shielding = () => {
  const [activeTab, setActiveTab] = useState<ShieldingTab>('skip-deposit');
  const { setBackground } = useBackground();

  // Update background based on active tab
  useEffect(() => {
    if (activeTab === 'withdraw') {
      setBackground('unshield');
    } else {
      setBackground('shield');
    }

    // Cleanup on unmount
    return () => setBackground('default');
  }, [activeTab, setBackground]);

  // Get current tab title
  const currentTab = SHIELDING_TABS.find(tab => tab.value === activeTab);
  const title = currentTab?.title ?? 'Shielding';

  // Render tab content based on active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 'skip-deposit':
        return <SkipDepositTab />;
      case 'deposit':
        return <DepositForm />;
      case 'withdraw':
        return <WithdrawForm />;
      default:
        return <SkipDepositTab />;
    }
  };

  return (
    <div className='mx-auto w-full max-w-xl space-y-6'>
      <div className='flex flex-col items-center justify-between'>
        {/* Title  */}
        <div className='flex w-full items-center justify-between p-3'>
          <Text large color='text.primary'>
            {title}
          </Text>
          <ShieldingInfoDialog />
        </div>

        {/* Main Content Card */}
        <div className='w-full'>
          <Card>
            {/* Tab Navigation */}
            <Density sparse>
              <div className='border-b border-other-tonal-stroke'>
                <Tabs
                  value={activeTab}
                  onChange={value => setActiveTab(value as ShieldingTab)}
                  options={SHIELDING_TABS}
                  actionType='accent'
                />
              </div>
            </Density>
            <div
              className={`flex min-h-48 items-center justify-center ${
                activeTab !== 'skip-deposit' ? ' pt-2' : ''
              }`}
            >
              {/* Tab Content */}
              {renderTabContent()}
            </div>
          </Card>
        </div>
      </div>

      {/* Recent Activity Section */}
      <ShieldingTransactionCard />
    </div>
  );
};
