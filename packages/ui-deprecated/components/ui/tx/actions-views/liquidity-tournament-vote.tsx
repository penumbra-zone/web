import { ViewBox } from '../viewbox';
import { ValueViewComponent } from '../../value';
import { ActionLiquidityTournamentVoteView } from '@penumbra-zone/protobuf/penumbra/core/component/funding/v1/funding_pb';
import { ActionDetails } from './action-details';
import { ValueView } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { ValueWithAddress } from './value-with-address';
import { getAddress } from '@penumbra-zone/getters/note-view';

let globalValueView: ValueView | undefined;

export const LiquidityTournamentVoteComponent = ({
  value,
}: {
  value: ActionLiquidityTournamentVoteView;
}) => {
  if (value.liquidityTournamentVote.case === 'visible') {
    globalValueView = value.liquidityTournamentVote.value.note?.value;
    const address = getAddress(value.liquidityTournamentVote.value.note);

    // Note: LQT action view is currently implemented in the deprecated-ui library
    // for testng purposes, and the actual implementation will display all the relevant
    // fields that are lacking here.
    return (
      <ViewBox
        label='Liquidity Tournament Vote'
        visibleContent={
          <ActionDetails>
            <ValueWithAddress addressView={address} label='from'>
              <ValueViewComponent view={value.liquidityTournamentVote.value.note?.value} />
            </ValueWithAddress>
            {value.liquidityTournamentVote.value.vote && (
              <ActionDetails.Row label='Liquidity Tournament Vote'>
                <ValueViewComponent view={globalValueView} />
              </ActionDetails.Row>
            )}
            {value.liquidityTournamentVote.value.vote?.body?.incentivized && (
              <ActionDetails.Row label='Voted Asset'>
                {value.liquidityTournamentVote.value.vote.body.incentivized.denom}
              </ActionDetails.Row>
            )}
          </ActionDetails>
        }
      />
    );
  }

  if (value.liquidityTournamentVote.case === 'opaque') {
    return (
      <ViewBox
        label='Liquidity Tournament Vote'
        visibleContent={
          <ActionDetails>
            {
              <ActionDetails.Row label='Liquidity Tournament Vote'>
                <ValueViewComponent view={globalValueView} />
              </ActionDetails.Row>
            }
            {value.liquidityTournamentVote.value.vote?.body?.incentivized && (
              <ActionDetails.Row label='Voted Asset'>
                {value.liquidityTournamentVote.value.vote.body.incentivized.denom}
              </ActionDetails.Row>
            )}
          </ActionDetails>
        }
      />
    );
  }

  return <div>Invalid ActionLiquidityTournamentVoteView</div>;
};
