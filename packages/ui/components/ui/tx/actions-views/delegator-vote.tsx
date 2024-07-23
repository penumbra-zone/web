import { ViewBox } from '../viewbox';
import { ValueWithAddress } from './value-with-address';
import { ValueViewComponent } from '../../value';
import { getAddress } from '@penumbra-zone/getters/note-view';
import { ActionDetails } from './action-details';
import {
  DelegatorVoteBody,
  DelegatorVoteView,
  Vote,
  Vote_Vote,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/governance/v1/governance_pb';
import { joinLoHiAmount } from '@penumbra-zone/types/amount';
import { getDelegatorVoteBody } from '@penumbra-zone/getters/delegator-vote-view';
import { bech32mAssetId } from '@penumbra-zone/bech32m/passet';

export const DelegatorVoteComponent = ({ value }: { value: DelegatorVoteView }) => {
  const body = getDelegatorVoteBody.optional()(value);

  if (value.delegatorVote.case === 'visible') {
    const note = value.delegatorVote.value.note;
    const address = getAddress.optional()(note);

    return (
      <ViewBox
        label='Delegator Vote'
        visibleContent={
          <>
            <ValueWithAddress addressView={address} label='from'>
              <ValueViewComponent view={note?.value} />
            </ValueWithAddress>
            <VoteBodyDetails body={body} />
          </>
        }
      />
    );
  }

  if (value.delegatorVote.case === 'opaque') {
    return (
      <ViewBox
        label='Delegator Vote'
        isOpaque={true}
        visibleContent={<VoteBodyDetails body={body} />}
      />
    );
  }

  return <div>Invalid DelegatorVoteView</div>;
};

const VoteToString = (vote: Vote): string => {
  switch (vote.vote) {
    case Vote_Vote.UNSPECIFIED:
      return 'UNSPECIFIED';
    case Vote_Vote.ABSTAIN:
      return 'ABSTAIN';
    case Vote_Vote.YES:
      return 'YES';
    case Vote_Vote.NO:
      return 'NO';
  }
};

const VoteBodyDetails = ({ body }: { body?: DelegatorVoteBody }) => {
  return (
    <ActionDetails>
      {!!body?.proposal && (
        <ActionDetails.Row label='Proposal'>{Number(body.proposal)}</ActionDetails.Row>
      )}

      {!!body?.startPosition && (
        <ActionDetails.Row label='Start Position'>{Number(body.startPosition)}</ActionDetails.Row>
      )}

      {!!body?.vote && (
        <ActionDetails.Row label='Vote'>{VoteToString(body.vote)}</ActionDetails.Row>
      )}

      {!!body?.value && (
        <>
          {body.value.assetId && (
            <ActionDetails.Row label='Asset id'>
              {bech32mAssetId({ inner: body.value.assetId.inner })}
            </ActionDetails.Row>
          )}
          {body.value.amount && (
            <ActionDetails.Row label='Amount'>
              {joinLoHiAmount(body.value.amount).toString()}
            </ActionDetails.Row>
          )}
        </>
      )}

      {!!body?.unbondedAmount && (
        <ActionDetails.Row label='Unbonded Amount'>
          {joinLoHiAmount(body.unbondedAmount).toString()}
        </ActionDetails.Row>
      )}
    </ActionDetails>
  );
};
