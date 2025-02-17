import { ViewBox } from '../viewbox';
import { ValueViewComponent } from '../../value';
import { ActionLiquidityTournamentVoteView } from '@penumbra-zone/protobuf/penumbra/core/component/funding/v1/funding_pb';
import { ActionDetails } from './action-details';

export const LiquidityTournamentVoteComponent = ({
  value,
}: {
  value: ActionLiquidityTournamentVoteView;
}) => {
  if (value.liquidityTournamentVote.case === 'visible') {
    return (
      <ViewBox
        label='Liquidity Tournament Vote'
        visibleContent={
          <ActionDetails>
            {value.liquidityTournamentVote.value.vote && (
              <ActionDetails.Row label='Liquidity Tournament Vote'>
                <ValueViewComponent view={value.liquidityTournamentVote.value.note?.value} />
              </ActionDetails.Row>
            )}
            {value.liquidityTournamentVote.value.vote?.body?.incentivized && (
              <ActionDetails.Row label='Voted Asset'>
                {value.liquidityTournamentVote.value.vote?.body?.incentivized.denom}
              </ActionDetails.Row>
            )}
          </ActionDetails>
        }
      />
    );
  }

  if (value.liquidityTournamentVote.case === 'opaque') {
    return <ViewBox label='Liquidity Tournament Vote' />;
  }

  return <div>Invalid SpendView</div>;
};
