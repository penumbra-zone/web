import { asOpaqueDelegatorVoteView } from './delegator-vote-view.js';
import { create, equals } from '@bufbuild/protobuf';
import { describe, expect, test } from 'vitest';

import {
  DelegatorVoteSchema,
  DelegatorVoteViewSchema,
  DelegatorVoteView_OpaqueSchema,
  DelegatorVoteView_VisibleSchema,
} from '@penumbra-zone/protobuf/penumbra/core/component/governance/v1/governance_pb';

import { NoteViewSchema } from '@penumbra-zone/protobuf/penumbra/core/component/shielded_pool/v1/shielded_pool_pb';
import { ValueViewSchema } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';

describe('asOpaqueDelegatorVoteView', () => {
  test('when passed `undefined` returns an empty, opaque delegator vote view', () => {
    const expected = create(DelegatorVoteViewSchema, {
      delegatorVote: {
        case: 'opaque',
        value: create(DelegatorVoteView_OpaqueSchema, {
          delegatorVote: undefined,
        }),
      },
    });

    expect(asOpaqueDelegatorVoteView(undefined)).toEqual(expected);
  });

  test('when passed an already-opaque delegator vote view returns the delegator vote view as-is', () => {
    const opaqueDelegatorVoteView = create(DelegatorVoteViewSchema, {
      delegatorVote: {
        case: 'opaque',
        value: create(DelegatorVoteView_OpaqueSchema, {
          delegatorVote: create(DelegatorVoteSchema, { body: { proposal: 123n } }),
        }),
      },
    });
    expect(
      equals(
        DelegatorVoteViewSchema,
        opaqueDelegatorVoteView,
        asOpaqueDelegatorVoteView(opaqueDelegatorVoteView),
      ),
    ).toBeTruthy();
  });

  test('returns an opaque version of the delegator vote view', () => {
    const visibleDelegatorVoteView = create(DelegatorVoteViewSchema, {
      delegatorVote: {
        case: 'visible',
        value: create(DelegatorVoteView_VisibleSchema, {
          delegatorVote: create(DelegatorVoteSchema, { body: { proposal: 123n } }),
          note: create(NoteViewSchema, { value: create(ValueViewSchema) }),
        }),
      },
    });

    const result = asOpaqueDelegatorVoteView(visibleDelegatorVoteView);

    expect(result.delegatorVote.case).toBe('opaque');
    expect(
      result.delegatorVote.value?.delegatorVote &&
        visibleDelegatorVoteView.delegatorVote.value?.delegatorVote &&
        equals(
          DelegatorVoteSchema,
          visibleDelegatorVoteView.delegatorVote.value.delegatorVote,
          result.delegatorVote.value.delegatorVote,
        ),
    ).toBeTruthy();
  });
});
