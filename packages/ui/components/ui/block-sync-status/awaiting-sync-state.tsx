import { Progress } from '../progress';
import { LineWave } from 'react-loader-spinner';

interface AwaitingStateProps {
  size?: 'large' | 'condensed';
}

export const AwaitingSyncState = ({ size }: AwaitingStateProps) => {
  return (
    <div className='flex select-none flex-col items-center gap-1 leading-[30px]'>
      {size === 'condensed' ? <CondensedAwaitingSyncedState /> : <LargeAwaitingSyncedState />}
    </div>
  );
};

const LargeAwaitingSyncedState = () => (
  <div className='flex w-full flex-col gap-1'>
    <div className='flex justify-center'>
      <p className='font-headline text-xl font-semibold text-stone-500'>Loading sync state...</p>
    </div>
    <Progress status='in-progress' value={0} />
    <div className='relative -mr-6 -mt-4 flex justify-center'>
      <LineWave visible={true} height='50' width='50' color='#78716c' wrapperClass='' />
    </div>
  </div>
);

const CondensedAwaitingSyncedState = () => (
  <div className='flex w-full flex-col'>
    <div className='flex justify-between'>
      <div className='flex gap-2'>
        <p className='font-headline text-stone-500'>Loading sync state...</p>
      </div>
      <div className='relative -mr-6 -mt-4'>
        <LineWave
          visible={true}
          height='50'
          width='50'
          color='#78716c'
          wrapperClass="transition-all duration-300 absolute right-0 bottom-0'"
        />
      </div>
    </div>
    <Progress status='in-progress' background='stone' value={0} />
  </div>
);
