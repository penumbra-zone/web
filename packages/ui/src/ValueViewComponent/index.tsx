import { ValueView } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { ConditionalWrap } from '../utils/ConditionalWrap';
import { Pill } from '../Pill';
import { Text } from '../Text';
import styled from 'styled-components';
import { AssetIcon } from './AssetIcon';
import { getMetadata } from '@penumbra-zone/getters/value-view';
import { getFormattedAmtFromValueView } from '@penumbra-zone/types/value-view';
import { Density } from '../types/Density';
import { useDensity } from '../hooks/useDensity';

type Context = 'default' | 'table';

const Row = styled.span<{ $context: Context; $priority: 'primary' | 'secondary' }>`
  display: flex;
  gap: ${props => props.theme.spacing(2)};
  align-items: center;
  width: min-content;
  max-width: 100%;
  text-overflow: ellipsis;

  ${props =>
    props.$context === 'table' && props.$priority === 'secondary'
      ? `
        border-bottom: 2px dashed ${props.theme.color.other.tonalStroke};
        padding-bottom: ${props.theme.spacing(2)};
      `
      : ''};
`;

const AssetIconWrapper = styled.div`
  flex-shrink: 0;
`;

const PillMarginOffsets = styled.div<{ $density: Density }>`
  margin-left: ${props => props.theme.spacing(props.$density === 'sparse' ? -2 : -1)};
  margin-right: ${props => props.theme.spacing(props.$density === 'sparse' ? -1 : 0)};
`;

const Content = styled.div`
  flex-grow: 1;
  flex-shrink: 1;

  display: flex;
  gap: ${props => props.theme.spacing(2)};
  align-items: center;

  overflow: hidden;
`;

const SymbolWrapper = styled.div`
  flex-grow: 1;
  flex-shrink: 1;

  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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
   * Use `primary` in most cases, or `secondary` when this value view
   * represents a secondary value, such as when it's an equivalent value of a
   * numeraire.
   */
  priority?: 'primary' | 'secondary';
}

/**
 * `ValueViewComponent` renders a `ValueView` — its amount, icon, and symbol.
 * Use this anywhere you would like to render a `ValueView`.
 *
 * Note that `ValueViewComponent` only has density variants when the `context`
 * is `default`. For the `table` context, there is only one density.
 */
export const ValueViewComponent = <SelectedContext extends Context = 'default'>({
  valueView,
  context,
  priority = 'primary',
}: ValueViewComponentProps<SelectedContext>) => {
  const density = useDensity();
  const formattedAmount = getFormattedAmtFromValueView(valueView, true);
  const metadata = getMetadata.optional()(valueView);
  // Symbol default is "" and thus cannot do nullish coalescing
  // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
  const symbol = metadata?.symbol || 'Unknown';

  return (
    <ConditionalWrap
      if={!context || context === 'default'}
      then={children => (
        <Pill priority={priority}>
          <PillMarginOffsets $density={density}>{children}</PillMarginOffsets>
        </Pill>
      )}
    >
      <Row $context={context ?? 'default'} $priority={priority}>
        <AssetIconWrapper>
          <AssetIcon metadata={metadata} />
        </AssetIconWrapper>

        <Content>
          <Text>{formattedAmount} </Text>
          <SymbolWrapper title={symbol}>
            <Text technical>{symbol}</Text>
          </SymbolWrapper>
        </Content>
      </Row>
    </ConditionalWrap>
  );
};
