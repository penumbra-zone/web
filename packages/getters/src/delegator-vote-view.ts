import { createGetter } from './utils/create-getter.js';
import {
  DelegatorVoteBody,
  DelegatorVoteView,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/governance/v1/governance_pb.js';

export const getDelegatorVoteBody = createGetter(
  (view?: DelegatorVoteView) => view?.delegatorVote.value?.delegatorVote?.body,
);

const getProposal = createGetter((body?: DelegatorVoteBody) => body?.proposal);
const getStartPosition = createGetter((body?: DelegatorVoteBody) => body?.startPosition);
const getVote = createGetter((body?: DelegatorVoteBody) => body?.vote?.vote);
const getUnbonded = createGetter((body?: DelegatorVoteBody) => body?.unbondedAmount);
