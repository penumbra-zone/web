import { MagnifyingGlassIcon } from '@radix-ui/react-icons';
import { useState } from 'react';
import { IconInput } from '@penumbra-zone/ui/components/ui/icon-input';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from '@penumbra-zone/ui/components/ui/dialog';
import { cn } from '@penumbra-zone/ui/lib/utils';
import { ValueViewComponent } from '@penumbra-zone/ui/components/ui/tx/view/value';
import { BalancesResponse } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';
import { getAddressIndex } from '@penumbra-zone/getters/address-view';
import { getDisplayDenomFromView, getSymbolFromValueView } from '@penumbra-zone/getters/value-view';

const bySearch = (search: string) => (balancesResponse: BalancesResponse) =>
  getDisplayDenomFromView(balancesResponse.balanceView)
    .toLocaleLowerCase()
    .includes(search.toLocaleLowerCase()) ||
  getSymbolFromValueView(balancesResponse.balanceView)
    .toLocaleLowerCase()
    .includes(search.toLocaleLowerCase());

interface BalanceSelectorProps {
  value: BalancesResponse | undefined;
  onChange: (selection: BalancesResponse) => void;
  balances: BalancesResponse[];
}

/**
 * Renders balances the user holds, and allows the user to select one. This is
 * useful for a form where the user wants to send/sell/swap an asset that they
 * already hold.
 *
 * Use `<AssetSelector />` if you want to render assets that aren't tied to any
 * balance.
 */
export default function BalanceSelector({ value, balances, onChange }: BalanceSelectorProps) {
  const [search, setSearch] = useState('');
  const filteredBalances = search ? balances.filter(bySearch(search)) : balances;

  return (
    <Dialog>
      <DialogTrigger disabled={!balances.length}>
        <div className='flex h-9 min-w-[100px] max-w-[200px] items-center justify-center gap-2 rounded-lg bg-light-brown px-2'>
          <ValueViewComponent view={value?.balanceView} showValue={false} />
        </div>
      </DialogTrigger>
      <DialogContent>
        <div className='flex max-h-screen flex-col'>
          <DialogHeader>Select asset</DialogHeader>
          <div className='flex shrink flex-col gap-4 overflow-auto p-4'>
            <IconInput
              icon={<MagnifyingGlassIcon className='size-5 text-muted-foreground' />}
              value={search}
              onChange={setSearch}
              placeholder='Search assets...'
            />
            <div className='mt-2 grid grid-cols-4 font-headline text-base font-semibold'>
              <p className='flex justify-start'>Account</p>
              <p className='col-span-3 flex justify-start'>Asset</p>
            </div>
            <div className='flex flex-col gap-2'>
              {filteredBalances.map((b, i) => {
                const index = getAddressIndex(b.accountAddress).account;

                return (
                  <div key={i} className='flex flex-col'>
                    <DialogClose>
                      <div
                        className={cn(
                          'grid grid-cols-4 py-[10px] cursor-pointer hover:bg-light-brown hover:px-4 hover:-mx-4 font-bold text-muted-foreground',
                          value?.balanceView?.equals(b.balanceView) &&
                            value.accountAddress?.equals(b.accountAddress) &&
                            'bg-light-brown px-4 -mx-4',
                        )}
                        onClick={() => onChange(b)}
                      >
                        <p className='flex justify-start'>{index}</p>
                        <div className='col-span-3 flex justify-start'>
                          <ValueViewComponent view={b.balanceView} />
                        </div>
                      </div>
                    </DialogClose>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
