import { MagnifyingGlassIcon } from '@radix-ui/react-icons';
import { useId, useState } from 'react';
import { IconInput } from '@repo/ui/components/ui/icon-input';
import { Dialog, DialogClose, DialogContent, DialogHeader } from '@repo/ui/components/ui/dialog';
import { cn } from '@repo/ui/lib/utils';
import { ValueViewComponent } from '@repo/ui/components/ui/tx/view/value';
import { BalancesResponse } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';
import { getAddressIndex } from '@penumbra-zone/getters/address-view';
import { getDisplayDenomFromView, getSymbolFromValueView } from '@penumbra-zone/getters/value-view';
import { Box } from '@repo/ui/components/ui/box';
import { motion } from 'framer-motion';
import { isKnown } from '../swap/helpers';

const bySearch = (search: string) => (balancesResponse: BalancesResponse) =>
  isKnown(balancesResponse) &&
  (getDisplayDenomFromView(balancesResponse.balanceView)
    .toLocaleLowerCase()
    .includes(search.toLocaleLowerCase()) ||
    getSymbolFromValueView(balancesResponse.balanceView)
      .toLocaleLowerCase()
      .includes(search.toLocaleLowerCase()));

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
  const [isOpen, setIsOpen] = useState(false);
  const filteredBalances = search ? balances.filter(bySearch(search)) : balances;
  const layoutId = useId();

  return (
    <>
      {!isOpen && (
        <motion.div
          layout
          layoutId={layoutId}
          className='flex min-w-[100px] max-w-[200px] cursor-pointer items-center justify-center rounded-lg bg-light-brown px-2'
          onClick={() => setIsOpen(true)}
        >
          <ValueViewComponent view={value?.balanceView} showValue={false} />
        </motion.div>
      )}

      {isOpen && (
        <>
          {/* 0-opacity placeholder for layout's sake */}
          <div className='flex min-w-[100px] max-w-[200px] px-2 opacity-0'>
            <ValueViewComponent view={value?.balanceView} showValue={false} />
          </div>
        </>
      )}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent layoutId={layoutId}>
          <div className='flex max-h-screen flex-col'>
            <DialogHeader>Select asset</DialogHeader>
            <div className='flex shrink flex-col gap-4 overflow-auto p-4'>
              <Box spacing='compact'>
                <IconInput
                  icon={<MagnifyingGlassIcon className='size-5 text-muted-foreground' />}
                  value={search}
                  onChange={setSearch}
                  placeholder='Search assets...'
                />
              </Box>
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
    </>
  );
}
