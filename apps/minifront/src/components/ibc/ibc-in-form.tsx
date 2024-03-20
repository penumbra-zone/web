import { Button } from '@penumbra-zone/ui/components/ui/button';
import { AccountSwitcher } from '@penumbra-zone/ui/components/ui/account-switcher';
import { AddressComponent } from '@penumbra-zone/ui/components/ui/address-component';
import { Address } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1/keys_pb';

//import { cosmos } from 'juno-network';
//import { AssetWithdrawTokens } from '@interchain-ui/react';
import { useStore } from '../../state';
import { ibcInSelector } from '../../state/ibc-in';

export const IbcInForm = () => {
  const { account, address, setAccount } = useStore(ibcInSelector);
  return (
    <div className='flex flex-col gap-4'>
      <h1 className='font-headline text-xl'>Enter Penumbra</h1>
      {/*
      <AssetWithdrawTokens
        fromSymbol='ATOM'
        fromName='Cosmos Hub'
        fromAddress='cosmos1lqsq8hx42l7dzwd7nu8hx42lpkl9zev48trj5k'
        fromImgSrc='https://raw.githubusercontent.com/cosmos/chain-registry/master/cosmoshub/images/atom.png'
        toName='Osmosis'
        toAddress='osmo1lqsq8hx42l7dzwd7nu8hx42lpkl9zev48trj5k'
        toImgSrc='https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/osmo.svg'
        available={25.89}
        amount=''
        priceDisplayAmount={0.5}
        timeEstimateLabel='20 seconds'
        onChange={value => {
          console.log('onChange', value);
        }}
        onTransfer={() => {
          console.log('onTransfer');
        }}
        onCancel={() => {
          console.log('onCancel');
        }}
        onAddressChange={(value: string) => {
          console.log('onAddressChange', value);
        }}
        onAddressConfirm={() => {
          console.log('onAddressConfirm');
        }}
      />
      */}
      <div className='pb-3 md:pb-5'>
        <AccountSwitcher account={account} onChange={acct => void setAccount(acct)} />
        <AddressComponent address={new Address(address)} ephemeral={true} />
      </div>
      <Button className='p-4' onClick={() => void 0}>
        Occlude
      </Button>
    </div>
  );
};
