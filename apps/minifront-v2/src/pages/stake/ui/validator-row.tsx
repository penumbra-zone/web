import { observer } from 'mobx-react-lite';
import { useMemo } from 'react';
import { ValueView } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { ValidatorInfo } from '@penumbra-zone/protobuf/penumbra/core/component/stake/v1/stake_pb';
import { Metadata } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { AssetIcon } from '@penumbra-zone/ui/AssetIcon';
import { Button } from '@penumbra-zone/ui/Button';
import { Text } from '@penumbra-zone/ui/Text';
import { getIdentityKeyFromValidatorInfo } from '@penumbra-zone/getters/validator-info';
import { getMetadataFromBalancesResponse } from '@penumbra-zone/getters/balances-response';
import { getEquivalentValues } from '@penumbra-zone/getters/value-view';
import { asValueView } from '@penumbra-zone/getters/equivalent-value';
import { bech32mIdentityKey } from '@penumbra-zone/bech32m/penumbravalid';
import { useStakingStore } from '@/shared/stores/store-context';
import { CopyToClipboardButton } from '@penumbra-zone/ui/CopyToClipboardButton';
import { Density } from '@penumbra-zone/ui/Density';
import { ValueViewComponent } from '@penumbra-zone/ui/ValueView';

export interface ValidatorRowProps {
  validatorInfo: ValidatorInfo;
  delegation?: ValueView;
  compact?: boolean;
}

export const ValidatorRowSkeleton = () => {
  return <div className='h-16 w-full rounded-sm bg-other-tonal-fill5 animate-pulse' />;
};

export const ValidatorRow = observer(
  ({ validatorInfo, delegation, compact = false }: ValidatorRowProps) => {
    const stakingStore = useStakingStore();

    // Extract validator info
    const validatorName = validatorInfo.validator?.name || 'Unknown Validator';
    const identityKey = getIdentityKeyFromValidatorInfo.optional(validatorInfo);
    const validatorId = identityKey ? bech32mIdentityKey(identityKey) : '';

    // Create metadata for icon - show delegation token icon for ALL validators
    const iconMetadata = identityKey
      ? new Metadata({
          display: `delegation_${validatorId}`,
          base: `udelegation_${validatorId}`,
          denomUnits: [
            { denom: `udelegation_${validatorId}` },
            { denom: `delegation_${validatorId}`, exponent: 6 },
          ],
          name: 'Delegation token',
          symbol: `delUM(${validatorId})`,
          penumbraAssetId: delegation
            ? getMetadataFromBalancesResponse.optional(delegation as any)?.penumbraAssetId
            : undefined,
        })
      : stakingStore.stakingTokenMetadata;

    // Get voting power percentage
    const votingPower = stakingStore.getVotingPower(validatorInfo);

    // Get delegation value view for proper rendering
    const delegationValueView = delegation ? delegation : undefined;

    // Get equivalent UM value for delegation token (like legacy minifront)
    const equivalentUmValue = useMemo(() => {
      if (!delegationValueView) return undefined;

      const stakingTokenMetadata = stakingStore.stakingTokenMetadata;
      const equivalentValue = getEquivalentValues(delegationValueView).find(equivalentValue =>
        equivalentValue.numeraire?.penumbraAssetId?.equals(stakingTokenMetadata?.penumbraAssetId),
      );

      if (equivalentValue) {
        return asValueView(equivalentValue);
      }
      return undefined;
    }, [delegationValueView, stakingStore.stakingTokenMetadata]);

    // Action handlers
    const handleDelegate = () => {
      stakingStore.setAction('delegate', validatorInfo);
    };

    const handleUndelegate = () => {
      stakingStore.setAction('undelegate', validatorInfo);
    };

    // Check if actions are enabled
    const canUndelegate = stakingStore.canUndelegate(validatorInfo);

    return (
      <div className='group relative flex h-16 items-center justify-between rounded-sm bg-other-tonal-fill5 p-3 hover:bg-action hover:bg-action-hover-overlay'>
        <div className={`flex w-full items-center justify-between gap-2`}>
          <div className='flex items-center gap-2 flex-shrink-0'>
            <AssetIcon size='lg' metadata={iconMetadata} zIndex={undefined} />
            <div className='flex flex-col flex-1 min-w-0 flex-shrink-0'>
              {/* Validator name and voting power */}
              <div className='flex items-center gap-2'>
                <Text color='text.primary' detail>
                  {validatorName}
                </Text>
                {votingPower > 0 && (
                  <Text color='text.secondary' xs>
                    VP: {votingPower}%
                  </Text>
                )}
                {votingPower > 0 && (
                  <Text color='text.secondary' xs>
                    Com: {votingPower}%
                  </Text>
                )}
              </div>
              {/* Validator ID (truncated) */}
              <div className='flex items-center w-full min-w-0 flex-shrink-0'>
                <Text color='text.primary' truncate detailTechnical>
                  {validatorId}
                </Text>
                {/* Copy-to-clipboard button for validator identity key */}
                <Density slim>
                  <CopyToClipboardButton text={validatorId} />
                </Density>
              </div>
            </div>
          </div>
          {/* Delegation amount if present */}
          <div className='flex items-center gap-2'>
            {delegationValueView && !compact && (
              <div className='flex items-center gap-3'>
                <div className='flex items-center gap-2'>
                  <Density slim>
                    <ValueViewComponent
                      valueView={delegationValueView}
                      priority='primary'
                      showSymbol={false}
                    />
                    {equivalentUmValue && (
                      <ValueViewComponent
                        valueView={equivalentUmValue}
                        priority='secondary'
                        showSymbol={false}
                      />
                    )}
                  </Density>
                </div>
              </div>
            )}
            {/* Action buttons - absolutely positioned */}
            {!compact && (
              <div className='flex items-center gap-2'>
                <Button
                  actionType='accent'
                  density='compact'
                  onClick={handleDelegate}
                  disabled={stakingStore.loading}
                >
                  Delegate
                </Button>
                {delegation && (
                  <Button
                    actionType='default'
                    priority='secondary'
                    density='compact'
                    onClick={handleUndelegate}
                    disabled={!canUndelegate || stakingStore.loading}
                  >
                    Undelegate
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  },
);
