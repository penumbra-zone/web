import { ViewBox } from '../viewbox';
import { ActionDetails } from './action-details';
import { ValidatorVote } from '@penumbra-zone/protobuf/penumbra/core/component/governance/v1/governance_pb';
import { VoteToString } from './delegator-vote.tsx';
import { bech32mIdentityKey } from '@penumbra-zone/bech32m/penumbravalid';
import { bech32mGovernanceId } from '@penumbra-zone/bech32m/penumbragovern';

export const ValidatorVoteComponent = ({ value }: { value: ValidatorVote }) => {
  return (
    <ViewBox
      label='Validator Vote'
      visibleContent={
        <ActionDetails>
          {!!value.body?.proposal && (
            <ActionDetails.Row label='Proposal'>{Number(value.body.proposal)}</ActionDetails.Row>
          )}

          {!!value.body?.vote && (
            <ActionDetails.Row label='Vote'>{VoteToString(value.body.vote)}</ActionDetails.Row>
          )}

          {!!value.body?.reason?.reason && (
            <ActionDetails.Row label='Reason'>{value.body.reason.reason}</ActionDetails.Row>
          )}

          {!!value.body?.identityKey && (
            <ActionDetails.Row label='Identity key'>
              {bech32mIdentityKey(value.body.identityKey)}
            </ActionDetails.Row>
          )}

          {!!value.body?.governanceKey && (
            <ActionDetails.Row label='Governance key'>
              {bech32mGovernanceId(value.body.governanceKey)}
            </ActionDetails.Row>
          )}
        </ActionDetails>
      }
    />
  );
};
