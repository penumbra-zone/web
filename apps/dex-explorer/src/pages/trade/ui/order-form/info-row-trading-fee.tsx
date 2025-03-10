import { InfoRow } from './info-row';

export const InfoRowTradingFee = () => {
  return (
    <InfoRow
      label='Trading Fee'
      value='Free'
      valueColor='success'
      toolTip='Penumbra has no platform trading fee. LPs set their own fees, which are included in the quoted price.'
    />
  );
};
