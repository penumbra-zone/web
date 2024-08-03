import { Metadata } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { Identicon } from './Identicon';
import { DelegationTokenIcon } from './DelegationTokenIcon';
import { getDisplay } from '@penumbra-zone/getters/metadata';
import { assetPatterns } from '@penumbra-zone/types/assets';
import { UnbondingTokenIcon } from './UnbondingTokenIcon';
import styled from 'styled-components';

const IconImg = styled.img`
  display: block;
  border-radius: ${props => props.theme.borderRadius.full};
  width: 24px;
  height: 24px;
`;

export interface AssetIcon {
  metadata?: Metadata;
}

export const AssetIcon = ({ metadata }: AssetIcon) => {
  // Image default is "" and thus cannot do nullish-coalescing
  // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
  const icon = metadata?.images[0]?.png || metadata?.images[0]?.svg;
  const display = getDisplay.optional()(metadata);
  const isDelegationToken = display ? assetPatterns.delegationToken.matches(display) : false;
  const isUnbondingToken = display ? assetPatterns.unbondingToken.matches(display) : false;

  return (
    <>
      {icon ? (
        <IconImg src={icon} alt='Asset icon' />
      ) : isDelegationToken ? (
        <DelegationTokenIcon displayDenom={display} />
      ) : isUnbondingToken ? (
        /**
         * @todo: Render a custom unbonding token for validators that have a
         * logo -- e.g., with the validator ID superimposed over the validator
         * logo.
         */
        <UnbondingTokenIcon displayDenom={display} />
      ) : (
        <Identicon uniqueIdentifier={metadata?.symbol ?? '?'} size={24} type='solid' />
      )}
    </>
  );
};
