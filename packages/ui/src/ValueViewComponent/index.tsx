import { ValueView } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import { ConditionalWrap } from '../ConditionalWrap';
import { Pill } from '../Pill';
import { Text } from '../Text';
import styled from 'styled-components';
import { AssetIcon } from './AssetIcon';
import { getMetadata } from '@penumbra-zone/getters/value-view';

const Root = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing(2)};
  align-items: center;
`;

const PillMarginOffsets = styled.div<{ $size: 'dense' | 'sparse' }>`
  margin-left: ${props => (props.$size === 'sparse' ? props.theme.spacing(-2) : '0')};
  margin-right: ${props => props.theme.spacing(props.$size === 'sparse' ? -1 : 1)};
`;

const Content = styled.div`
  flex-grow: 1;
  flex-shrink: 1;
`;

export interface ValueViewComponentProps {
  valueView: ValueView;
  /**
   * A `ValueViewComponent` will be rendered differently depending on which
   * context it's rendered in. By default, it'll be rendered in a pill. But in a
   * table context, it'll be rendered as just an icon and text.
   *
   * Default: `default`
   */
  context: 'default' | 'table';
  size: 'dense' | 'sparse';
}

/**
 * `ValueViewComponent` renders a `ValueView` — its amount, icon, and symbol.
 */
export const ValueViewComponent = ({
  valueView,
  context = 'default',
  size = 'sparse',
}: ValueViewComponentProps) => {
  const metadata = getMetadata.optional()(valueView);

  return (
    <ConditionalWrap
      if={context === 'default'}
      then={children => (
        <Pill size={size}>
          <PillMarginOffsets $size={size}>{children}</PillMarginOffsets>
        </Pill>
      )}
    >
      <Root>
        <AssetIcon metadata={metadata} size={size} />

        <Content>
          <Text>Fooooo</Text>
        </Content>
      </Root>
    </ConditionalWrap>
  );
};
