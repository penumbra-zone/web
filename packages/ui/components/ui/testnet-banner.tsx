export const TestnetBanner = ({ chainId }: { chainId?: string }) => {
  return (
    <div className='w-full bg-yellow-500 text-center font-headline text-black'>
      <div className='m-auto max-w-prose p-2'>
        <h1 className='font-bold'>You are using {chainId}.</h1>
        <p>
          Testnet tokens are solely to allow testing the Penumbra protocol. Testnet tokens have no
          monetary value. Testnet activity has no relation to mainnet.
        </p>
      </div>
    </div>
  );
};
