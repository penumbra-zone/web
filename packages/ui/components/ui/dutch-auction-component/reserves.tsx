import {
  Metadata,
  ValueView,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import { ValueViewComponent } from '../tx/view/value';
import { DutchAuction } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/auction/v1/auction_pb';
import { Amount } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/num/v1/num_pb';
import { ActionDetails } from '../tx/view/action-details';

const getValueView = (amount: Amount, metadata?: Metadata) =>
  new ValueView({
    valueView: {
      case: 'knownAssetId',
      value: {
        amount,
        metadata,
      },
    },
  });

export const Reserves = ({
  dutchAuction,
  inputMetadata,
  outputMetadata,
}: {
  dutchAuction: DutchAuction;
  inputMetadata?: Metadata;
  outputMetadata?: Metadata;
}) => {
  const inputAmount = dutchAuction.state?.inputReserves;
  const outputAmount = dutchAuction.state?.outputReserves;

  if (!inputAmount && !outputAmount) return null;

  return (
    <ActionDetails.Row label='Current reserves'>
      <div className='flex flex-col items-end gap-2'>
        {inputAmount && <ValueViewComponent view={getValueView(inputAmount, inputMetadata)} />}
        {outputAmount && <ValueViewComponent view={getValueView(outputAmount, outputMetadata)} />}
      </div>
    </ActionDetails.Row>
  );
};
