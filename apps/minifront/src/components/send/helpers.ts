import { Validation } from '../shared/validation-result';
import { isPenumbraAddr } from '@penumbra-zone/bech32/address';

export const penumbraAddrValidation = (): Validation => {
  return {
    type: 'error',
    issue: 'invalid address',
    checkFn: (addr: string) => Boolean(addr) && !isPenumbraAddr(addr),
  };
};
