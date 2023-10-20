import { FadeTransition } from '@penumbra-zone/ui';

export default function Page() {
  return (
    <FadeTransition className='flex min-h-[calc(100vh-82px)] flex-col items-stretch justify-start'>
      <h1 className='scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl'>Governance</h1>
    </FadeTransition>
  );
}
