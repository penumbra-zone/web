import { IdentityKey } from '@penumbra-zone/protobuf/penumbra/core/keys/v1/keys_pb';
import { CopyToClipboardIconButton } from './copy-to-clipboard/copy-to-clipboard-icon-button';
import {
  bech32mIdentityKey,
  PENUMBRA_BECH32M_IDENTITYKEY_PREFIX,
} from '@penumbra-zone/bech32m/penumbravalid';
import { useMemo } from 'react';

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
  const sep = PENUMBRA_BECH32M_IDENTITYKEY_PREFIX.length + 1;

  const ik = useMemo(
    () => (identityKey.ik.length ? bech32mIdentityKey(identityKey) : null),
    [identityKey],
  );

  return (
    <div className='flex min-w-0 items-center gap-2'>
      {ik ? (
        <div className='min-w-0 truncate font-mono'>
          <span className='text-muted-foreground'>{ik.slice(0, sep)}</span>
          {ik.slice(sep)}
          <CopyToClipboardIconButton text={ik} />
        </div>
      ) : (
        <div className='min-w-0 truncate font-mono'>
          <span className='text-red-900'>Invalid identity key</span>
        </div>
      )}
    </div>
  );
};
