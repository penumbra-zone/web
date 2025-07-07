import { useState, useEffect } from 'react';
import { Card } from '@penumbra-zone/ui/Card';
import { Text } from '@penumbra-zone/ui/Text';
import { Tabs } from '@penumbra-zone/ui/Tabs';
import { Density } from '@penumbra-zone/ui/Density';
import { useBackground } from '@/shared/contexts/background-context';
import { ShieldingInfoDialog } from './shielding-info-dialog';
import { SkipDepositTab } from './skip-deposit-tab';

// Tab configuration
const SHIELDING_TABS = [
  { value: 'skip-deposit', label: 'Skip Deposit', title: 'Shielding Assets' },
  { value: 'deposit', label: 'Deposit', title: 'Shielding Assets' },
  { value: 'withdraw', label: 'Withdraw', title: 'Unshielding Assets' },
];

type ShieldingTab = 'skip-deposit' | 'deposit' | 'withdraw';

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
        return (
          <div className='p-6'>
            <div className='flex h-96 items-center justify-center'>
              <Text color='text.secondary'>
                {/* TODO: Implement Deposit functionality */}
                Deposit tab content will be implemented here
              </Text>
            </div>
          </div>
        );
      case 'withdraw':
        return (
          <div className='p-6'>
            <div className='flex h-96 items-center justify-center'>
              <Text color='text.secondary'>
                {/* TODO: Implement Withdraw functionality */}
                Withdraw tab content will be implemented here
              </Text>
            </div>
          </div>
        );
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
            <div className='flex min-h-48 items-center justify-center'>
              {/* Tab Content */}
              {renderTabContent()}
            </div>
          </Card>
        </div>
      </div>

      {/* Recent Activity Section */}
      <Card title='Your Recent Shielding Activity'>
        <div className='flex min-h-32 items-center justify-center'>
          <Text color='text.secondary'>
            {/* TODO: Implement recent activity list */}
            Recent activity will be displayed here
          </Text>
        </div>
      </Card>
    </div>
  );
};
