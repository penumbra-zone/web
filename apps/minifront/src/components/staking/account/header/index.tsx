import { Button } from '@penumbra-zone/ui/components/ui/button';
import { Card, CardContent } from '@penumbra-zone/ui/components/ui/card';
import { AccountSwitcher } from '@penumbra-zone/ui/components/ui/account-switcher';
import { ValueViewComponent } from '@penumbra-zone/ui/components/ui/tx/view/value';
import { Stat } from './stat';
import { ValueView } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import { STAKING_TOKEN_METADATA } from '@penumbra-zone/constants/src/assets';
import { AllSlices } from '../../../../state';
import { UnbondingTokens } from './unbonding-tokens';
import { useStoreShallow } from '../../../../utils/use-store-shallow';

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

const headerSelector = (state: AllSlices) => ({
  account: state.staking.account,
  setAccount: state.staking.setAccount,
  accountSwitcherFilter: state.staking.accountSwitcherFilter,
  unstakedTokensByAccount: state.staking.unstakedTokensByAccount,
  unbondingTokensByAccount: state.staking.unbondingTokensByAccount,
  undelegateClaim: state.staking.undelegateClaim,
});

/**
 * The header of the account view, with an account switcher and balances of
 * various token types related to staking.
 */
export const Header = () => {
  const {
    account,
    setAccount,
    accountSwitcherFilter,
    unstakedTokensByAccount,
    unbondingTokensByAccount,
    undelegateClaim,
  } = useStoreShallow(headerSelector);
  const unstakedTokens = unstakedTokensByAccount.get(account);
  const unbondingTokens = unbondingTokensByAccount.get(account);

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
                helpText='Total amount of UM you will receive, assuming no slashing, when you claim your unbonding tokens that are currently still in their unbonding period.'
                tokens={unbondingTokens?.notYetClaimable.tokens}
                total={unbondingTokens?.notYetClaimable.total}
              />
            </Stat>

            <Stat label='Claimable amount'>
              <UnbondingTokens
                helpText='Total amount of UM you will receive, assuming no slashing, when you claim your unbonding tokens that are currently eligible for claiming.'
                tokens={unbondingTokens?.claimable.tokens}
                total={unbondingTokens?.claimable.total}
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
