import { ViewBox } from '../viewbox';
import { ValueViewComponent } from '@penumbra-zone/ui/ValueView';
import { getAddress } from '@penumbra-zone/getters/note-view';
import { ActionDetails } from './action-details';
import {
  DelegatorVoteBody,
  DelegatorVoteView,
  Vote,
  Vote_Vote,
} from '@penumbra-zone/protobuf/penumbra/core/component/governance/v1/governance_pb';
import { getDelegatorVoteBody } from '@penumbra-zone/getters/delegator-vote-view';
import { Amount } from '@penumbra-zone/protobuf/penumbra/core/num/v1/num_pb';
import { Metadata, ValueView } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { AddressViewComponent } from '@penumbra-zone/ui/AddressView';
import { base64ToUint8Array } from '@penumbra-zone/types/base64';

// TODO: This is sad, but at the moment, we aren't provided the metadata to have a rich display.
//       Given the high-priority of getting action view support, this is added.
//       We should properly implement ValueViews into the protos for DelegatorVote action view and delete this code.
const umMetadata = new Metadata({
  denomUnits: [
    {
      denom: 'penumbra',
      exponent: 6,
    },
    {
      denom: 'upenumbra',
      exponent: 0,
    },
  ],
  base: 'upenumbra',
  display: 'penumbra',
  symbol: 'UM',
  penumbraAssetId: {
    inner: base64ToUint8Array('KeqcLzNx9qSH5+lcJHBB9KNW+YPrBk5dKzvPMiypahA='),
  },
  images: [
    {
      svg: 'https://raw.githubusercontent.com/prax-wallet/registry/main/images/um.svg',
    },
  ],
});

const umValueView = (amount?: Amount) => {
  return new ValueView({
    valueView: {
      case: 'knownAssetId',
      value: {
        amount,
        metadata: umMetadata,
      },
    },
  });
};

export const DelegatorVoteComponent = ({ value }: { value: DelegatorVoteView }) => {
  const body = getDelegatorVoteBody.optional(value);

  if (value.delegatorVote.case === 'visible') {
    const note = value.delegatorVote.value.note;
    const address = getAddress.optional(note);

    return (
      <ViewBox
        label='Delegator Vote'
        visibleContent={
          <ActionDetails>
            <VoteBodyDetails body={body} />
            <ActionDetails.Row label='Account'>
              <AddressViewComponent addressView={address} />
            </ActionDetails.Row>
          </ActionDetails>
        }
      />
    );
  }

  if (value.delegatorVote.case === 'opaque') {
    return (
      <ViewBox
        label='Delegator Vote'
        visibleContent={
          <ActionDetails>
            <VoteBodyDetails body={body} />
          </ActionDetails>
        }
      />
    );
  }

  return <div>Invalid DelegatorVoteView</div>;
};

export const VoteToString = (vote: Vote): string => {
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
    <>
      {!!body?.proposal && (
        <ActionDetails.Row label='Proposal'>{Number(body.proposal)}</ActionDetails.Row>
      )}

      {!!body?.vote && (
        <ActionDetails.Row label='Vote'>{VoteToString(body.vote)}</ActionDetails.Row>
      )}
      {!!body?.unbondedAmount && (
        <ActionDetails.Row label='Voting power'>
          <ValueViewComponent valueView={umValueView(body.unbondedAmount)} />
        </ActionDetails.Row>
      )}
    </>
  );
};
