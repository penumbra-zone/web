import { Metadata } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import { Identicon } from '../identicon';

export const AssetIcon = ({ metadata }: { metadata?: Metadata }) => {
  // Image default is "" and thus cannot do nullish-coalescing
  // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
  const icon = metadata?.images[0]?.png || metadata?.images[0]?.svg;
  return (
    <>
      {icon ? (
        <img className='size-6 rounded-full' src={icon} alt='Asset icon' />
      ) : (
        <Identicon
          uniqueIdentifier={metadata?.symbol ?? '?'}
          size={24}
          className='rounded-full'
          type='solid'
        />
      )}
    </>
  );
};
