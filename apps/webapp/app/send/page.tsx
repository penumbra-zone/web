import { FadeTransition } from 'ui';

export default function Page() {
  return (
    <FadeTransition className='flex min-h-[calc(100vh-82px)] flex-col items-stretch justify-start'>
      <div className='grid grid-cols-3 gap-6'>
        <div />
        <div className='relative'>
        <div className='relative z-10 rounded-lg p-5 bg-charcoal-secondary'>
          
        </div>
          <div className='absolute inset-0 z-0 bg-card-radial opacity-20' />
        </div>
        <div>asd</div>
      </div>
    </FadeTransition>
  );
}
