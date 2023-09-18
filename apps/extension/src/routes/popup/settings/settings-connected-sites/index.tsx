import { DotsVerticalIcon, MagnifyingGlassIcon } from '@radix-ui/react-icons';
import { useMemo, useState } from 'react';
import { Button, Input, Popover, PopoverContent, PopoverTrigger } from 'ui/components';
import { FadeTransition, SettingsHeader } from '../../../../shared';
import { LinkGradientIcon } from './icon';

const dapps = ['app.testnet.penumbra.zone', 'testnet.penumbra.zone'];

export const SettingsConnectedSites = () => {
  const [search, setSearch] = useState('');

  const filteredDapps = useMemo(() => {
    if (!search) return dapps;
    return dapps.filter(i => i.toLowerCase().includes(search.toLowerCase()));
  }, [search]);

  return (
    <FadeTransition>
      <div className='flex min-h-[100vh] w-[100vw] flex-col gap-10'>
        <SettingsHeader title='Connected sites' />
        <div className='mx-auto h-[60px] w-[60px]'>
          <LinkGradientIcon />
        </div>
        <div className='flex flex-col gap-4 px-5'>
          <div className='relative flex w-full items-center justify-center gap-4'>
            <div className='absolute inset-y-0 left-3 flex items-center'>
              <MagnifyingGlassIcon className='h-5 w-5 text-muted-foreground' />
            </div>
            <Input
              className='pl-10'
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder='Dapp name...'
            />
          </div>
          <div className='flex flex-col gap-2'>
            {filteredDapps.map((i, index) => (
              <div
                key={index}
                className='flex items-center justify-between rounded-lg border border-border bg-background p-4'
              >
                <p className='text-base-bold'>{i}</p>
                <Popover>
                  <PopoverTrigger>
                    <DotsVerticalIcon className='h-5 w-5 cursor-pointer hover:opacity-50' />
                  </PopoverTrigger>
                  <PopoverContent align='center' className='w-[120px] p-0 pb-3'>
                    <Button variant='outline' className='flex h-11 w-full justify-start px-5'>
                      Delete
                    </Button>
                    <Button variant='outline' className='flex h-11 w-full justify-start px-5'>
                      Edit
                    </Button>
                  </PopoverContent>
                </Popover>
              </div>
            ))}
          </div>
        </div>
      </div>
    </FadeTransition>
  );
};
