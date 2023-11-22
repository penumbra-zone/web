import { SelectAccount } from '@penumbra-zone/ui';
import { getAddressByIndex, getEphemeralAddress } from '../../fetchers/address';

export const Receive = () => {
  const getAccount = async (index: number, ephemeral: boolean) => {
    const address = ephemeral ? await getEphemeralAddress(index) : await getAddressByIndex(index);

    return {
      address,
      preview: address.slice(0, 33) + '…',
      index,
    };
  };

  return (
    <div className='pb-3 md:pb-5'>
      <SelectAccount getAccount={getAccount} />
    </div>
  );
};
