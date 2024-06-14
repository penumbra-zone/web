import { AllSlices } from '../../../state';
import { DutchAuctionComponent } from '@penumbra-zone/ui/components/ui/dutch-auction-component';
import { useStoreShallow } from '../../../utils/use-store-shallow';
import { AuctionId } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/auction/v1/auction_pb';
import { GradientHeader } from '@penumbra-zone/ui/components/ui/gradient-header';
import { QueryLatestStateButton } from './query-latest-state-button';
import { Card } from '@penumbra-zone/ui/components/ui/card';
import { bech32mAuctionId } from '@penumbra-zone/bech32m/pauctid';
import { useMemo } from 'react';
import { getFilteredAuctionInfos } from './get-filtered-auction-infos';
import { LayoutGroup, motion } from 'framer-motion';
import { useAuctionInfos } from '../../../state/swap/dutch-auction';
import { useStatus } from '../../../state/status';
import { SORT_FUNCTIONS } from './helpers';
import { Filters } from './filters';

const auctionListSelector = (state: AllSlices) => ({
  endAuction: state.swap.dutchAuction.endAuction,
  withdraw: state.swap.dutchAuction.withdraw,
  filter: state.swap.dutchAuction.filter,
});

const getButtonProps = (
  auctionId: AuctionId,
  endAuction: (auctionId: AuctionId) => Promise<void>,
  withdraw: (auctionId: AuctionId, seqNum: bigint) => Promise<void>,
  localSeqNum?: bigint,
):
  | { buttonType: 'end' | 'withdraw'; onClickButton: VoidFunction }
  | { buttonType: undefined; onClickButton: undefined } => {
  if (localSeqNum === 0n) {
    return { buttonType: 'end', onClickButton: () => void endAuction(auctionId) };
  }

  if (localSeqNum === 1n) {
    return { buttonType: 'withdraw', onClickButton: () => void withdraw(auctionId, localSeqNum) };
  }

  return { buttonType: undefined, onClickButton: undefined };
};

export const AuctionList = () => {
  const auctionInfos = useAuctionInfos();
  const { endAuction, withdraw, filter } = useStoreShallow(auctionListSelector);
  const { data: status } = useStatus();

  const filteredAuctionInfos = useMemo(
    () =>
      [...getFilteredAuctionInfos(auctionInfos.data ?? [], filter, status?.fullSyncHeight)].sort(
        SORT_FUNCTIONS[filter],
      ),
    [auctionInfos.data, filter, status?.fullSyncHeight],
  );

  return (
    <Card layout>
      <div className='mb-4 flex items-center justify-between'>
        <GradientHeader layout>My Auctions</GradientHeader>

        <motion.div layout className='flex items-center gap-2'>
          {!!auctionInfos.data?.length && <QueryLatestStateButton />}

          <Filters />
        </motion.div>
      </div>

      <div className='flex flex-col gap-2'>
        {!filteredAuctionInfos.length &&
          filter === 'all' &&
          "You don't currently have any auctions."}

        {!filteredAuctionInfos.length &&
          filter !== 'all' &&
          `You don't currently have any ${filter} auctions.`}

        <LayoutGroup>
          {filteredAuctionInfos.map(auctionInfo => (
            <div
              key={bech32mAuctionId(auctionInfo.id)}
              // Wrap each auction in a div with `bg-charcoal` so that they will
              // not overlap each other while animating in
              className='bg-charcoal'
            >
              <DutchAuctionComponent
                auctionId={auctionInfo.id}
                dutchAuction={auctionInfo.auction}
                inputMetadata={auctionInfo.inputMetadata}
                outputMetadata={auctionInfo.outputMetadata}
                fullSyncHeight={status?.fullSyncHeight}
                {...getButtonProps(auctionInfo.id, endAuction, withdraw, auctionInfo.localSeqNum)}
                renderButtonPlaceholder
              />
            </div>
          ))}
        </LayoutGroup>
      </div>
    </Card>
  );
};
