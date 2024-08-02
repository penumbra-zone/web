import { createGetter } from './utils/create-getter.js';
import { DelegatorVoteView } from '@penumbra-zone/protobuf/penumbra/core/component/governance/v1/governance_pb';

export const getDelegatorVoteBody = createGetter(
  (view?: DelegatorVoteView) => view?.delegatorVote.value?.delegatorVote?.body,
);
