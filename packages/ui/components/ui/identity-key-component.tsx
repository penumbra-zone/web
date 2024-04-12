import { IdentityKey } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1/keys_pb';
import { CopyToClipboardIconButton } from './copy-to-clipboard-icon-button';
import { bech32IdentityKey } from '@penumbra-zone/bech32/src/identity-key';
import { PENUMBRA_BECH32_IDENTITY_PREFIX } from '@penumbra-zone/bech32/src/penumbra-bech32';

const PREFIX_AND_SEPARATOR = PENUMBRA_BECH32_IDENTITY_PREFIX + '1';

/**
 * Renders a validator's `IdentityKey` as a bech32-encoded string, along with a
 * copy button.
 *
 * @example
 * ```tsx
 * <IdentityKeyComponent identityKey={validator.identityKey} />
 * ```
 */
export const IdentityKeyComponent = ({ identityKey }: { identityKey: IdentityKey }) => {
  return (
    <div className='flex min-w-0 items-center gap-2'>
      <div className='min-w-0 truncate font-mono'>
        <span className='text-muted-foreground'>{PREFIX_AND_SEPARATOR}</span>

        {bech32IdentityKey(identityKey).replace(PREFIX_AND_SEPARATOR, '')}
      </div>

      <CopyToClipboardIconButton text={bech32IdentityKey(identityKey)} />
    </div>
  );
};
