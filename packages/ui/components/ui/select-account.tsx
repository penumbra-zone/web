import { Account } from '@penumbra-zone/types';
import { ArrowLeftIcon, ArrowRightIcon, CopyIcon, InfoIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { cn } from '../../lib/utils';
import { Button } from './button';
import { CopyToClipboard } from './copy-to-clipboard';
import { IncognitoIcon } from './icons/incognito';
import { IdenticonGradient } from './identicon/identicon-gradient';
import { Input } from './input';
import { Switch } from './switch';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './tooltip';

interface SelectAccountProps {
  getAccount: (index: number, ephemeral: boolean) => Promise<Account> | Account | undefined;
}
const MAX_INDEX = 2 ** 32;

export const SelectAccount = ({ getAccount }: SelectAccountProps) => {
  const [index, setIndex] = useState<number>(0);
  const [ephemeral, setEphemeral] = useState<boolean>(false);

  const [width, setWidth] = useState(index.toString().length);
  const [account, setAccount] = useState<Account | undefined>();

  useEffect(() => {
    void (async () => {
      const account = await getAccount(index, ephemeral);
      setAccount(account);
    })();
    // getAccount updates the address every block
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, ephemeral]);

  return (
    <>
      {!account ? (
        <></>
      ) : (
        <div className='flex w-full flex-col'>
          <div className='flex items-center justify-between'>
            <Button
              variant='ghost'
              className={cn('hover:bg-inherit', account.index === 0 && 'cursor-default')}
            >
              {account.index !== 0 ? (
                <ArrowLeftIcon
                  onClick={() => {
                    if (index > 0) {
                      setIndex(state => state - 1);
                      setWidth(Number(String(account.index - 1).length));
                    }
                  }}
                  className='h-6 w-6 hover:cursor-pointer'
                />
              ) : (
                <span className='h-6 w-6' />
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
                      value={account.index ? account.index.toString().replace(/^0+/, '') : '0'}
                    />
                  </div>
                </div>
              </div>
            </div>
            <Button
              variant='ghost'
              className={cn('hover:bg-inherit', account.index === MAX_INDEX && 'cursor-default')}
            >
              {account.index < MAX_INDEX ? (
                <ArrowRightIcon
                  onClick={() => {
                    setIndex(state => state + 1);
                    setWidth(Number(String(account.index + 1).length));
                  }}
                  className='h-6 w-6 hover:cursor-pointer'
                />
              ) : (
                <span className='h-6 w-6' />
              )}
            </Button>
          </div>
          <div className='mt-4 flex items-center justify-between gap-1 break-all rounded-lg border bg-background px-3 py-4'>
            <div className='flex items-center gap-[6px]'>
              <IdenticonGradient name={account.address} className='h-6 w-6 rounded-full' />
              <p
                className={cn(
                  'select-none text-center font-mono text-[12px] leading-[18px] text-muted-foreground',
                  ephemeral && 'text-[#8D5728]',
                )}
              >
                {account.preview}
              </p>
            </div>
            <CopyToClipboard
              text={account.address}
              label={
                <div>
                  <CopyIcon className='h-4 w-4 text-muted-foreground hover:opacity-50' />
                </div>
              }
              className='w-4'
            />
          </div>
          <div className='mt-2 flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <IncognitoIcon fill='#BDB8B8' />
              <p className='mt-1 font-bold'>Use ephemeral address</p>
              {ephemeral && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <InfoIcon className='h-4 w-4 cursor-pointer text-muted-foreground hover:text-[#8D5728]' />
                    </TooltipTrigger>
                    <TooltipContent className='w-[250px]'>
                      <p>
                        Depositing into this ephemeral addresses will privately deposit into Account
                        #{account.index}
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
