import { Box } from '@penumbra-zone/ui/components/ui/box';
import { IconInput } from '@penumbra-zone/ui/components/ui/icon-input';
import { useEffect, useState } from 'react';
import { MagnifyingGlassIcon } from '@radix-ui/react-icons';
import { BadgeAlert, BadgeCheck } from 'lucide-react';
import { Result } from './types';
import { getResultFromBech32mAddress } from './get-result-from-bech32m-address';

export const InspectAddress = () => {
  const [address, setAddress] = useState('');
  const [result, setResult] = useState<Result | undefined>();

  useEffect(() => {
    void getResultFromBech32mAddress(address).then(setResult);
  }, [address]);

  return (
    <Box label='Inspect address'>
      <div className='flex flex-col gap-2'>
        <IconInput
          icon={<MagnifyingGlassIcon />}
          value={address}
          onChange={setAddress}
          placeholder='Paste address here...'
        />

        {result && (
          <div className='flex items-center gap-2'>
            {result.belongsToWallet && (
              <>
                <BadgeCheck className='text-green' />

                <div className='flex flex-col'>
                  Belongs to this wallet
                  <span className='text-xs text-muted-foreground'>
                    Account #{result.addressIndexAccount}
                    {result.ibc && (
                      <>
                        {' '}
                        &bull; <span className='text-rust'>IBC deposit address</span>
                      </>
                    )}
                  </span>
                </div>
              </>
            )}
            {!result.belongsToWallet && (
              <>
                <BadgeAlert className='text-red' />
                Does not belong to this wallet
              </>
            )}
          </div>
        )}
      </div>
    </Box>
  );
};
