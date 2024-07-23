import { ValueView } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import { ConditionalWrap } from '../utils/ConditionalWrap';
import { Pill } from '../Pill';
import { Text } from '../Text';
import styled from 'styled-components';
import { AssetIcon } from './AssetIcon';
import { getMetadata } from '@penumbra-zone/getters/value-view';
import { getFormattedAmtFromValueView } from '@penumbra-zone/types/value-view';

type Context = 'default' | 'table';

const Row = styled.span<{ $context: Context; $priority: 'primary' | 'secondary' }>`
  display: flex;
  gap: ${props => props.theme.spacing(2)};
  align-items: center;
  width: min-content;

  ${props =>
    props.$context === 'table' && props.$priority === 'secondary'
      ? `
        border-bottom: 2px dashed ${props.theme.color.other.tonalStroke};
        padding-bottom: ${props.theme.spacing(2)};
      `
      : ''};
`;

const PillMarginOffsets = styled.div<{ $size: 'dense' | 'sparse' }>`
  margin-left: ${props => props.theme.spacing(props.$size === 'sparse' ? -2 : -1)};
  margin-right: ${props => props.theme.spacing(props.$size === 'sparse' ? -1 : 0)};
`;

const Content = styled.div`
  flex-grow: 1;
  flex-shrink: 1;

  display: flex;
  gap: ${props => props.theme.spacing(2)};
  align-items: center;
`;

export interface ValueViewComponentProps<SelectedContext extends Context> {
  valueView: ValueView;
  /**
   * A `ValueViewComponent` will be rendered differently depending on which
   * context it's rendered in. By default, it'll be rendered in a pill. But in a
   * table context, it'll be rendered as just an icon and text.
   */
  context?: SelectedContext;
  /**
   * Can only be set when the `context` is `default`. For the `table` context,
   * there is only one size (`sparse`).
   */
  size?: SelectedContext extends 'table' ? 'sparse' : 'dense' | 'sparse';
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
export const ValueViewComponent = <SelectedContext extends Context = 'default'>({
  valueView,
  context,
  size = 'sparse',
  priority = 'primary',
}: ValueViewComponentProps<SelectedContext>) => {
  const formattedAmount = getFormattedAmtFromValueView(valueView, true);
  const metadata = getMetadata.optional()(valueView);
  // Symbol default is "" and thus cannot do nullish coalescing
  // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
  const symbol = metadata?.symbol || 'Unknown';

  return (
    <ConditionalWrap
      if={!context || context === 'default'}
      then={children => (
        <Pill size={size} priority={priority}>
          <PillMarginOffsets $size={size}>{children}</PillMarginOffsets>
        </Pill>
      )}
    >
      <Row $context={context ?? 'default'} $priority={priority}>
        <AssetIcon metadata={metadata} size={size} />

        <Content>
          <Text>{formattedAmount} </Text>
          <Text technical>{symbol}</Text>
        </Content>
      </Row>
    </ConditionalWrap>
  );
};
