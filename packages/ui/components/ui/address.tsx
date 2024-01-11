import { shortenAddress } from '@penumbra-zone/types';

/**
 * Displays an address. The address is truncated to the prefix plus 24
 * characters, and rendered in color when it is ephemeral.
 */
export const Address = ({
  address,
  ephemeral = false,
}: {
  address: string;
  ephemeral?: boolean;
}) => (
  <span
    className={'font-mono text-[12px]' + (ephemeral ? ' text-[#8D5728]' : ' text-muted-foreground')}
  >
    {shortenAddress(address)}
  </span>
);
