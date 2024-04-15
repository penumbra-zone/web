import type { Action } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1/transaction_pb';

const actionKeys: Partial<Record<Exclude<Action['action']['case'], undefined>, URL>> = {
  delegatorVote: new URL('../keys/delegator_vote_pk.bin', import.meta.url),
  output: new URL('../keys/output_pk.bin', import.meta.url),
  spend: new URL('../keys/spend_pk.bin', import.meta.url),
  swap: new URL('../keys/swap_pk.bin', import.meta.url),
  swapClaim: new URL('../keys/swapclaim_pk.bin', import.meta.url),
  undelegateClaim: new URL('../keys/convert_pk.bin', import.meta.url),
};

export default actionKeys;
