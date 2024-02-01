import { localAssets } from '@penumbra-zone/constants';
import { Identicon } from '@penumbra-zone/ui';
import { useMemo } from 'react';
import { Metadata } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1alpha1/asset_pb';

export const AssetIcon = ({ metadata }: { metadata: Metadata }) => {
  const icon = useMemo(() => {
    const assetImage = localAssets.find(d => d.display === metadata.display)?.images[0];
    // Image default is "" and thus cannot do nullish-coalescing
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    return assetImage?.png || assetImage?.svg;
  }, [metadata]);

  return (
    <>
      {icon ? (
        <img className='size-6 rounded-full' src={icon} alt='Asset icon' />
      ) : (
        <Identicon
          uniqueIdentifier={metadata.display}
          size={24}
          className='rounded-full'
          type='solid'
        />
      )}
    </>
  );
};
