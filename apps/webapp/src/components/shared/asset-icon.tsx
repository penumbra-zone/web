import { Asset } from '@penumbra-zone/types';
import { IdenticonColor } from '@penumbra-zone/ui';

export const AssetIcon = ({ asset }: { asset: Pick<Asset, 'display' | 'icon'> }) => {
  return (
    <>
      {asset.icon ? (
        <img className='h-6 w-6 rounded-full' src={asset.icon} alt='Asset icon' />
      ) : (
        <IdenticonColor name={asset.display} size={24} className='rounded-full' />
      )}
    </>
  );
};
