import { ArrowLeftIcon, ArrowRightIcon } from 'lucide-react';
import { useMemo, useState } from 'react';
import { cn } from '../../../lib/utils';
import { Button } from '../button';
import { Input } from '../input';

const MAX_INDEX = 2 ** 32;

/**
 * Renders arrows with which to switch between accounts by index, from 0 to
 * 2^32.
 */
export const AccountSwitcher = ({
  account,
  onChange,
  filter,
  compact,
}: {
  account: number;
  onChange: (account: number) => void;
  /**
   * An array of address indexes to switch between, if you want to limit the
   * options. No need to sort them, as the component will do that for you.
   */
  filter?: number[];
  /** If true, renders smaller selector */
  compact?: boolean;
}) => {
  const [inputCharWidth, setInputCharWidth] = useState(1);

  const sortedFilter = useMemo(() => (filter ? [...filter].sort() : undefined), [filter]);

  const handleChange = (value: number) => {
    onChange(value);
    setInputCharWidth(String(value).length);
  };

  const handleClickPrevious = () => {
    if (sortedFilter) {
      const previousAccount = sortedFilter[sortedFilter.indexOf(account) - 1];
      if (previousAccount !== undefined) handleChange(previousAccount);
    } else {
      handleChange(account - 1);
    }
  };

  const handleClickNext = () => {
    if (sortedFilter) {
      const nextAccount = sortedFilter[sortedFilter.indexOf(account) + 1];
      if (nextAccount !== undefined) handleChange(nextAccount);
    } else {
      handleChange(account + 1);
    }
  };

  const previousButtonEnabled =
    account !== 0 && (!sortedFilter || sortedFilter.indexOf(account) > 0);
  const nextButtonEnabled =
    account !== MAX_INDEX &&
    (!sortedFilter || sortedFilter.indexOf(account) < sortedFilter.length - 1);

  return (
    <div className='flex items-center justify-between'>
      <Button
        size={compact ? 'sm' : 'default'}
        type='button'
        variant='ghost'
        className={cn('hover:bg-inherit hover:text-slate-400', account === 0 && 'cursor-default')}
        disabled={!previousButtonEnabled}
      >
        <ArrowLeftIcon
          aria-label='Previous account'
          role='button'
          onClick={handleClickPrevious}
          className={cn(compact ? 'size-4' : 'size-6', 'hover:cursor-pointer')}
        />
      </Button>
      <div
        className={cn(
          compact ? 'text-base' : 'font-headline text-xl',
          'select-none text-center font-semibold leading-[30px]',
        )}
      >
        <label className='flex flex-row flex-wrap items-end gap-[6px]'>
          <span>Account</span>
          <div className='flex items-end gap-0'>
            <p>#</p>
            <div className='relative w-min min-w-[24px]'>
              <Input
                aria-label={`Account #${account}`}
                aria-disabled={!!filter}
                variant='transparent'
                type='number'
                className={cn(
                  compact ? 'text-base' : 'font-headline text-xl',
                  'mb-[3px] h-6 py-[2px] font-semibold leading-[30px]',
                )}
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
                value={account ? account.toString().replace(/^0+/, '') : '0'} // Removes leading zeros (e.g. 00123 -> 123
              />
            </div>
          </div>
        </label>
      </div>
      <Button
        size={compact ? 'sm' : 'default'}
        type='button'
        variant='ghost'
        className={cn(
          'hover:bg-inherit hover:text-slate-400',
          account === MAX_INDEX && 'cursor-default',
        )}
        disabled={!nextButtonEnabled}
      >
        <ArrowRightIcon
          aria-label='Next account'
          role='button'
          onClick={handleClickNext}
          className={cn(compact ? 'size-4' : 'size-6', 'hover:cursor-pointer')}
        />
      </Button>
    </div>
  );
};
