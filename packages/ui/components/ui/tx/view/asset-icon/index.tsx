import { Metadata } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import { Identicon } from '../../../identicon';
import { cn } from '../../../../../lib/utils';
import { DelegationTokenIcon } from './delegation-token-icon';
import { getDisplay } from '@penumbra-zone/getters/src/metadata';
import { assetPatterns } from '@penumbra-zone/constants/src/assets';
import { UnbondingTokenIcon } from './unbonding-token-icon';

export const AssetIcon = ({
  metadata,
  size = 'sm',
}: {
  metadata?: Metadata;
  size?: 'sm' | 'lg';
}) => {
  // Image default is "" and thus cannot do nullish-coalescing
  // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
  const icon = metadata?.images[0]?.png || metadata?.images[0]?.svg;
  const className = cn('rounded-full', size === 'sm' && 'size-6', size === 'lg' && 'size-12');
  const display = getDisplay.optional()(metadata);
  const isDelegationToken = display ? assetPatterns.delegationToken.matches(display) : false;
  const isUnbondingToken = display ? assetPatterns.unbondingToken.matches(display) : false;

  return (
    <>
      {icon ? (
        <img className={className} src={icon} alt='Asset icon' />
      ) : isDelegationToken ? (
        <DelegationTokenIcon displayDenom={display} className={className} />
      ) : isUnbondingToken ? (
        /**
         * @todo: Render a custom unbonding token for validators that have a
         * logo -- e.g., with the validator ID superimposed over the validator
         * logo.
         */
        <UnbondingTokenIcon displayDenom={display} className={className} />
      ) : (
        <Identicon
          uniqueIdentifier={metadata?.symbol ?? '?'}
          size={size === 'lg' ? 48 : 24}
          type='solid'
        />
      )}
    </>
  );
};
