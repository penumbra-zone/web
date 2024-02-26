import { Link } from 'react-router-dom';
import { LineWave } from 'react-loader-spinner';
import { cn } from '@penumbra-zone/ui/lib/utils';
import { useDelayedIsLoading } from '../fetching/refetch-hook';

export const Header = () => {
  const isLoading = useDelayedIsLoading();

  return (
    <header className='z-10 flex w-full flex-col items-center justify-between px-6 md:h-[82px] md:flex-row md:gap-12 md:px-12'>
      <div className='mb-[30px] md:mb-0'>
        <img
          src='./penumbra-rays.svg'
          alt='Penumbra logo'
          className='absolute inset-x-0 top-[-75px] mx-auto h-[141px] w-[136px] rotate-[320deg] md:left-[-100px] md:top-[-140px] md:mx-0 md:size-[234px]'
        />
        <Link to='/'>
          <img
            src='./penumbra-text-logo.svg'
            alt='Penumbra logo'
            className='relative z-10 mt-[20px] h-4 w-[171px] md:mt-0'
          />
        </Link>
      </div>
      <div className='ml-[78px] flex items-center text-xl font-semibold'>
        <span>Node Status</span>
        <LineWave
          visible={true}
          height='70'
          width='70'
          color='white'
          wrapperClass={cn(
            'mb-5 transition-all duration-300',
            isLoading ? 'opacity-100' : 'opacity-0',
          )}
        />
      </div>
      <div className='w-[171px]' />
    </header>
  );
};
