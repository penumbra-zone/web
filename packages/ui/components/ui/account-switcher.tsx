import { ArrowLeftIcon, ArrowRightIcon } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from './button';
import { Input } from './input';
import { useState } from 'react';

const MAX_INDEX = 2 ** 32;

/**
 * Renders arrows with which to switch between accounts by index, from 0 to
 * 2^32.
 */
export const AccountSwitcher = ({
  account,
  onChange,
}: {
  account: number;
  onChange: (account: number) => void;
}) => {
  const [inputCharWidth, setInputCharWidth] = useState(1);

  const handleChange = (value: number) => {
    onChange(value);
    setInputCharWidth(String(value).length);
  };

  return (
    <div className='flex items-center justify-between'>
      <Button variant='ghost' className={cn('hover:bg-inherit', account === 0 && 'cursor-default')}>
        {account !== 0 ? (
          <ArrowLeftIcon
            onClick={() => {
              if (account > 0) handleChange(account - 1);
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
                  handleChange(value);
                }}
                style={{ width: `${inputCharWidth}ch` }}
                value={account ? account.toString().replace(/^0+/, '') : '0'}
              />
            </div>
          </div>
        </div>
      </div>
      <Button
        variant='ghost'
        className={cn('hover:bg-inherit', account === MAX_INDEX && 'cursor-default')}
      >
        {account < MAX_INDEX ? (
          <ArrowRightIcon
            onClick={() => handleChange(account + 1)}
            className='size-6 hover:cursor-pointer'
          />
        ) : (
          <span className='size-6' />
        )}
      </Button>
    </div>
  );
};
