import { IdentityKey } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1/keys_pb';
import { CopyToClipboardIconButton } from './copy-to-clipboard-icon-button';
import { bech32IdentityKey } from '@penumbra-zone/types';

/**
 * Renders an `IdentityKey` for a validator, along with a copy button.
 */
export const IdentityKeyComponent = ({ identityKey }: { identityKey: IdentityKey }) => {
  return (
    <div className='flex min-w-0 items-center gap-2'>
      <div className='min-w-0 truncate font-mono text-muted-foreground'>
        {bech32IdentityKey(identityKey)}
      </div>

      <CopyToClipboardIconButton text={bech32IdentityKey(identityKey)} />
    </div>
  );
};
