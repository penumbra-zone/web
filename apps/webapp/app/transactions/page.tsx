import dynamic from 'next/dynamic';

const AllTransactions = dynamic(() => import('./all-transactions'), {
  ssr: false,
});

export default function Page() {
  return (
    <div>
      <h1 className='scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl'>
        All transactions
      </h1>
      <AllTransactions />
    </div>
  );
}
