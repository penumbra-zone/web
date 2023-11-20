import { SelectAccount } from '@penumbra-zone/ui';
import { useEffect, useState } from 'react';
import { getAddressByIndex, getEphemeralAddress } from '../../fetchers/address';
import { useStore } from '../../state';
import { receiveSelector } from '../../state/receive';
import { Account } from '@penumbra-zone/types';

export const Receive = () => {
  const { index, ephemeral, setIndex, previous, next, setEphemeral } = useStore(receiveSelector);

  const [account, setAccount] = useState<Account | undefined>();

  useEffect(() => {
    void (async () => {
      const address = ephemeral
        ? await getEphemeralAddress(Number(index))
        : await getAddressByIndex(Number(index));
      setAccount({
        address,
        preview: address.slice(0, 33) + '…',
        index,
      });
    })();
  }, [index, ephemeral]);

  return (
    <div className='pb-3 md:pb-5'>
      {account && (
        <SelectAccount
          previous={previous}
          next={next}
          setIndex={setIndex}
          account={account}
          ephemeral={ephemeral}
          setEphemeral={setEphemeral}
        />
      )}
    </div>
  );
};
