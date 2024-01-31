import { localAssets } from '@penumbra-zone/constants';
import { Identicon } from '@penumbra-zone/ui';
import { useMemo } from 'react';

export const AssetIcon = ({ name }: { name: string }) => {
  const icon = useMemo(() => {
    return localAssets.find(i => i.display === name)?.images[0]?.png;
  }, [name]);

  return (
    <>
      {icon ? (
        <img className='size-6 rounded-full' src={icon} alt='Asset icon' />
      ) : (
        <Identicon name={name} size={24} className='rounded-full' type='solid' />
      )}
    </>
  );
};
