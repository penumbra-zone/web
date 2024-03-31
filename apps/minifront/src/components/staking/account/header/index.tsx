import { Button } from '@penumbra-zone/ui/components/ui/button';
import { Card, CardContent } from '@penumbra-zone/ui/components/ui/card';
import { AccountSwitcher } from '@penumbra-zone/ui/components/ui/account-switcher';
import { ValueViewComponent } from '@penumbra-zone/ui/components/ui/tx/view/value';
import { Stat } from './stat';
import { ValueView } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import { STAKING_TOKEN_METADATA } from '@penumbra-zone/constants/src/assets';
import { accountsSelector, stakingSelector } from '../../../../state/staking';
import { useStore } from '../../../../state';
import { UnbondingTokens } from './unbonding-tokens';

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

/**
 * The header of the account view, with an account switcher and balances of
 * various token types related to staking.
 */
export const Header = () => {
  const {
    account,
    setAccount,
    unstakedTokensByAccount,
    unbondingTokensByAccount,
    undelegateClaim,
  } = useStore(stakingSelector);
  const unstakedTokens = unstakedTokensByAccount.get(account);
  const unbondingTokens = unbondingTokensByAccount.get(account);
  const accountSwitcherFilter = useStore(accountsSelector);

  return (
    <Card gradient>
      <CardContent>
        <div className='flex flex-col gap-2'>
          <AccountSwitcher account={account} onChange={setAccount} filter={accountSwitcherFilter} />

          <div className='flex items-start justify-center gap-8'>
            <Stat label='Available to delegate'>
              <ValueViewComponent view={unstakedTokens ?? zeroBalanceUm} />
            </Stat>

            <Stat label='Unbonding amount'>
              <UnbondingTokens
                tokens={unbondingTokens?.notYetClaimable.tokens}
                total={unbondingTokens?.notYetClaimable.total}
              />
            </Stat>

            <Stat label='Claimable amount'>
              <UnbondingTokens
                tokens={unbondingTokens?.claimable.tokens}
                total={unbondingTokens?.claimable.total}
              >
                {!!unbondingTokens?.claimable.tokens.length && (
                  <Button
                    className='self-end px-4 text-white'
                    onClick={() => void undelegateClaim()}
                  >
                    Claim
                  </Button>
                )}
              </UnbondingTokens>
            </Stat>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
