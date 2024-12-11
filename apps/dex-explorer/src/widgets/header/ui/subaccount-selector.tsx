import { Link2Off } from 'lucide-react';
import { observer } from 'mobx-react-lite';
import { DropdownMenu } from '@penumbra-zone/ui/DropdownMenu';
import { Button } from '@penumbra-zone/ui/Button';
import { Density } from '@penumbra-zone/ui/Density';
import { Text } from '@penumbra-zone/ui/Text';
import { AddressViewComponent } from '@penumbra-zone/ui/AddressView';
import { getAddressIndex } from '@penumbra-zone/getters/address-view';
import { connectionStore } from '@/shared/model/connection';
import { useSubaccounts } from '../api/subaccounts';
import SpinnerIcon from '@/shared/assets/spinner-icon.svg';

export const SubaccountSelector = observer(() => {
  const { data: subaccounts, isLoading } = useSubaccounts();
  const { subaccount, setSubaccount } = connectionStore;

  const value = subaccount.toString();
  const valueAddress = subaccounts?.find(
    account => getAddressIndex(account).account === subaccount,
  );

  return (
    <Density sparse>
      <DropdownMenu>
        <DropdownMenu.Trigger>
          <Button>
            {isLoading ? (
              <div className='min-w-[170px] flex justify-center'>
                <SpinnerIcon className='animate-spin' />
              </div>
            ) : (
              <AddressViewComponent copyable={false} addressView={valueAddress} />
            )}
          </Button>
        </DropdownMenu.Trigger>

        <DropdownMenu.Content>
          <div className='flex flex-col gap-2'>
            {subaccounts && (
              <DropdownMenu.RadioGroup value={value} onChange={setSubaccount}>
                <div className='flex flex-col gap-2'>
                  {subaccounts.map(account => {
                    const key = getAddressIndex(account).account.toString();
                    return (
                      <DropdownMenu.RadioItem key={key} value={key}>
                        <div className={value !== key ? '-ml-7' : ''}>
                          <AddressViewComponent
                            hideIcon={value === key}
                            copyable={false}
                            addressView={account}
                          />
                        </div>
                      </DropdownMenu.RadioItem>
                    );
                  })}
                </div>
              </DropdownMenu.RadioGroup>
            )}

            <DropdownMenu.Item
              actionType='destructive'
              icon={<Link2Off size={24} />}
              onSelect={() => void connectionStore.disconnect()}
            >
              <Text strong color='destructive.light'>
                Disconnect
              </Text>
            </DropdownMenu.Item>
          </div>
        </DropdownMenu.Content>
      </DropdownMenu>
    </Density>
  );
});
