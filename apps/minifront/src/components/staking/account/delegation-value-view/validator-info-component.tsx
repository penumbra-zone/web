import { ValidatorInfo } from '@penumbra-zone/protobuf/penumbra/core/component/stake/v1/stake_pb';
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
  getValidatorState,
} from '@penumbra-zone/getters/validator-info';
import { calculateCommissionAsPercentage } from '@penumbra-zone/types/staking';
import { Metadata } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { AssetIcon } from '@penumbra-zone/ui/components/ui/asset-icon';
import { ValidatorStateLabel } from './validator-state-label.tsx';

/**
 * Renders a single `ValidatorInfo`: its name and identity key,
 * voting power, and commission.
 */
export const ValidatorInfoComponent = ({
  validatorInfo,
  votingPowerAsIntegerPercentage,
  delegationTokenMetadata,
}: {
  validatorInfo: ValidatorInfo;
  votingPowerAsIntegerPercentage?: number;
  delegationTokenMetadata: Metadata;
}) => {
  // The tooltip component is a bit heavy to render, so we'll wait to render it
  // until all loading completes.
  const showTooltips = useStore(state => !state.staking.loading);
  const validator = getValidator(validatorInfo);
  const identityKey = getIdentityKeyFromValidatorInfo(validatorInfo);
  const state = getValidatorState.optional()(validatorInfo);

  return (
    <TooltipProvider>
      <div className='flex items-center gap-4'>
        <div className='shrink-0'>
          <AssetIcon metadata={delegationTokenMetadata} size='lg' />
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
            {state && <ValidatorStateLabel state={state} />}
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};
