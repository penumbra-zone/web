import { ValueView } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import { getDisplayDenomFromView } from '@penumbra-zone/getters/src/value-view';
import { getDisplayDenomExponent } from '@penumbra-zone/getters/src/metadata';
import { CopyToClipboardIconButton } from '../../../copy-to-clipboard-icon-button';
import { AssetIcon } from '../asset-icon';
import { Amount } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/num/v1/num_pb';
import { fromBaseUnitAmount } from '@penumbra-zone/types/src/amount';
import { cn } from '../../../../../lib/utils';

interface ValueViewProps {
  view: ValueView | undefined;
  /**
   * When rendering an equivalent value, use the `equivalent` variant to
   * visually distinguish it as an equivalent value.
   */
  equivalent?: boolean;
  className?: string;
  showDenom?: boolean;
  showValue?: boolean;
  showIcon?: boolean;
}

export const ValueViewComponent = ({
  view,
  equivalent = false,
  className,
  showDenom = true,
  showValue = true,
  showIcon = true,
}: ValueViewProps) => {
  switch (view?.valueView.case) {
    case 'knownAssetId': {
      const metadata = view.valueView.value.metadata;
      const amount = view.valueView.value.amount ?? new Amount();
      const exponent = getDisplayDenomExponent(metadata);
      // The regex trims trailing zeros which toFormat adds in
      const formattedAmount = fromBaseUnitAmount(amount, exponent)
        .toFormat(6)
        .replace(/(\.\d*?[1-9])0+$|\.0*$/, '$1');
      // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
      const symbol = metadata?.symbol || 'Unknown Asset';

      // showDenom text-muted-foreground
      return (
        <div
          className={cn(
            'inline-flex min-w-0 max-w-full items-center gap-1 rounded-full px-3 py-1 text-sm',
            equivalent && 'border-[1px] border-dashed',
            className ?? 'bg-light-brown hover:bg-brown border-sand',
          )}
        >
          {showIcon && (
            <div className='-ml-2 mr-1 flex size-6 items-center justify-center rounded-full'>
              <AssetIcon metadata={metadata} />
            </div>
          )}
          {showValue && (
            <span className='leading-[15px]'>
              {equivalent && <>~ </>}
              {formattedAmount}
            </span>
          )}
          {showDenom && <span className={cn('truncate font-mono text-xs')}>{symbol}</span>}
        </div>
      );
    }
    case 'unknownAssetId': {
      const amount = view.valueView.value?.amount ?? new Amount();
      const encodedAssetId = getDisplayDenomFromView(view);
      return (
        <div className='flex font-mono'>
          <p className='truncate text-[15px] leading-[22px]'>
            {fromBaseUnitAmount(amount, 0).toFormat()}
          </p>
          <span className='truncate font-mono text-sm italic text-foreground'>
            {encodedAssetId}
          </span>
          <CopyToClipboardIconButton text={encodedAssetId} />
        </div>
      );
    }
    default:
      return null;
  }
};
