import { Button } from '@repo/ui/components/ui/button';
import { Card, CardContent } from '@repo/ui/components/ui/card';
import { AccountSwitcher } from '@repo/ui/components/ui/account-switcher';
import { ValueViewComponent } from '@repo/ui/components/ui/value';
import { Stat } from './stat';
import { AllSlices } from '../../../../state';
import { UnbondingTokens } from './unbonding-tokens';
import { useStoreShallow } from '../../../../utils/use-store-shallow';
import { zeroValueView } from '../../../../utils/zero-value-view';
import { useStakingTokenMetadata } from '../../../../state/shared';
import { useStakingTokensAndFilter } from '../use-staking-tokens-and-filter';

const headerSelector = (state: AllSlices) => ({
  account: state.staking.account,
  setAccount: state.staking.setAccount,
  unbondingTokensByAccount: state.staking.unbondingTokensByAccount,
  undelegateClaim: state.staking.undelegateClaim,
});

/**
 * The header of the account view, with an account switcher and balances of
 * various token types related to staking.
 */
export const Header = () => {
  const { account, setAccount, unbondingTokensByAccount, undelegateClaim } =
    useStoreShallow(headerSelector);
  const { accountSwitcherFilter, stakingTokens } = useStakingTokensAndFilter(account);
  const unbondingTokens = unbondingTokensByAccount.get(account);
  const stakingTokenMetadata = useStakingTokenMetadata();

  return (
    <Card gradient>
      <CardContent>
        <div className='flex flex-col gap-2'>
          <AccountSwitcher account={account} onChange={setAccount} filter={accountSwitcherFilter} />

          <div className='flex items-start justify-center gap-8'>
            <Stat label='Available to delegate'>
              {(stakingTokens ?? stakingTokenMetadata.data) && (
                <ValueViewComponent
                  view={stakingTokens ?? zeroValueView(stakingTokenMetadata.data)}
                />
              )}
            </Stat>

            <Stat label='Unbonding amount'>
              <UnbondingTokens
                helpText='Total amount of UM you will receive, assuming no slashing, when you claim your unbonding tokens that are currently still in their unbonding period.'
                tokens={unbondingTokens?.notYetClaimable.tokens}
                total={unbondingTokens?.notYetClaimable.total}
                stakingTokenMetadata={stakingTokenMetadata.data}
              />
            </Stat>

            <Stat label='Claimable amount'>
              <UnbondingTokens
                helpText='Total amount of UM you will receive, assuming no slashing, when you claim your unbonding tokens that are currently eligible for claiming.'
                tokens={unbondingTokens?.claimable.tokens}
                total={unbondingTokens?.claimable.total}
                stakingTokenMetadata={stakingTokenMetadata.data}
              >
                {!!unbondingTokens?.claimable.tokens.length && (
                  <Button
                    className='self-end px-4 text-white'
                    onClick={() => void undelegateClaim()}
                  >
                    Claim now
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
