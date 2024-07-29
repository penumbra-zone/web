import { Translator } from './types.js';
import { DelegatorVoteView, DelegatorVoteView_Opaque } from '@penumbra-zone/protobuf/types';

export const asOpaqueDelegatorVoteView: Translator<DelegatorVoteView> = delegatorVoteView => {
  if (delegatorVoteView?.delegatorVote.case === 'opaque') {
    return delegatorVoteView;
  }

  return new DelegatorVoteView({
    delegatorVote: {
      case: 'opaque',
      value: new DelegatorVoteView_Opaque({
        delegatorVote: delegatorVoteView?.delegatorVote.value?.delegatorVote,
      }),
    },
  });
};
