import { Metadata } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import { DutchAuction } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/auction/v1/auction_pb';
import { formatAmount } from '@penumbra-zone/types/amount';
import { ReactNode } from 'react';
import { Separator } from '../separator';
import { getPrice } from './get-price';
import { getDisplayDenomExponent } from '@penumbra-zone/getters/metadata';
import { cn } from '../../../lib/utils';

export const ExpandedDetails = ({
  dutchAuction,
  inputMetadata,
  outputMetadata,
  fullSyncHeight,
}: {
  dutchAuction: DutchAuction;
  inputMetadata?: Metadata;
  outputMetadata?: Metadata;
  fullSyncHeight?: bigint;
}) => {
  const { description } = dutchAuction;
  if (!description) return null;

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

  const inputExponent = getDisplayDenomExponent(inputMetadata);
  const outputExponent = getDisplayDenomExponent(outputMetadata);

  return (
    <div className='flex w-full flex-col'>
      {maxPrice && (
        <Row label='Maximum'>
          {formatAmount(maxPrice, outputExponent)}
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
          {formatAmount(currentPrice, outputExponent)}
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
          {formatAmount(minPrice, outputExponent)}
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
          {formatAmount(inputReservesAmount, inputExponent)}
          {inputMetadata && <span className='font-mono text-xs'> {inputMetadata.symbol}</span>}
        </Row>
      )}

      {outputReservesAmount && (
        <Row label='Output reserves'>
          {formatAmount(outputReservesAmount, outputExponent)}
          {outputMetadata && <span className='font-mono text-xs'> {outputMetadata.symbol}</span>}
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
  <div className='flex items-center justify-between'>
    <span className={cn('font-mono', !highlight && 'text-muted-foreground')}>{label}</span>
    <Separator />
    <span className={!highlight ? 'text-muted-foreground' : undefined}>{children}</span>
  </div>
);
