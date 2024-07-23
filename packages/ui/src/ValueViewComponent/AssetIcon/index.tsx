import { Metadata } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb.js';
import { Identicon } from './Identicon';
import { DelegationTokenIcon } from './DelegationTokenIcon';
import { getDisplay } from '@penumbra-zone/getters/metadata';
import { assetPatterns } from '@penumbra-zone/types/assets';
import { UnbondingTokenIcon } from './UnbondingTokenIcon';
import styled from 'styled-components';

const IconImg = styled.img<{ $size: 'sparse' | 'dense' }>`
  border-radius: ${props => props.theme.borderRadius.full};
  width: ${props => (props.$size === 'sparse' ? 24 : 16)}px;
  height: ${props => (props.$size === 'sparse' ? 24 : 16)}px;
`;

export interface AssetIcon {
  metadata?: Metadata;
  size?: 'sparse' | 'dense';
}

export const AssetIcon = ({ metadata, size = 'sparse' }: AssetIcon) => {
  // Image default is "" and thus cannot do nullish-coalescing
  // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
  const icon = metadata?.images[0]?.png || metadata?.images[0]?.svg;
  const display = getDisplay.optional()(metadata);
  const isDelegationToken = display ? assetPatterns.delegationToken.matches(display) : false;
  const isUnbondingToken = display ? assetPatterns.unbondingToken.matches(display) : false;
  console.log({ AssetIcon, isDelegationToken, isUnbondingToken });

  return (
    <>
      {icon ? (
        <IconImg $size={size} src={icon} alt='Asset icon' />
      ) : isDelegationToken ? (
        <DelegationTokenIcon size={size} displayDenom={display} />
      ) : isUnbondingToken ? (
        /**
         * @todo: Render a custom unbonding token for validators that have a
         * logo -- e.g., with the validator ID superimposed over the validator
         * logo.
         */
        <UnbondingTokenIcon size={size} displayDenom={display} />
      ) : (
        <Identicon
          uniqueIdentifier={metadata?.symbol ?? '?'}
          size={size === 'sparse' ? 24 : 16}
          type='solid'
        />
      )}
    </>
  );
};
