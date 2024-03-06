import { ArrowLeftIcon, ArrowRightIcon } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from './button';
import { Input } from './input';
import { useMemo, useState } from 'react';

const MAX_INDEX = 2 ** 32;

/**
 * Renders arrows with which to switch between accounts by index, from 0 to
 * 2^32.
 */
export const AccountSwitcher = ({
  account,
  onChange,
  filter,
}: {
  account: number;
  onChange: (account: number) => void;
  /**
   * An array of address indexes to switch between, if you want to limit the
   * options. Must be pre-sorted! `AccountSwitcher` won't sort this for you.
   */
  filter?: number[];
}) => {
  const [inputCharWidth, setInputCharWidth] = useState(1);

  const sortedFilter = useMemo(() => (filter ? [...filter].sort() : undefined), [filter]);

  const handleClickPrevious = () => {
    if (sortedFilter) {
      const previousAccount = sortedFilter[sortedFilter.indexOf(account) - 1];
      if (previousAccount !== undefined) onChange(previousAccount);
    } else onChange(account - 1);
  };

  const handleClickNext = () => {
    if (sortedFilter) {
      const nextAccount = sortedFilter[sortedFilter.indexOf(account) + 1];
      if (nextAccount !== undefined) onChange(nextAccount);
    } else onChange(account + 1);
  };

  const shouldShowPreviousButton =
    account !== 0 && (!sortedFilter || sortedFilter.indexOf(account) > 0);
  const shouldShowNextButton =
    account !== MAX_INDEX &&
    (!sortedFilter || sortedFilter.indexOf(account) < sortedFilter.length - 1);

  const handleChange = (value: number) => {
    onChange(value);
    setInputCharWidth(String(value).length);
  };

  return (
    <div className='flex items-center justify-between'>
      <Button variant='ghost' className={cn('hover:bg-inherit', account === 0 && 'cursor-default')}>
        {shouldShowPreviousButton ? (
          <ArrowLeftIcon
            aria-label='Previous account'
            role='button'
            onClick={handleClickPrevious}
            className='size-6 hover:cursor-pointer'
          />
        ) : (
          <span className='size-6' />
        )}
      </Button>
      <div className='select-none text-center font-headline text-xl font-semibold leading-[30px]'>
        <div className='flex flex-row flex-wrap items-end gap-[6px]'>
          <span id='AccountSwitcher__label'>Account</span>
          <div className='flex items-end gap-0'>
            <p>#</p>
            <div className='relative w-min min-w-[24px]'>
              <Input
                aria-label={`Account #${account}`}
                aria-disabled={!!filter}
                variant='transparent'
                type='number'
                className='mb-[3px] h-6 py-[2px] font-headline text-xl font-semibold leading-[30px]'
                onChange={e => {
                  /**
                   * Don't allow manual account number entry when there's a
                   * filter.
                   *
                   * @todo: Change this to only call `handleChange()` when the
                   * user presses Enter? Then it could validate that the entered
                   * account index is in the filter.
                   */
                  if (filter) return;

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
        {shouldShowNextButton ? (
          <ArrowRightIcon
            aria-label='Next account'
            role='button'
            onClick={handleClickNext}
            className='size-6 hover:cursor-pointer'
          />
        ) : (
          <span className='size-6' />
        )}
      </Button>
    </div>
  );
};
