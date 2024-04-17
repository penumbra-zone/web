import { Address } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1/keys_pb';
import { AccountSwitcher } from '@penumbra-zone/ui/components/ui/account-switcher';
import { AddressComponent } from '@penumbra-zone/ui/components/ui/address-component';
import { Button } from '@penumbra-zone/ui/components/ui/button';
import { useStore } from '../../state';
import { ibcInSelector } from '../../state/ibc-in';

export const IbcInForm = () => {
  const { account, address, setAccount } = useStore(ibcInSelector);

  return (
    <div className='flex flex-col gap-4'>
      <h1 className='font-headline text-xl'>Enter Penumbra</h1>
      <div className='pb-3 md:pb-5'>
        <AccountSwitcher account={account} onChange={acct => void setAccount(acct)} />
        <AddressComponent address={new Address(address)} ephemeral={true} />
      </div>
      {/* 
        https://github.com/cosmology-tech/create-cosmos-app/blob/main/examples/asset-list/components/wallet/Wallet.tsx 
        https://github.com/cosmology-tech/interchain-ui/blob/main/src/ui/asset-withdraw-tokens/asset-withdraw-tokens.lite.tsx
      */}
      <Button className='p-4' onClick={() => void 0}>
        Shield
      </Button>
    </div>
  );
};
