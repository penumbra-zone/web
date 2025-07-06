import { useState, useEffect } from 'react';
import { Card } from '@penumbra-zone/ui/Card';
import { Text } from '@penumbra-zone/ui/Text';
import { Tabs } from '@penumbra-zone/ui/Tabs';
import { Density } from '@penumbra-zone/ui/Density';
import { useBackground } from '@/shared/contexts/background-context';
import { ShieldingInfoDialog } from './shielding-info-dialog';

// Tab types
type ShieldingTab = 'skip-deposit' | 'deposit' | 'withdraw';

// Tab configuration
const SHIELDING_TABS = [
  { label: 'Skip Deposit', value: 'skip-deposit' as const },
  { label: 'Deposit', value: 'deposit' as const },
  { label: 'Withdraw', value: 'withdraw' as const },
];

// Placeholder components for each tab
const SkipDepositTab = () => (
  <div className='flex h-96 items-center justify-center'>
    <Text color='text.secondary'>
      {/* TODO: Implement Skip Deposit functionality */}
      Skip Deposit tab content will be implemented here
    </Text>
  </div>
);

const DepositTab = () => (
  <div className='flex h-96 items-center justify-center'>
    <Text color='text.secondary'>
      {/* TODO: Implement Deposit functionality */}
      Deposit tab content will be implemented here
    </Text>
  </div>
);

const WithdrawTab = () => (
  <div className='flex h-96 items-center justify-center'>
    <Text color='text.secondary'>
      {/* TODO: Implement Withdraw functionality */}
      Withdraw tab content will be implemented here
    </Text>
  </div>
);

// Recent Activity Component
const RecentShieldingActivity = () => (
  <div className='space-y-4'>

    <Card title='Your Recent Shielding Activity'>
      <div className='flex h-32 items-center justify-center'>
        <Text color='text.secondary'>
          {/* TODO: Implement activity list with real data */}
          Recent shielding activity will be displayed here
        </Text>
      </div>
    </Card>
  </div>
);

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
  }, [activeTab, setBackground]);

  // Reset background when component unmounts
  useEffect(() => {
    return () => {
      setBackground('default');
    };
  }, [setBackground]);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'skip-deposit':
        return <SkipDepositTab />;
      case 'deposit':
        return <DepositTab />;
      case 'withdraw':
        return <WithdrawTab />;
      default:
        return <SkipDepositTab />;
    }
  };

  return (
    <>
        <div className='flex w-full flex-col mx-auto max-w-[560px] space-y-8'>
          {/* Main Container */}
          <Card
            title={activeTab === 'withdraw' ? 'Unshielding Assets' : 'Shielding Assets'}
            endContent={<ShieldingInfoDialog />}
          >
            {/* Tabs */}
            <Density sparse>
              <div className='border-b-2 border-other-tonal-stroke '>
                <Tabs
                  value={activeTab}
                  onChange={value => setActiveTab(value as ShieldingTab)}
                  options={SHIELDING_TABS}
                  actionType='accent'
                />
              </div>
            </Density>

            {/* Tab Content */}
            <div className='px-6 pb-6'>{renderTabContent()}</div>
          </Card>

          {/* Recent Activity Section */}
          <RecentShieldingActivity />
        </div>
    </>
  );
};
