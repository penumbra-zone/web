import { useStore } from '../../../state';

export const Auctions = () => {
  const auctions = useStore(state => state.dutchAuction.auctions);
  return (
    <div className='flex flex-col gap-2'>
      {!auctions.length && <>No auctions</>}
      {!!auctions.length &&
        auctions.map(auction => (
          <div key={auction.nonce.toString()}>{auction.startHeight.toString()}</div>
        ))}
    </div>
  );
};
