import { Address } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1/keys_pb';
import { bech32mAddress } from '@penumbra-zone/bech32m/penumbra';
import styled, { DefaultTheme } from 'styled-components';
import { useDensity } from '../hooks/useDensity';
import { Density } from '../types/Density';
import { CopyToClipboardButton } from '../CopyToClipboardButton';
import { Shrink0 } from '../utils/Shrink0';
import { useAnimationDeferredValue } from '../hooks/useAnimationDeferredValue';
import { Text } from '../Text';

const Root = styled.div<{ $density: Density }>`
  border: 1px solid ${props => props.theme.color.other.tonalStroke};
  padding: ${props => props.theme.spacing(2)} ${props => props.theme.spacing(3)};

  display: flex;
  gap: ${props => props.theme.spacing(2)};

  ${props => props.$density === 'sparse' && 'word-break: break-all;'}
`;

const TextWrapper = styled.div`
  flex-grow: 1;
`;

const getAddressColor = (loading: boolean, ephemeral: boolean) => (theme: DefaultTheme) =>
  loading
    ? theme.color.text.muted
    : ephemeral
      ? theme.color.text.special
      : theme.color.text.primary;

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
  const deferredAddress = useAnimationDeferredValue(address);

  return (
    <Root $density={density}>
      <TextWrapper>
        <Text
          technical
          truncate={density === 'compact'}
          color={getAddressColor(loading, ephemeral)}
        >
          {deferredAddress ? bech32mAddress(deferredAddress) : `penumbra1...`}
        </Text>
      </TextWrapper>

      <Shrink0>
        <CopyToClipboardButton
          text={deferredAddress ? bech32mAddress(deferredAddress) : ''}
          disabled={!address || loading}
        />
      </Shrink0>
    </Root>
  );
};
