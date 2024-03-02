import { DotsVerticalIcon, MagnifyingGlassIcon } from '@radix-ui/react-icons';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Button,
  FadeTransition,
  Input,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@penumbra-zone/ui';
import { LinkGradientIcon } from '../../../icons';
import { SettingsHeader } from '../../../shared';
import { OriginRecord, localExtStorage } from '@penumbra-zone/storage';

import Map from '@penumbra-zone/polyfills/Map.groupBy';

export const SettingsConnectedSites = () => {
  const [search, setSearch] = useState<string>();

  const [sitesFromStorage, setSitesFromStorage] = useState<OriginRecord[]>();

  const loadSitesFromStorage = useCallback(
    async () => setSitesFromStorage(await localExtStorage.get('connectedSites')),
    [],
  );
  useEffect(() => void loadSitesFromStorage(), [loadSitesFromStorage]);

  const [attitude, match] = useMemo(() => {
    if (!sitesFromStorage) return [];
    return [
      Map.groupBy(sitesFromStorage, ({ attitude }) => attitude),
      search ? Map.groupBy(sitesFromStorage, ({ origin }) => origin.includes(search)) : undefined,
    ];
  }, [sitesFromStorage, search]);

  console.log({ attitude, match });

  return (
    <FadeTransition>
      <div className='flex min-h-[100vh] w-[100vw] flex-col gap-6'>
        <SettingsHeader title='Connected sites' />
        <div className='mx-auto size-20'>
          <LinkGradientIcon />
        </div>
        <div className='flex flex-col gap-4 px-[30px]'>
          <div className='relative flex w-full items-center justify-center gap-4'>
            <div className='absolute inset-y-0 left-3 flex items-center'>
              <MagnifyingGlassIcon className='size-5 text-muted-foreground' />
            </div>
            <Input
              className='pl-10'
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder='Dapp name...'
            />
          </div>
          <div className='flex flex-col gap-2'>
            {attitude?.get(true)?.map((site, index) => (
              <div
                key={index}
                className='flex items-center justify-between rounded-lg border bg-background px-3 py-[14px]'
              >
                <p>{site.origin}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </FadeTransition>
  );
};
export const ConnectedSitesActionPopover = () => {
  return (
    <Popover>
      <PopoverTrigger>
        <DotsVerticalIcon className='size-5 cursor-pointer hover:opacity-50' />
      </PopoverTrigger>
      <PopoverContent align='center' className='w-[120px] p-0'>
        <Button variant='outline' className='flex h-11 w-full justify-start rounded-t-lg px-5'>
          Delete
        </Button>
        <Button
          variant='outline'
          className='flex h-11 w-full justify-start rounded-b-lg border-b-0 px-5'
        >
          Edit
        </Button>
      </PopoverContent>
    </Popover>
  );
};
