import { Button, FadeTransition } from 'ui';
import Link from 'next/link';

export default function Page() {
  return (
    <FadeTransition className='flex min-h-[calc(100vh-82px)] flex-col items-stretch justify-start'>
      <h1 className='scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl'>Dashboard</h1>
      <Link href='/chain-params'>
        <Button>View chain params</Button>
      </Link>
      <Link href='/balances'>
        <Button>View balances</Button>
      </Link>
    </FadeTransition>
  );
}
