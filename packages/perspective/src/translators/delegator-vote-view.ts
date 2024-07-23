import { Translator } from './types.js';
import {
  DelegatorVoteView,
  DelegatorVoteView_Opaque,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/governance/v1/governance_pb.js';

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
