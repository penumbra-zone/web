import { Metadata } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import { SwapExecution_Trace } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/dex/v1/dex_pb';
import { bech32mAssetId } from '@penumbra-zone/bech32m/passet';
import { getDisplayDenomExponent } from '@penumbra-zone/getters/metadata';
import { formatAmount } from '@penumbra-zone/types/amount';
import { BigNumber } from 'bignumber.js';

export const Price = ({
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

  if (!price) return null;
  return <span className='text-xs text-muted-foreground'>{price}</span>;
};
