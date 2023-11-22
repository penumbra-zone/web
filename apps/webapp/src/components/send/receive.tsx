import { SelectAccount } from '@penumbra-zone/ui';
import { getAccountAddr } from '../../fetchers/address';

export const Receive = () => {
  return (
    <div className='pb-3 md:pb-5'>
      <SelectAccount getAccount={getAccountAddr} />
    </div>
  );
};
