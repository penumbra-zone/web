import { Header } from './header.tsx';
import { FrontendReferral } from './frontend-referral.tsx';
import { NodeInfo } from './node-info.tsx';
import { SyncInfo } from './sync-info.tsx';
import { ValidatorInfo } from './validator-info.tsx';
import { useRefetchStatusOnInterval } from '../fetching/refetch-hook.ts';

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
