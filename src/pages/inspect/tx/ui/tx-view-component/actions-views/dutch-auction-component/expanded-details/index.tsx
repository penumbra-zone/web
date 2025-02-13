import { Metadata } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import {
  AuctionId,
  DutchAuction,
} from '@penumbra-zone/protobuf/penumbra/core/component/auction/v1/auction_pb';
import { formatAmount } from '@penumbra-zone/types/amount';
import { ReactNode } from 'react';
import { getPrice } from './get-price';
import { getDisplayDenomExponent } from '@penumbra-zone/getters/metadata';
import { cn } from '../../../utils/cn';
import { AuctionIdComponent } from '../../auction-id-component';
import { motion } from 'framer-motion';
import { AddressIndex } from '@penumbra-zone/protobuf/penumbra/core/keys/v1/keys_pb';

const Separator = () => (
  // For some reason, Tailwind's ESLint config wants to change `border-b-[1px]`
  // to `border-b-DEFAULT`, even though that has a different effect!
  <div className='mx-2 h-px min-w-8 grow border-b-[1px] border-dotted border-light-brown' />
);

export const ExpandedDetails = ({
  auctionId,
  dutchAuction,
  inputMetadata,
  outputMetadata,
  addressIndex,
  fullSyncHeight,
}: {
  auctionId?: AuctionId;
  dutchAuction: DutchAuction;
  inputMetadata?: Metadata;
  outputMetadata?: Metadata;
  addressIndex?: AddressIndex;
  fullSyncHeight?: bigint;
}) => {
  const { description } = dutchAuction;
  if (!description) {
    return null;
  }

  const maxPrice = getPrice(description, inputMetadata, description.startHeight);
  const currentPrice = getPrice(description, inputMetadata, fullSyncHeight);
  const minPrice = getPrice(description, inputMetadata, description.endHeight);
  const inputReservesAmount = dutchAuction.state?.inputReserves;
  const outputReservesAmount = dutchAuction.state?.outputReserves;

  const showCurrent =
    !!fullSyncHeight &&
    !!currentPrice &&
    fullSyncHeight >= description.startHeight &&
    fullSyncHeight <= description.endHeight;

  const inputExponent = getDisplayDenomExponent.optional(inputMetadata);
  const outputExponent = getDisplayDenomExponent.optional(outputMetadata);

  return (
    <div className='flex w-full flex-col overflow-hidden'>
      {maxPrice && (
        <Row label='Maximum'>
          {formatAmount({ amount: maxPrice, exponent: outputExponent })}
          {outputMetadata && (
            <span className='font-mono text-xs'>
              {' '}
              {outputMetadata.symbol} / {inputMetadata?.symbol} @ block{' '}
              {description.startHeight.toString()}
            </span>
          )}
        </Row>
      )}

      {showCurrent && (
        <Row label='Current' highlight>
          {formatAmount({ amount: currentPrice, exponent: outputExponent })}
          {outputMetadata && (
            <span className='font-mono text-xs'>
              {' '}
              {outputMetadata.symbol} / {inputMetadata?.symbol} @ block {fullSyncHeight.toString()}
            </span>
          )}
        </Row>
      )}

      {minPrice && (
        <Row label='Minimum'>
          {formatAmount({ amount: minPrice, exponent: outputExponent })}
          {outputMetadata && (
            <span className='font-mono text-xs'>
              {' '}
              {outputMetadata.symbol} / {inputMetadata?.symbol} @ block{' '}
              {description.endHeight.toString()}
            </span>
          )}
        </Row>
      )}

      {inputReservesAmount && (
        <Row label='Input reserves'>
          {formatAmount({ amount: inputReservesAmount, exponent: inputExponent })}
          {inputMetadata && <span className='font-mono text-xs'> {inputMetadata.symbol}</span>}
        </Row>
      )}

      {outputReservesAmount && (
        <Row label='Output reserves'>
          {formatAmount({ amount: outputReservesAmount, exponent: outputExponent })}
          {outputMetadata && <span className='font-mono text-xs'> {outputMetadata.symbol}</span>}
        </Row>
      )}

      {auctionId && (
        <Row label='Auction ID'>
          <AuctionIdComponent auctionId={auctionId} />
        </Row>
      )}

      {addressIndex && (
        <Row label='Account'>
          <span className='font-mono text-xs'>{addressIndex.account}</span>
        </Row>
      )}
    </div>
  );
};

const Row = ({
  label,
  children,
  highlight,
}: {
  label: string;
  children: ReactNode;
  highlight?: boolean;
}) => (
  <motion.div layout className='flex items-center justify-between'>
    <span className={cn('font-mono text-nowrap', !highlight && 'text-muted-foreground')}>
      {label}
    </span>
    <Separator />
    <span className={cn('overflow-hidden', !highlight && 'text-muted-foreground')}>{children}</span>
  </motion.div>
);
