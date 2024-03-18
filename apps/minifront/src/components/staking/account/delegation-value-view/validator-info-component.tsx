import { ValidatorInfo } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/stake/v1/stake_pb';
import { Identicon } from '@penumbra-zone/ui/components/ui/identicon';
import { IdentityKeyComponent } from '@penumbra-zone/ui/components/ui/identity-key-component';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@penumbra-zone/ui/components/ui/tooltip';
import { useStore } from '../../../../state';
import {
  getIdentityKeyFromValidatorInfo,
  getValidator,
} from '@penumbra-zone/getters/src/validator-info';
import { bech32IdentityKey } from '@penumbra-zone/types/src/identity-key';
import { calculateCommissionAsPercentage } from '@penumbra-zone/types/src/staking';

/**
 * Renders a single `ValidatorInfo`: its name, bech32-encoded identity key,
 * voting power, and commission.
 */
export const ValidatorInfoComponent = ({
  validatorInfo,
  votingPowerAsIntegerPercentage,
}: {
  validatorInfo: ValidatorInfo;
  votingPowerAsIntegerPercentage?: number;
}) => {
  // The tooltip component is a bit heavy to render, so we'll wait to render it
  // until all loading completes.
  const showTooltips = useStore(state => !state.staking.loading);
  const validator = getValidator(validatorInfo);
  const identityKey = getIdentityKeyFromValidatorInfo(validatorInfo);

  return (
    <TooltipProvider>
      <div className='flex items-center gap-4'>
        <div className='shrink-0'>
          <Identicon
            uniqueIdentifier={bech32IdentityKey(identityKey)}
            size={48}
            className='rounded-full'
            type='gradient'
          />
        </div>

        <div className='flex min-w-0 shrink flex-col gap-1'>
          <IdentityKeyComponent identityKey={identityKey} />
          <div className='flex flex-col lg:flex-row lg:gap-8'>
            <span className='truncate font-bold'>{validator.name}</span>

            {votingPowerAsIntegerPercentage !== undefined && (
              <span>
                {showTooltips && (
                  <Tooltip>
                    <TooltipTrigger>
                      <span className='underline decoration-dotted underline-offset-4'>VP:</span>
                    </TooltipTrigger>
                    <TooltipContent>Voting power</TooltipContent>
                  </Tooltip>
                )}
                {!showTooltips && <span>VP:</span>} {votingPowerAsIntegerPercentage}%
              </span>
            )}

            <span>
              {showTooltips && (
                <Tooltip>
                  <TooltipTrigger>
                    <span className='underline decoration-dotted underline-offset-4'>Com:</span>
                  </TooltipTrigger>
                  <TooltipContent>Commission</TooltipContent>
                </Tooltip>
              )}
              {!showTooltips && <span>Com:</span>} {calculateCommissionAsPercentage(validatorInfo)}%
            </span>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};
