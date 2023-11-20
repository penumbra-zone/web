import { ArrowLeftIcon, ArrowRightIcon } from 'lucide-react';
import { Input } from './input';
import { useState } from 'react';
import { Button } from './button';
import { cn } from '../../lib/utils';

interface SelectAccountProps {
  index: number | undefined;
  previous: () => void;
  next: () => void;
  setIndex: (index: number) => void;
}
const MAX_INDEX = 2 ** 32;

export const SelectAccount = ({ index, previous, next, setIndex }: SelectAccountProps) => {
  const [width, setWidth] = useState(index?.toString().length ?? 1);

  return (
    <div className='flex items-center justify-between'>
      <Button variant='ghost' className={cn('hover:bg-inherit', index === 0 && 'cursor-default')}>
        {index !== 0 ? (
          <ArrowLeftIcon
            onClick={() => {
              previous();

              setWidth(Number(String(index! - 1).length));
            }}
            className='h-6 w-6 hover:cursor-pointer'
          />
        ) : (
          <span className='h-6 w-6' />
        )}
      </Button>
      <div className='select-none text-center font-headline text-xl font-semibold leading-[30px]'>
        {index !== undefined && (
          <div className='flex items-end gap-[6px]'>
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
        )}
      </div>
      <Button
        variant='ghost'
        className={cn('hover:bg-inherit', index === MAX_INDEX && 'cursor-default')}
      >
        {index! < MAX_INDEX ? (
          <ArrowRightIcon
            onClick={() => {
              next();
              setWidth(Number(String(index! + 1).length));
            }}
            className='h-6 w-6 hover:cursor-pointer'
          />
        ) : (
          <span className='h-6 w-6' />
        )}
      </Button>
    </div>
  );
};
