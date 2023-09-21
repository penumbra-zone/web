import dynamic from 'next/dynamic';

const ChainParams = dynamic(() => import('./index'), {
  ssr: false,
});

export default function Page() {
  return (
    <div>
      <h1 className='scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl'>
        Chain Params
      </h1>
      <ChainParams />
    </div>
  );
}
