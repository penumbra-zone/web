import { createGetter } from './utils/create-getter.js';
import { DelegatorVoteView } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/governance/v1/governance_pb.js';

export const getDelegatorVoteBody = createGetter(
  (view?: DelegatorVoteView) => view?.delegatorVote.value?.delegatorVote?.body,
);
