import cn from 'clsx';
import { ElementType, Fragment } from 'react';
import { Dot, ArrowRight } from 'lucide-react';
import { TransactionInfo } from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';
import { GetMetadataByAssetId } from '../ActionView/types';
import { AddressViewComponent } from '../AddressView';
import { AssetGroup } from '../AssetIcon';
import { Density } from '../Density';
import { Pill } from '../Pill';
import { Text } from '../Text';
import { useClassification } from './use-classification';
import { SummaryEffects } from './effects';

export interface TransactionSummaryProps {
  info: TransactionInfo;
  getMetadataByAssetId?: GetMetadataByAssetId;
  as?: ElementType;
}

export const TransactionSummary = ({
  info,
  getMetadataByAssetId,
  as: Container = 'div',
}: TransactionSummaryProps) => {
  const { label, assets, additionalText, address, memo, type, tickers } = useClassification(
    info,
    getMetadataByAssetId,
  );

  return (
    <Container
      className={cn(
        'h-[72px] w-full px-3 bg-other-tonalFill5 rounded-sm flex items-center gap-2 text-text-primary',
      )}
    >
      <AssetGroup size='lg' assets={assets} />
      <div className='flex flex-col'>
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
              <AddressViewComponent addressView={address} external={type === 'ibcRelayAction'} />
            )}
          </Density>
        </div>

        <SummaryEffects
          effects={info.summary?.effects ?? []}
          getMetadataByAssetId={getMetadataByAssetId}
        />

        {memo && (
          <Text color='text.secondary' detailTechnical>
            {memo}
          </Text>
        )}
      </div>
    </Container>
  );
};
