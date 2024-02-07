import { AddressIcon } from './address-icon';
import { ArrowLeftIcon, ArrowRightIcon, InfoIcon } from 'lucide-react';
import { cn } from '../../lib/utils';
import { CopyToClipboardIconButton } from './copy-to-clipboard-icon-button';
import { Button } from './button';
import { IncognitoIcon } from './icons/incognito';
import { Input } from './input';
import { Switch } from './switch';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './tooltip';
import { useEffect, useState } from 'react';
import { AddressComponent } from './address-component';
import { Address } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1/keys_pb';
import { bech32Address } from '@penumbra-zone/types';

interface SelectAccountProps {
  getAddrByIndex: (index: number, ephemeral: boolean) => Promise<Address> | Address;
}

const MAX_INDEX = 2 ** 32;

export const SelectAccount = ({ getAddrByIndex }: SelectAccountProps) => {
  const [index, setIndex] = useState<number>(0);
  const [ephemeral, setEphemeral] = useState<boolean>(false);

  const [width, setWidth] = useState(index.toString().length);
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
          <div className='flex items-center justify-between'>
            <Button
              variant='ghost'
              className={cn('hover:bg-inherit', index === 0 && 'cursor-default')}
            >
              {index !== 0 ? (
                <ArrowLeftIcon
                  onClick={() => {
                    if (index > 0) {
                      setIndex(state => state - 1);
                      setWidth(Number(String(index - 1).length));
                    }
                  }}
                  className='size-6 hover:cursor-pointer'
                />
              ) : (
                <span className='size-6' />
              )}
            </Button>
            <div className='select-none text-center font-headline text-xl font-semibold leading-[30px]'>
              <div className='flex flex-row flex-wrap items-end gap-[6px]'>
                <span>Account</span>
                <div className='flex items-end gap-0'>
                  <p>#</p>
                  <div className='relative w-min min-w-[24px]'>
                    <Input
                      variant='transparent'
                      type='number'
                      className='mb-[3px] h-6 py-[2px] font-headline text-xl font-semibold leading-[30px]'
                      onChange={e => {
                        const value = Number(e.target.value);
                        const valueLength = e.target.value.replace(/^0+/, '').length;

                        if (value > MAX_INDEX || valueLength > MAX_INDEX.toString().length) return;
                        setWidth(valueLength ? valueLength : 1);
                        setIndex(value);
                      }}
                      style={{ width: width + 'ch' }}
                      value={index ? index.toString().replace(/^0+/, '') : '0'}
                    />
                  </div>
                </div>
              </div>
            </div>
            <Button
              variant='ghost'
              className={cn('hover:bg-inherit', index === MAX_INDEX && 'cursor-default')}
            >
              {index < MAX_INDEX ? (
                <ArrowRightIcon
                  onClick={() => {
                    setIndex(state => state + 1);
                    setWidth(Number(String(index + 1).length));
                  }}
                  className='size-6 hover:cursor-pointer'
                />
              ) : (
                <span className='size-6' />
              )}
            </Button>
          </div>
          <div className='mt-4 flex items-center justify-between gap-1 break-all rounded-lg border bg-background px-3 py-4'>
            <div className='flex items-center gap-[6px]'>
              <AddressIcon address={address} size={24} />

              <p className='text-sm'>
                <AddressComponent address={address} ephemeral={ephemeral} />
              </p>
            </div>
            <CopyToClipboardIconButton text={bech32Address(address)} />
          </div>
          <div className='mt-2 flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <IncognitoIcon fill='#BDB8B8' />
              <p className='mt-1 font-bold'>IBC Deposit Address</p>
              {ephemeral && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <InfoIcon className='size-4 cursor-pointer text-muted-foreground hover:text-[#8D5728]' />
                    </TooltipTrigger>
                    <TooltipContent className='w-[250px]'>
                      <p>
                        IBC transfers into Penumbra post the destination address in public on the
                        source chain. Use this randomized IBC deposit address to preserve privacy
                        when transferring funds into Penumbra.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
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
