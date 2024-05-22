import {
  Metadata,
  Value,
  ValueView,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import { SwapExecution_Trace } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/dex/v1/dex_pb';
import { bech32mAssetId } from '@penumbra-zone/bech32m/passet';
import { getDisplayDenomExponent } from '@penumbra-zone/getters/metadata';
import { formatAmount } from '@penumbra-zone/types/amount';
import { ValueViewComponent } from '@penumbra-zone/ui/components/ui/tx/view/value';
import BigNumber from 'bignumber.js';
import { Fragment } from 'react';

const getValueView = (metadataByAssetId: Record<string, Metadata>, { amount, assetId }: Value) =>
  new ValueView({
    valueView: {
      case: 'knownAssetId',
      value: {
        amount,
        metadata: assetId ? metadataByAssetId[bech32mAssetId(assetId)] : undefined,
      },
    },
  });

const Separator = () => (
  // eslint-disable-next-line tailwindcss/no-unnecessary-arbitrary-value
  <div className='mx-2 h-px min-w-4 grow border-b-[1px] border-dotted border-light-brown' />
);

export const Trace = ({
  trace,
  metadataByAssetId,
}: {
  trace: SwapExecution_Trace;
  metadataByAssetId: Record<string, Metadata>;
}) => {
  const inputValue = trace.value[0];
  const outputValue = trace.value[trace.value.length - 1];
  let price: string | undefined;

  if (inputValue?.amount && outputValue?.amount && inputValue.assetId && outputValue.assetId) {
    const firstValueMetadata = metadataByAssetId[bech32mAssetId(inputValue.assetId)];
    const lastValueMetadata = metadataByAssetId[bech32mAssetId(outputValue.assetId)];

    if (firstValueMetadata?.symbol && lastValueMetadata?.symbol) {
      const inputDisplayDenomExponent = getDisplayDenomExponent.optional()(firstValueMetadata) ?? 0;
      const outputDisplayDenomExponent = getDisplayDenomExponent.optional()(lastValueMetadata) ?? 0;
      const formattedInputAmount = formatAmount(inputValue.amount, inputDisplayDenomExponent);
      const formattedOutputAmount = formatAmount(outputValue.amount, outputDisplayDenomExponent);

      const outputToInputRatio = new BigNumber(formattedOutputAmount)
        .dividedBy(formattedInputAmount)
        .toFormat(outputDisplayDenomExponent);

      price = `1 ${firstValueMetadata.symbol} = ${outputToInputRatio} ${lastValueMetadata.symbol}`;
    }
  }

  return (
    <div className='flex flex-col gap-0.5'>
      <div className='flex items-center justify-between gap-2'>
        {trace.value.map((value, index) => (
          <Fragment key={index}>
            <div className='flex shrink-0 items-center gap-1'>
              <ValueViewComponent view={getValueView(metadataByAssetId, value)} size='sm' />
            </div>

            {index < trace.value.length - 1 && <Separator />}
          </Fragment>
        ))}
      </div>
      {price && <span className='text-xs text-muted-foreground'>{price}</span>}
    </div>
  );
};
