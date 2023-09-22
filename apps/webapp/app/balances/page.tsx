import dynamic from 'next/dynamic';

const DisplayBalances = dynamic(() => import('./display-balances'), {
  ssr: false,
});

export default function Page() {
  return (
    <div>
      <h1 className='scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl'>Balances</h1>
      <DisplayBalances />
    </div>
  );
}
