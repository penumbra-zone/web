import { AddressIcon } from './address-icon';
import { InfoIcon } from 'lucide-react';
import { CopyToClipboardIconButton } from './copy-to-clipboard-icon-button';
import { IncognitoIcon } from './icons/incognito';
import { Switch } from './switch';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './tooltip';
import { useEffect, useState } from 'react';
import { AddressComponent } from './address-component';
import { Address } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1/keys_pb';
import { AccountSwitcher } from './account-switcher';
import { bech32mAddress } from '@penumbra-zone/bech32m/penumbra';

interface SelectAccountProps {
  getAddrByIndex: (index: number, ephemeral: boolean) => Promise<Address> | Address;
}

/**
 * Renders an account address, along with a switcher to choose a different
 * account index. Also allows the user to view a one-time IBC deposit address.
 */
export const SelectAccount = ({ getAddrByIndex }: SelectAccountProps) => {
  const [index, setIndex] = useState<number>(0);
  const [ephemeral, setEphemeral] = useState<boolean>(false);
  const [address, setAddress] = useState<Address>();

  useEffect(() => {
    void (async () => {
      const address = await getAddrByIndex(index, ephemeral);
      setAddress(address);
    })();
    // getAddrByIndex updates the address every block
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, ephemeral]);

  return (
    <>
      {!address ? (
        <></>
      ) : (
        <div className='flex w-full flex-col'>
          <AccountSwitcher account={index} onChange={setIndex} />

          <div className='mt-4 flex items-center justify-between gap-1 break-all rounded-lg border bg-background px-3 py-4'>
            <div className='flex items-center gap-[6px] overflow-hidden'>
              <div className='shrink-0'>
                <AddressIcon address={address} size={24} />
              </div>

              <p className='truncate text-sm'>
                <AddressComponent address={address} ephemeral={ephemeral} />
              </p>
            </div>
            <CopyToClipboardIconButton text={bech32mAddress(address)} />
          </div>
          <div className='mt-2 flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <IncognitoIcon fill='#BDB8B8' />
              <p className='mt-1 font-bold'>IBC Deposit Address</p>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <InfoIcon className='size-4 cursor-pointer text-muted-foreground hover:text-[#8D5728]' />
                  </TooltipTrigger>
                  <TooltipContent className='w-[250px]'>
                    <p>
                      IBC transfers into Penumbra post the destination address in public on the
                      source chain. Use this randomized IBC deposit address to preserve privacy when
                      transferring funds into Penumbra.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Switch
              id='address-mode'
              checked={ephemeral}
              onCheckedChange={checked => setEphemeral(checked)}
            />
          </div>
        </div>
      )}
    </>
  );
};
