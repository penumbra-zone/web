import cn from 'clsx';
import { ElementType, Fragment, ReactNode } from 'react';
import { Dot, ArrowRight } from 'lucide-react';
import { TransactionInfo } from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';
import { GetMetadata } from '../ActionView/types';
import { AddressViewComponent } from '../AddressView';
import { AssetGroup } from '../AssetIcon';
import { Density } from '../Density';
import { Pill } from '../Pill';
import { Text } from '../Text';
import { useClassification } from './use-classification';
import { SummaryEffects } from './effects';

export interface TransactionSummaryProps {
  /** TransactionInfo protobuf message, needs `view` and `summary` fields filled to function correctly */
  info: TransactionInfo;
  /**
   * A helper function that is needed to match action assets with their metadata.
   * Can be omitted, but it generally improves the rendering logic, especially for opaque views.
   * If omitted, some assets may be rendered as unknown or not rendered at all.
   */
  getMetadataByAssetId?: GetMetadata;
  as?: ElementType;
  /** Doesn't work if `as` prop is not provided – add `as='button'`, and the component will become hoverable and clickable */
  onClick?: VoidFunction;
  /** Markup to render on the right side of the component */
  endAdornment?: ReactNode;
}

/**
 * An all-in-one component for rendering transaction views. Displays a type
 * of transaction, assets involved, changing balances, and memo.
 *
 * Requires a `TransactionInfo` protobuf message with `view` and `summary` fields filled.
 * Can be retrieved from `TransactionInfo` or `TransactionInfoByHash` methods of the
 * ViewService, or from `getTx` method of the TendermintProxyService, or from
 * the `dex_ex_transactions` table of the Pindexer database.
 *
 * TODO: needs support for delegate, undelegate (claim), vote, proposal actions
 */
export const TransactionSummary = ({
  info,
  getMetadataByAssetId,
  onClick,
  endAdornment,
  as: Container = 'div',
}: TransactionSummaryProps) => {
  const { label, assets, additionalText, address, memo, type, tickers, effects } =
    useClassification(info, getMetadataByAssetId);

  return (
    <Container
      className={cn(
        'group h-[72px] w-full px-3  rounded-sm flex items-center gap-2 text-text-primary',
        'bg-other-tonalFill5 transition-colors',
        onClick && 'hover:bg-action-hoverOverlay cursor-pointer',
      )}
      onClick={onClick}
    >
      <AssetGroup size='lg' assets={assets} />

      <div className='flex grow flex-col'>
        <div className='flex items-center gap-1 text-text-secondary'>
          <Density slim>
            <Pill priority='primary' context='technical-default'>
              {label}
              {tickers?.length && <Dot className='size-3 text-neutral-light' />}
              {tickers?.map((ticker, index) => (
                <Fragment key={index}>
                  <Text detailTechnical color='text.primary'>
                    {ticker}
                  </Text>
                  {index !== tickers.length - 1 && (
                    <ArrowRight className='size-3 text-neutral-contrast' />
                  )}
                </Fragment>
              ))}
            </Pill>
            {additionalText && <Text detailTechnical>{additionalText}</Text>}
            {address && (
              <div className='max-w-32'>
                <AddressViewComponent
                  truncate
                  hideIcon
                  addressView={address}
                  external={type === 'ibcRelayAction'}
                />
              </div>
            )}
          </Density>
        </div>

        <SummaryEffects effects={effects} />

        {memo && (
          <Text as='em' color='text.secondary' detailTechnical>
            {memo}
          </Text>
        )}
      </div>

      {endAdornment && (
        <div className='flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100'>
          {endAdornment}
        </div>
      )}
    </Container>
  );
};
