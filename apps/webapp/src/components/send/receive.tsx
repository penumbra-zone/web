import { Input, Switch } from '@penumbra-zone/ui';
import { useEffect, useState } from 'react';
import { getAddressByIndex, getEphemeralAddress } from '../../fetchers/address';
import { useStore } from '../../state';
import { receiveSelector } from '../../state/receive';

export const Receive = () => {
  const { index, ephemeral, setIndex, setEphemeral } = useStore(receiveSelector);

  const [address, setAddress] = useState('');

  useEffect(() => {
    void (async () => {
      const address = ephemeral
        ? await getEphemeralAddress(Number(index))
        : await getAddressByIndex(Number(index));

      setAddress(address);
    })();
  }, [index, ephemeral]);

 
  

  return (
    <div className='flex flex-col gap-2'>
      <Input value={index} onChange={e => setIndex(Number(e.target.value))} />
      <Switch
        id='address-mode'
        checked={ephemeral}
        onCheckedChange={checked => setEphemeral(checked)}
      />
      <p className='break-all'>{address}</p>
    </div>
  );
};
