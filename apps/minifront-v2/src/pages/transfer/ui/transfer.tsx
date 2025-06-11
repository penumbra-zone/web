import React from 'react';
import { observer } from 'mobx-react-lite';
import { useTransferStore } from '@/shared/stores/store-context';
import { Tabs } from '@penumbra-zone/ui/Tabs';
import { SendForm } from './send-form';
import { ReceiveForm } from './receive-form';
import { Card } from '@penumbra-zone/ui/Card';

export const Transfer = observer((): React.ReactNode => {
  const transferStore = useTransferStore();

  return (
    <div className='flex flex-col items-center justify-start min-h-[calc(100vh-8rem)] px-4'>
      <div className='w-full max-w-[560px]'>
        <Card.Stack>
          <Card
            title={
              <div className='flex items-center gap-2'>
                <span>Transfer Assets</span>
              </div>
            }
          >
            <div className='flex flex-col gap-0'>
              <Tabs
                value={transferStore.activeTab}
                onChange={value => transferStore.setActiveTab(value as 'send' | 'receive')}
                options={[
                  { value: 'send', label: 'Send' },
                  { value: 'receive', label: 'Receive' },
                ]}
                actionType='accent'
              />
              <div className='border-b border-1 border-other-tonalStroke'></div>

              <div className='mt-4'>
                {transferStore.activeTab === 'send' ? <SendForm /> : <ReceiveForm />}
              </div>
            </div>
          </Card>
        </Card.Stack>
      </div>
    </div>
  );
});
