import { getDisplayDenomFromView } from '@penumbra-zone/getters';
import {
  Card,
  CardContent,
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  Button,
} from '@penumbra-zone/ui';
import { AccountSwitcher } from '@penumbra-zone/ui/components/ui/account-switcher';
import { ValueViewComponent } from '@penumbra-zone/ui/components/ui/tx/view/value';
import { Stat } from './stat';
import { ValueView } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import { STAKING_TOKEN_METADATA } from '@penumbra-zone/constants';
import { accountsSelector, stakingSelector } from '../../../../state/staking';
import { useStore } from '../../../../state';

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
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <ValueViewComponent view={unbondingTokens?.total ?? zeroBalanceUm} />
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className='flex flex-col gap-4'>
                      <div className='max-w-[250px]'>
                        Total amount of UM you will receive when all your unbonding tokens are
                        claimed, assuming no slashing.
                      </div>
                      {unbondingTokens?.tokens.length && (
                        <>
                          {unbondingTokens.tokens.map(token => (
                            <ValueViewComponent key={getDisplayDenomFromView(token)} view={token} />
                          ))}

                          <Button
                            className='self-end px-4 text-white'
                            onClick={() => void undelegateClaim()}
                          >
                            Claim
                          </Button>
                        </>
                      )}
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </Stat>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
