import { ValidatorInfo } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/stake/v1/stake_pb';
import {
  bech32IdentityKey,
  calculateCommissionAsPercentage,
  getIdentityKeyFromValidatorInfo,
  getValidator,
} from '@penumbra-zone/types';
import {
  Identicon,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@penumbra-zone/ui';
import { CopyToClipboardIconButton } from '@penumbra-zone/ui/components/ui/copy-to-clipboard-icon-button';

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
  const validator = getValidator(validatorInfo);
  const identityKey = getIdentityKeyFromValidatorInfo(validatorInfo);

  return (
    <TooltipProvider delayDuration={0}>
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
          <div className='flex items-center gap-2'>
            <div className='truncate font-mono text-muted-foreground'>
              {bech32IdentityKey(identityKey)}
            </div>

            <CopyToClipboardIconButton text={bech32IdentityKey(identityKey)} />
          </div>

          <div className='flex flex-col lg:flex-row lg:gap-8'>
            <span className='truncate font-bold'>{validator.name}</span>

            {votingPowerAsIntegerPercentage !== undefined && (
              <span>
                <Tooltip>
                  <TooltipTrigger>
                    <span className='underline decoration-dotted underline-offset-4'>VP:</span>
                  </TooltipTrigger>
                  <TooltipContent>Voting power</TooltipContent>
                </Tooltip>{' '}
                {votingPowerAsIntegerPercentage}%
              </span>
            )}

            <span>
              <Tooltip>
                <TooltipTrigger>
                  <span className='underline decoration-dotted underline-offset-4'>Com:</span>
                </TooltipTrigger>
                <TooltipContent>Commission</TooltipContent>
              </Tooltip>{' '}
              {calculateCommissionAsPercentage(validatorInfo)}%
            </span>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};
