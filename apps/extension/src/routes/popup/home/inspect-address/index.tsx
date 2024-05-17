import { Box } from '@penumbra-zone/ui/components/ui/box';
import { IconInput } from '@penumbra-zone/ui/components/ui/icon-input';
import { useEffect, useState } from 'react';
import { MagnifyingGlassIcon } from '@radix-ui/react-icons';
import { Result as TResult } from './types';
import { getResultFromBech32mAddress } from './get-result-from-bech32m-address';
import { Result } from './result';

export const InspectAddress = () => {
  const [address, setAddress] = useState('');
  const [result, setResult] = useState<TResult | undefined>();

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

        <Result result={result} />
      </div>
    </Box>
  );
};
