import { Header } from './header';
import { FrontendReferral } from './frontend-referral';
import { NodeInfo } from './node-info';
import { SyncInfo } from './sync-info';
import { ValidatorInfo } from './validator-info';
import { useRefetchStatusOnInterval } from '../fetching/refetch-hook';

export const Index = () => {
  useRefetchStatusOnInterval();

  return (
    <>
      <Header />
      <div className='mx-auto max-w-[900px] px-6'>
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6'>
          <SyncInfo />
          <NodeInfo />
          <div className='flex flex-col gap-4'>
            <ValidatorInfo />
            <FrontendReferral />
          </div>
        </div>
      </div>
    </>
  );
};
