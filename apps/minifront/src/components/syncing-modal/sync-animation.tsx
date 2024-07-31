import illustration from './illustration.svg';

const FakeButtons = () => (
  <div className='ml-6 mt-6 flex gap-1'>
    <div className='size-4 rounded-full bg-light-grey opacity-20' />
    <div className='size-4 rounded-full bg-light-grey opacity-20' />
    <div className='size-4 rounded-full bg-light-grey opacity-20' />
  </div>
);

/**
 * @todo Use Penumbra UI values once its Tailwind config is ready.
 */
export const SyncAnimation = () => (
  <div className='flex flex-col gap-8 rounded-sm bg-black'>
    <FakeButtons />

    <div className='relative h-0 pb-[33%]'>
      <div className='absolute inset-0 overflow-hidden'>
        <img
          src={illustration}
          alt='A loading illustration'
          className='animate-spin [animation-duration:_5s]'
        />
      </div>
    </div>
  </div>
);
