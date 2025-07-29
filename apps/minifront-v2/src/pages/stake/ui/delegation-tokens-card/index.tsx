import { observer } from 'mobx-react-lite';
import { Card } from '@penumbra-zone/ui/Card';
import { Text } from '@penumbra-zone/ui/Text';
import { useStakingStore } from '@/shared/stores/store-context';
import { StakingInfoDialog } from '../staking-info-dialog';
import { ValidatorRow, ValidatorRowSkeleton } from '../validator-row';
import { getValidatorInfoFromValueView } from '@penumbra-zone/getters/value-view';
import { getIdentityKeyFromValidatorInfo } from '@penumbra-zone/getters/validator-info';
import { bech32mIdentityKey } from '@penumbra-zone/bech32m/penumbravalid';
import { assetPatterns } from '@penumbra-zone/types/assets';

export interface DelegationTokensCardProps {
  title?: string;
  showInfoButton?: boolean;
}

export const DelegationTokensCard = observer(
  ({ title = 'Delegation Tokens', showInfoButton = true }: DelegationTokensCardProps) => {
    const stakingStore = useStakingStore();
    const delegations = stakingStore.delegationsCurrent;
    const availableValidators = stakingStore.availableValidators;

    // Use InfoDialog as endContent if showInfoButton is true
    const finalEndContent = showInfoButton ? <StakingInfoDialog /> : undefined;

    // Get current delegations and available validators
    // const delegations = stakingStore.delegationsCurrent;
    // const availableValidators = stakingStore.availableValidators;

    // Helper function to find the validator for a delegation
    const findValidatorForDelegation = (delegation: any) => {
      try {
        // First try to get validator info from the delegation's extendedMetadata (new approach)
        const delegationValidatorInfo = getValidatorInfoFromValueView(delegation);
        if (delegationValidatorInfo) {
          return delegationValidatorInfo;
        }

        // Fallback: extract validator identity key from delegation token metadata and find in available validators
        if (delegation.valueView?.case === 'knownAssetId' && delegation.valueView.value?.metadata) {
          const metadata = delegation.valueView.value.metadata;
          const display = metadata.display;

          if (display) {
            // Use the correct delegation token pattern
            const match = assetPatterns.delegationToken.capture(display);
            if (match) {
              const validatorIdKey = match.idKey;

              // Find matching validator in available validators
              const matchingValidator = availableValidators.find(validator => {
                const validatorIdentityKey = getIdentityKeyFromValidatorInfo.optional(validator);
                if (!validatorIdentityKey) return false;

                const validatorId = bech32mIdentityKey(validatorIdentityKey);
                return validatorId === validatorIdKey;
              });

              return matchingValidator;
            }
          }
        }

        return null;
      } catch (error) {
        console.warn('Failed to find validator for delegation:', error);
        return null;
      }
    };

    if (stakingStore.validatorsLoading) {
      return (
        <Card title={title} endContent={finalEndContent}>
          <div className='flex flex-col gap-2 p-4'>
            {Array.from({ length: 10 }, (_, index) => (
              <ValidatorRowSkeleton key={index} />
            ))}
          </div>
        </Card>
      );
    }

    return (
      <Card title={title} endContent={finalEndContent}>
        <Card.Stack>
          {/* Your Delegations Section - only show if there are delegations */}
          {delegations.length > 0 && (
            <Card.Section variant='transparent' title='Your Delegations'>
              <div className='flex flex-col gap-1'>
                {delegations.map((delegation, index) => {
                  const validatorInfo = findValidatorForDelegation(delegation);

                  if (!validatorInfo) return null;

                  return (
                    <ValidatorRow
                      key={`delegation-${index}`}
                      validatorInfo={validatorInfo}
                      delegation={delegation}
                    />
                  );
                })}
              </div>
            </Card.Section>
          )}

          {/* Available to Delegate Section */}
          <Card.Section variant='transparent' title='Available to Delegate'>
            {availableValidators.length > 0 ? (
              <div className='flex flex-col gap-1'>
                {availableValidators.map((validator, index) => (
                  <ValidatorRow key={`validator-${index}`} validatorInfo={validator} />
                ))}
              </div>
            ) : (
              <div className='py-4 text-center'>
                <Text color='text.secondary' small>
                  Failed to load validators.
                </Text>
              </div>
            )}
          </Card.Section>
        </Card.Stack>
      </Card>
    );
  },
);
