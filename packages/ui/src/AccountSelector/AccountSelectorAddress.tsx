import { Address } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1/keys_pb';
import { bech32mAddress } from '@penumbra-zone/bech32m/penumbra';
import styled from 'styled-components';
import { useDensity } from '../hooks/useDensity';
import { Density } from '../types/Density';
import { CopyToClipboardButton } from '../CopyToClipboardButton';
import { Shrink0 } from '../utils/Shrink0';
import { technical, truncate } from '../utils/typography';

const Root = styled.div<{ $ephemeral: boolean; $loading: boolean; $density: Density }>`
  border: 1px solid ${props => props.theme.color.other.tonalStroke};
  padding: ${props => props.theme.spacing(2)} ${props => props.theme.spacing(3)};

  display: flex;
  gap: ${props => props.theme.spacing(2)};

  color: ${props =>
    props.$loading
      ? props.theme.color.text.muted
      : props.$ephemeral
        ? props.theme.color.text.special
        : props.theme.color.text.primary};

  ${props => props.$density === 'sparse' && 'word-break: break-all;'}
`;

const TextWrapper = styled.div<{ $density: Density }>`
  flex-grow: 1;

  ${props => props.$density === 'compact' && truncate}
  ${technical}
`;

export interface AccountSelectorAddressProps {
  address?: Address;
  ephemeral: boolean;
  loading: boolean;
}

export const AccountSelectorAddress = ({
  address,
  ephemeral,
  loading,
}: AccountSelectorAddressProps) => {
  const density = useDensity();

  return (
    <Root $ephemeral={ephemeral} $loading={loading} $density={density}>
      <TextWrapper $density={density}>
        {address ? bech32mAddress(address) : `penumbra1...`}
      </TextWrapper>

      <Shrink0>
        <CopyToClipboardButton
          text={address ? bech32mAddress(address) : ''}
          disabled={!address || loading}
        />
      </Shrink0>
    </Root>
  );
};
