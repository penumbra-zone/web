import { ReactNode } from 'react';
import styled from 'styled-components';
import { Metadata } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { getDisplay } from '@penumbra-zone/getters/metadata';
import { assetPatterns } from '@penumbra-zone/types/assets';
import { Identicon } from '../Identicon';
import { DelegationTokenIcon } from './DelegationTokenIcon';
import { UnbondingTokenIcon } from './UnbondingTokenIcon';

type Size = 'lg' | 'md' | 'sm';

const sizeMap: Record<Size, number> = {
  lg: 32,
  md: 24,
  sm: 16,
};

const BorderWrapper = styled.div<{ $size: Size }>`
  width: ${props => sizeMap[props.$size]}px;
  height: ${props => sizeMap[props.$size]}px;
  border-radius: ${props => props.theme.borderRadius.full};
  overflow: hidden;
  
  & > * {
    width: 100%;
    height: 100%;
  }
`;

const IconImg = styled.img`
  display: block;
`;

export interface AssetIconProps {
  size?: Size;
  metadata?: Metadata;
}

export const AssetIcon = ({ metadata, size = 'md' }: AssetIconProps) => {
  // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing -- possibly empty string
  const icon = metadata?.images[0]?.png || metadata?.images[0]?.svg;
  const display = getDisplay.optional()(metadata);
  const isDelegationToken = display ? assetPatterns.delegationToken.matches(display) : false;
  const isUnbondingToken = display ? assetPatterns.unbondingToken.matches(display) : false;

  let assetIcon: ReactNode;
  if (icon) {
    assetIcon = <IconImg src={icon} alt='Asset icon' />;
  } else if (isDelegationToken) {
    assetIcon = <DelegationTokenIcon displayDenom={display} />;
  } else if (isUnbondingToken) {
    /**
     * @todo: Render a custom unbonding token for validators that have a
     * logo -- e.g., with the validator ID superimposed over the validator logo.
     */
    assetIcon = <UnbondingTokenIcon displayDenom={display} />;
  } else {
    assetIcon = (
      <Identicon uniqueIdentifier={metadata?.symbol ?? '?'} type='solid' />
    );
  }

  return <BorderWrapper $size={size}>{assetIcon}</BorderWrapper>;
};
