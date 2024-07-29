import { createGetter } from './utils/create-getter.js';
import { DelegatorVoteView } from '@penumbra-zone/protobuf/types';

export const getDelegatorVoteBody = createGetter(
  (view?: DelegatorVoteView) => view?.delegatorVote.value?.delegatorVote?.body,
);
