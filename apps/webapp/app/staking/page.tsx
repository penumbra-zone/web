import { FadeTransition } from 'ui';

export default function Page() {
  return (
    <FadeTransition className='flex min-h-[calc(100vh-82px)] flex-col items-stretch justify-start'>
      <h1 className='text-4xl '>Staking</h1>
    </FadeTransition>
  );
}
