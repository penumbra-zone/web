import { Identicon } from '@penumbra-zone/ui';

export const AssetIcon = ({ name }: { name: string }) => {
  return (
    <>
      <Identicon name={name} size={24} className='rounded-full' type='solid' />
    </>
  );
};
