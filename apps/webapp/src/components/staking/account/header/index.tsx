import { getDisplayDenomFromView } from '@penumbra-zone/getters';
import {
  Card,
  CardContent,
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@penumbra-zone/ui';
import { AccountSwitcher } from '@penumbra-zone/ui/components/ui/account-switcher';
import { ValueViewComponent } from '@penumbra-zone/ui/components/ui/tx/view/value';
import { Stat } from './stat';
import { ValueView } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import { STAKING_TOKEN_METADATA } from '@penumbra-zone/constants';
import { stakingSelector } from '../../../../state/staking';
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
  const { account, setAccount, unstakedTokensByAccount, unbondingTokensByAccount } =
    useStore(stakingSelector);
  const unstakedTokens = unstakedTokensByAccount.get(account);
  const unbondingTokens = unbondingTokensByAccount.get(account);

  return (
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
                    <TooltipTrigger>
                      <img src='./info-icon.svg' className='size-4' alt='An info icon' />
                    </TooltipTrigger>
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
  );
};
