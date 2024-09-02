import { ReactNode } from 'react';
import styled from 'styled-components';
import { Metadata } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { getDisplay } from '@penumbra-zone/getters/metadata';
import { assetPatterns } from '@penumbra-zone/types/assets';
import { Identicon } from '../Identicon';
import { DelegationTokenIcon } from './DelegationTokenIcon';
import { UnbondingTokenIcon } from './UnbondingTokenIcon';
import { Size, size, sizeMap } from './shared.ts';

const BorderWrapper = styled.div`
  max-width: max-content;
  border-radius: ${props => props.theme.borderRadius.full};
  border: 1px solid ${props => props.theme.color.other.tonalStroke};
  overflow: hidden;
`;

const IconImg = styled.img<{ $size: Size }>`
  display: block;
  ${size}
`;

export interface AssetIcon {
  size?: Size;
  metadata?: Metadata;
}

export const AssetIcon = ({ metadata, size = 'md' }: AssetIcon) => {
  // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing -- possibly empty string
  const icon = metadata?.images[0]?.png || metadata?.images[0]?.svg;
  const display = getDisplay.optional()(metadata);
  const isDelegationToken = display ? assetPatterns.delegationToken.matches(display) : false;
  const isUnbondingToken = display ? assetPatterns.unbondingToken.matches(display) : false;

  let assetIcon: ReactNode;
  if (icon) {
    assetIcon = <IconImg $size={size} src={icon} alt='Asset icon' />;
  } else if (isDelegationToken) {
    assetIcon = <DelegationTokenIcon size={size} displayDenom={display} />;
  } else if (isUnbondingToken) {
    /**
     * @todo: Render a custom unbonding token for validators that have a
     * logo -- e.g., with the validator ID superimposed over the validator logo.
     */
    assetIcon = <UnbondingTokenIcon size={size} displayDenom={display} />;
  } else {
    assetIcon = (
      <Identicon uniqueIdentifier={metadata?.symbol ?? '?'} size={sizeMap[size]} type='solid' />
    );
  }

  return <BorderWrapper>{assetIcon}</BorderWrapper>;
};
