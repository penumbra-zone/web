import { Identicon } from './identicon';

/**
 * A simple component to display a consistently styled icon for a given address.
 */
export const AddressIcon = ({ address, size }: { address: string; size: number }) => (
  <Identicon name={address} size={size} className='rounded-full' type='gradient' />
);
