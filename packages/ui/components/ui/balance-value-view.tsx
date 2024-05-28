import { ValueView } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import { WalletIcon } from 'lucide-react';
import { ValueViewComponent } from './tx/view/value';

/**
 * Renders a `ValueView` as a balance with a wallet icon.
 */
export const BalanceValueView = ({ valueView }: { valueView: ValueView }) => {
  return (
    <div className='flex items-start gap-1 truncate'>
      <WalletIcon className='size-5' />
      <ValueViewComponent view={valueView} showIcon={false} />
    </div>
  );
};
