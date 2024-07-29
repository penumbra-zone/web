import { asOpaqueDelegatorVoteView } from './delegator-vote-view.js';
import { describe, expect, test } from 'vitest';
import {
  DelegatorVote,
  DelegatorVoteView,
  DelegatorVoteView_Opaque,
  DelegatorVoteView_Visible,
  NoteView,
  ValueView,
} from '@penumbra-zone/protobuf/types';

describe('asOpaqueDelegatorVoteView', () => {
  test('when passed `undefined` returns an empty, opaque delegator vote view', () => {
    const expected = new DelegatorVoteView({
      delegatorVote: {
        case: 'opaque',
        value: new DelegatorVoteView_Opaque({
          delegatorVote: undefined,
        }),
      },
    });

    expect(asOpaqueDelegatorVoteView(undefined)).toEqual(expected);
  });

  test('when passed an already-opaque delegator vote view returns the delegator vote view as-is', () => {
    const opaqueDelegatorVoteView = new DelegatorVoteView({
      delegatorVote: {
        case: 'opaque',
        value: new DelegatorVoteView_Opaque({
          delegatorVote: new DelegatorVote({ body: { proposal: 123n } }),
        }),
      },
    });
    expect(
      asOpaqueDelegatorVoteView(opaqueDelegatorVoteView).equals(opaqueDelegatorVoteView),
    ).toBeTruthy();
  });

  test('returns an opaque version of the delegator vote view', () => {
    const visibleDelegatorVoteView = new DelegatorVoteView({
      delegatorVote: {
        case: 'visible',
        value: new DelegatorVoteView_Visible({
          delegatorVote: new DelegatorVote({ body: { proposal: 123n } }),
          note: new NoteView({ value: new ValueView() }),
        }),
      },
    });

    const result = asOpaqueDelegatorVoteView(visibleDelegatorVoteView);

    expect(result.delegatorVote.case).toBe('opaque');
    expect(
      result.delegatorVote.value?.delegatorVote?.equals(
        visibleDelegatorVoteView.delegatorVote.value?.delegatorVote,
      ),
    ).toBeTruthy();
  });
});
