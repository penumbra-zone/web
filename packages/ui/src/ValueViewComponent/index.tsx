import { ValueView } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import { ConditionalWrap } from '../ConditionalWrap';
import { Pill } from '../Pill';
import { Text } from '../Text';
import styled from 'styled-components';
import { AssetIcon } from './AssetIcon';
import { getMetadata } from '@penumbra-zone/getters/value-view';
import { getFormattedAmtFromValueView } from '@penumbra-zone/types/value-view';

const Root = styled.span<{ $context: 'default' | 'table'; $priority: 'primary' | 'secondary' }>`
  display: inline-flex;
  gap: ${props => props.theme.spacing(2)};
  align-items: center;

  border-bottom: 2px dashed
    ${props =>
      props.$context === 'table' && props.$priority === 'secondary'
        ? props.theme.color.other.tonalStroke
        : 'transparent'};
`;

const PillMarginOffsets = styled.div<{ $size: 'dense' | 'sparse' }>`
  margin-left: ${props => (props.$size === 'sparse' ? props.theme.spacing(-2) : '0')};
  margin-right: ${props => props.theme.spacing(props.$size === 'sparse' ? -1 : 1)};
`;

const Content = styled.div`
  flex-grow: 1;
  flex-shrink: 1;

  display: flex;
  gap: ${props => props.theme.spacing(2)};
  align-items: center;
`;

export interface ValueViewComponentProps {
  valueView: ValueView;
  /**
   * A `ValueViewComponent` will be rendered differently depending on which
   * context it's rendered in. By default, it'll be rendered in a pill. But in a
   * table context, it'll be rendered as just an icon and text.
   */
  context?: 'default' | 'table';
  size?: 'dense' | 'sparse';
  /**
   * Use `primary` in most cases, or `secondary` when this value view
   * represents a secondary value, such as when it's an equivalent value of a
   * numeraire.
   */
  priority?: 'primary' | 'secondary';
}

/**
 * `ValueViewComponent` renders a `ValueView` — its amount, icon, and symbol.
 * Use this anywhere you would like to render a `ValueView`.
 */
export const ValueViewComponent = ({
  valueView,
  context = 'default',
  size = 'sparse',
  priority = 'primary',
}: ValueViewComponentProps) => {
  const formattedAmount = getFormattedAmtFromValueView(valueView, true);
  const metadata = getMetadata.optional()(valueView);
  // Symbol default is "" and thus cannot do nullish coalescing
  // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
  const symbol = metadata?.symbol || 'Unknown';

  return (
    <ConditionalWrap
      if={context === 'default'}
      then={children => (
        <Pill size={size} priority={priority}>
          <PillMarginOffsets $size={size}>{children}</PillMarginOffsets>
        </Pill>
      )}
    >
      <Root $context={context} $priority={priority}>
        <AssetIcon metadata={metadata} size={size} />

        <Content>
          <Text>{formattedAmount} </Text>
          <Text technical>{symbol}</Text>
        </Content>
      </Root>
    </ConditionalWrap>
  );
};
