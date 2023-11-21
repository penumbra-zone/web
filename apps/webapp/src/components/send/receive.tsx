import { SelectAccount } from '@penumbra-zone/ui';
import { useEffect } from 'react';
import { useStore } from '../../state';
import { receiveSelector } from '../../state/receive';

export const Receive = () => {
  const {
    index,
    ephemeral,
    selectedAccount,
    setIndex,
    previous,
    next,
    setEphemeral,
    setSelectedAccount,
  } = useStore(receiveSelector);

  useEffect(() => {
    void setSelectedAccount();
  }, [index, ephemeral, setSelectedAccount]);

  return (
    <div className='pb-3 md:pb-5'>
      {selectedAccount && (
        <SelectAccount
          previous={previous}
          next={next}
          setIndex={setIndex}
          account={selectedAccount}
          ephemeral={ephemeral}
          setEphemeral={setEphemeral}
        />
      )}
    </div>
  );
};
