import { AllSlices } from '../../../state';
import { DutchAuctionComponent } from '@penumbra-zone/ui-deprecated/components/ui/dutch-auction-component';
import { useStoreShallow } from '../../../utils/use-store-shallow';
import { AuctionId } from '@penumbra-zone/protobuf/penumbra/core/component/auction/v1/auction_pb';
import { GradientHeader } from '@penumbra-zone/ui-deprecated/components/ui/gradient-header';
import { QueryLatestStateButton } from './query-latest-state-button';
import { Card } from '@penumbra-zone/ui-deprecated/components/ui/card';
import { bech32mAuctionId } from '@penumbra-zone/bech32m/pauctid';
import { useMemo } from 'react';
import { getFilteredAuctionInfos } from './get-filtered-auction-infos';
import { LayoutGroup, motion } from 'framer-motion';
import { useAuctionInfos } from '../../../state/swap/dutch-auction';
import { useStatus } from '../../../state/status';
import { byStartHeightDescending } from './helpers';
import { Filters } from './filters';
import { AddressIndex } from '@penumbra-zone/protobuf/penumbra/core/keys/v1/keys_pb';
import { EndOrWithdrawAllButton } from './end-or-withdraw-all-button.tsx';

const auctionListSelector = (state: AllSlices) => ({
  endAuction: state.swap.dutchAuction.endAuction,
  withdraw: state.swap.dutchAuction.withdraw,
  filter: state.swap.dutchAuction.filter,
});

const getButtonProps = (
  auctionId: AuctionId,
  addressIndex: AddressIndex,
  endAuction: (auctionId: AuctionId, addressIndex: AddressIndex) => Promise<void>,
  withdraw: (auctionId: AuctionId, seqNum: bigint, addressIndex: AddressIndex) => Promise<void>,
  localSeqNum?: bigint,
):
  | { buttonType: 'end' | 'withdraw'; onClickButton: VoidFunction }
  | { buttonType: undefined; onClickButton: undefined } => {
  if (localSeqNum === 0n) {
    return { buttonType: 'end', onClickButton: () => void endAuction(auctionId, addressIndex) };
  }

  if (localSeqNum === 1n) {
    return {
      buttonType: 'withdraw',
      onClickButton: () => void withdraw(auctionId, localSeqNum, addressIndex),
    };
  }

  return { buttonType: undefined, onClickButton: undefined };
};

export const AuctionList = () => {
  const auctionInfos = useAuctionInfos();
  const { endAuction, withdraw, filter } = useStoreShallow(auctionListSelector);
  const { data: status } = useStatus();

  const filteredAuctionInfos = useMemo(
    () =>
      [...getFilteredAuctionInfos(auctionInfos.data ?? [], filter)].sort(byStartHeightDescending),
    [auctionInfos.data, filter],
  );

  return (
    <Card layout>
      <div className='mb-4 flex items-center justify-between'>
        <GradientHeader layout>My Auctions</GradientHeader>

        <motion.div layout className='flex items-center gap-2'>
          {!!auctionInfos.data?.length && <QueryLatestStateButton />}

          <Filters />
          <EndOrWithdrawAllButton />
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
                addressIndex={auctionInfo.addressIndex}
                {...getButtonProps(
                  auctionInfo.id,
                  auctionInfo.addressIndex,
                  endAuction,
                  withdraw,
                  auctionInfo.localSeqNum,
                )}
                renderButtonPlaceholder
              />
            </div>
          ))}
        </LayoutGroup>
      </div>
    </Card>
  );
};
