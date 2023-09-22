import { Button } from 'ui/components/ui/button';
import Link from 'next/link';

export default function Page() {
  return (
    <>
      <h1 className='scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl'>
        Penumbra Dapp
      </h1>

      <Link href='/chain-params'>
        <Button>View chain params</Button>
      </Link>
      <Link href='/balances'>
        <Button>View balances</Button>
      </Link>
    </>
  );
}
