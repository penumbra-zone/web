import { useMemo } from 'react';
import { ActionLiquidityTournamentVoteView } from '@penumbra-zone/protobuf/penumbra/core/component/funding/v1/funding_pb';
import { ValueView } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { AddressView } from '@penumbra-zone/protobuf/penumbra/core/keys/v1/keys_pb';
import { ActionWrapper } from '../shared/wrapper';
import { ActionViewBaseProps } from '../types';
import { ValueViewComponent } from '../../ValueView';
import { AddressViewComponent } from '../../AddressView';
import { Density } from '../../Density';
import { ActionRow } from '../shared/action-row';

export interface LiquidityTournamentVoteActionProps extends ActionViewBaseProps {
  value: ActionLiquidityTournamentVoteView;
}

export const LiquidityTournamentVoteAction = ({
  value,
  getMetadata,
}: LiquidityTournamentVoteActionProps) => {
  const vote = value.liquidityTournamentVote.value?.vote;

  const voteAsset = useMemo(() => {
    const incentivized = vote?.body?.incentivized;
    const metadata = incentivized && getMetadata?.(incentivized);
    if (!metadata) {
      return undefined;
    }

    return new ValueView({
      valueView: {
        case: 'knownAssetId',
        value: {
          metadata,
          amount: { lo: 0n, hi: 0n },
        },
      },
    });
  }, [vote, getMetadata]);

  const voteValue = useMemo(() => {
    const value = vote?.body?.value;

    if (!value) {
      return undefined;
    }

    const metadata = value.assetId && getMetadata?.(value.assetId);
    if (!metadata) {
      return new ValueView({
        valueView: {
          case: 'unknownAssetId',
          value: {
            amount: value.amount,
            assetId: value.assetId,
          },
        },
      });
    }

    return new ValueView({
      valueView: {
        case: 'knownAssetId',
        value: {
          metadata,
          amount: value.amount,
        },
      },
    });
  }, [vote, getMetadata]);

  const address = useMemo(() => {
    const receipient = vote?.body?.rewardsRecipient;
    const defaultAddress = new AddressView({
      addressView: {
        case: 'opaque',
        value: {
          address: receipient,
        },
      },
    });

    if (value.liquidityTournamentVote.case === 'visible') {
      return value.liquidityTournamentVote.value.note?.address ?? defaultAddress;
    }

    return defaultAddress;
  }, [value, vote]);

  const epoch = useMemo(() => {
    return vote?.body?.startPosition;
  }, [vote]);

  return (
    <ActionWrapper
      title='Liquidity Tournament Vote'
      opaque={value.liquidityTournamentVote.case === 'opaque'}
      infoRows={[
        !!epoch && <ActionRow label='Epoch' info={`#${epoch.toString()}`} />,
        !!voteValue && (
          <ActionRow
            label='Voting Power'
            info={
              <Density slim>
                <ValueViewComponent showIcon={false} valueView={voteValue} priority='tertiary' />
              </Density>
            }
          />
        ),
      ]}
    >
      <Density slim>
        {voteAsset && (
          <div className='flex items-center [&>span]:pr-2'>
            <ValueViewComponent valueView={voteAsset} showValue={false} />
          </div>
        )}
        <AddressViewComponent addressView={address} truncate />
      </Density>
    </ActionWrapper>
  );
};
