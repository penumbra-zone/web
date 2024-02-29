import {
  VotingPowerAsIntegerPercentage,
  bech32IdentityKey,
  getDisplayDenomFromView,
  getIdentityKeyFromValueView,
} from '@penumbra-zone/types';
import { useStore } from '../../../state';
import { stakingSelector } from '../../../state/staking';
import { DelegationValueView } from './delegation-value-view';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@penumbra-zone/ui';
import { ValueView } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import { ValueViewComponent } from '@penumbra-zone/ui/components/ui/tx/view/value';
import { AccountSwitcher } from '@penumbra-zone/ui/components/ui/account-switcher';
import { Stat } from './stat';
import { STAKING_TOKEN_METADATA } from '@penumbra-zone/constants';

const getVotingPowerAsIntegerPercentage = (
  votingPowerByValidatorInfo: Record<string, VotingPowerAsIntegerPercentage>,
  delegation: ValueView,
) => votingPowerByValidatorInfo[bech32IdentityKey(getIdentityKeyFromValueView(delegation))];

/**
 * A default `ValueView` to render when we don't have any balance data for a
 * particular token in the given account.
 */
const zeroBalanceUm = new ValueView({
  valueView: {
    case: 'knownAssetId',
    value: {
      amount: { hi: 0n, lo: 0n },
      metadata: STAKING_TOKEN_METADATA,
    },
  },
});

export const Account = () => {
  const {
    account,
    setAccount,
    delegationsByAccount,
    unstakedTokensByAccount,
    unbondingTokensByAccount,
    votingPowerByValidatorInfo,
  } = useStore(stakingSelector);
  const unstakedTokens = unstakedTokensByAccount.get(account);
  const unbondingTokens = unbondingTokensByAccount.get(account);
  const delegations = delegationsByAccount.get(account) ?? [];

  return (
    <div className='flex flex-col gap-4'>
      <Card gradient>
        <CardContent>
          <div className='flex flex-col gap-2'>
            <AccountSwitcher account={account} onChange={setAccount} />

            <div className='flex justify-center gap-8'>
              <Stat label='Available to delegate'>
                <ValueViewComponent view={unstakedTokens ?? zeroBalanceUm} />
              </Stat>

              <Stat label='Unbonding amount'>
                <div className='flex gap-2'>
                  <ValueViewComponent view={unbondingTokens?.total ?? zeroBalanceUm} />
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>(i)</TooltipTrigger>
                      <TooltipContent>
                        <div className='flex flex-col gap-4'>
                          <div className='max-w-[250px]'>
                            Total amount of UM you will receive when all your unbonding tokens are
                            claimed, assuming no slashing.
                          </div>
                          {unbondingTokens?.tokens.map(token => (
                            <ValueViewComponent key={getDisplayDenomFromView(token)} view={token} />
                          ))}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </Stat>
            </div>
          </div>
        </CardContent>
      </Card>

      {!!delegations.length && (
        <Card>
          <CardHeader>
            <CardTitle>Delegation tokens</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='mt-8 flex flex-col gap-8'>
              {delegations.map(delegation => (
                <DelegationValueView
                  key={bech32IdentityKey(getIdentityKeyFromValueView(delegation))}
                  valueView={delegation}
                  unstakedTokens={unstakedTokens}
                  votingPowerAsIntegerPercentage={getVotingPowerAsIntegerPercentage(
                    votingPowerByValidatorInfo,
                    delegation,
                  )}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
