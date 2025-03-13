import { Translator } from './types.js';
import { create } from '@bufbuild/protobuf';
import {
  DelegatorVoteViewSchema,
  DelegatorVoteView_OpaqueSchema,
} from '@penumbra-zone/protobuf/penumbra/core/component/governance/v1/governance_pb';
import type { DelegatorVoteView } from '@penumbra-zone/protobuf/penumbra/core/component/governance/v1/governance_pb';

export const asOpaqueDelegatorVoteView: Translator<DelegatorVoteView> = delegatorVoteView => {
  if (delegatorVoteView?.delegatorVote.case === 'opaque') {
    return delegatorVoteView;
  }

  return create(DelegatorVoteViewSchema, {
    delegatorVote: {
      case: 'opaque',
      value: create(DelegatorVoteView_OpaqueSchema, {
        delegatorVote: delegatorVoteView?.delegatorVote.value?.delegatorVote,
      }),
    },
  });
};
