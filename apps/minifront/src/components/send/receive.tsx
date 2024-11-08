import { SelectAccount } from '@penumbra-zone/ui-old/components/ui/select';
import { getAddrByIndex } from '../../fetchers/address';

export const Receive = () => {
  return (
    <div className='pb-3 md:pb-5'>
      <SelectAccount getAddrByIndex={getAddrByIndex} />
    </div>
  );
};
