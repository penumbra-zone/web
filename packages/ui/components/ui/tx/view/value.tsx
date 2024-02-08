import { ValueView } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import {
  fromBaseUnitAmount,
  getDisplayDenomExponent,
  getDisplayDenomFromView,
} from '@penumbra-zone/types';
import { CopyToClipboard } from '../../copy-to-clipboard';
import { CopyIcon } from '@radix-ui/react-icons';
import { Amount } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/num/v1/num_pb';

interface ValueViewProps {
  view: ValueView | undefined;
  showDenom?: boolean;
}

export const ValueViewComponent = ({ view, showDenom = true }: ValueViewProps) => {
  if (!view) return <></>;

  if (view.valueView.case === 'unknownAssetId') {
    const value = view.valueView.value;
    const amount = value.amount ?? new Amount();
    const encodedAssetId = getDisplayDenomFromView(view);
    return (
      <div className='flex font-mono'>
        <p className='truncate text-[15px] leading-[22px]'>
          {fromBaseUnitAmount(amount, 0).toFormat()}
        </p>
        <span className='truncate font-mono text-sm italic text-foreground'>{encodedAssetId}</span>
        <CopyToClipboard
          text={encodedAssetId}
          label={
            <div>
              <CopyIcon className='size-4 text-muted-foreground hover:opacity-50' />
            </div>
          }
          className='w-4 px-4'
        />
      </div>
    );
  }

  if (view.valueView.case === 'knownAssetId') {
    const value = view.valueView.value;
    const amount = value.amount ?? new Amount();
    const displayDenom = getDisplayDenomFromView(view);
    const exponent = value.metadata ? getDisplayDenomExponent(value.metadata) : 0;

    return (
      <div className='flex truncate font-mono'>
        {fromBaseUnitAmount(amount, exponent).toFormat()} {showDenom && displayDenom}
      </div>
    );
  }

  return <></>;
};
