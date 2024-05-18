import { Box } from '@penumbra-zone/ui/components/ui/box';
import { IconInput } from '@penumbra-zone/ui/components/ui/icon-input';
import { useEffect, useState } from 'react';
import { MagnifyingGlassIcon } from '@radix-ui/react-icons';
import { AddressOwnershipInfo } from './types';
import { getAddressOwnershipInfoFromBech32mAddress } from './get-address-ownership-info-from-bech32m-address';
import { Result } from './result';

export const ValidateAddress = () => {
  const [address, setAddress] = useState('');
  const [addressOwnershipInfo, setAddressOwnershipInfo] = useState<
    AddressOwnershipInfo | undefined
  >();

  useEffect(() => {
    void getAddressOwnershipInfoFromBech32mAddress(address).then(setAddressOwnershipInfo);
  }, [address]);

  return (
    <Box
      label='Validate address'
      state={addressOwnershipInfo?.isValidAddress === false ? 'error' : undefined}
    >
      <div className='flex flex-col gap-2'>
        <IconInput
          icon={<MagnifyingGlassIcon />}
          value={address}
          onChange={setAddress}
          placeholder='Paste address here...'
        />

        <Result addressOwnershipInfo={addressOwnershipInfo} />
      </div>
    </Box>
  );
};
