import { InfoRow } from './info-row';

export const InfoRowGasFee = ({
  gasFee,
  symbol,
  isLoading,
}: {
  gasFee: string;
  symbol: string;
  isLoading: boolean;
}) => {
  return (
    <InfoRow
      label='Gas Fee'
      isLoading={isLoading}
      value={`${gasFee} ${symbol}`}
      toolTip='The gas cost of the transaction. Gas fees are burned as part of transaction processing.'
    />
  );
};
