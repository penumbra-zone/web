import { isPenumbraAddr } from '@penumbra-zone/types';
import { Validation } from '../shared/validation-result';

export const penumbraAddrValidation = (): Validation => {
  return {
    type: 'error',
    issue: 'invalid address',
    checkFn: (addr: string) => Boolean(addr) && !isPenumbraAddr(addr),
  };
};
