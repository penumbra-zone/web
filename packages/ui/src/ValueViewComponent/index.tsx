import { ReactNode } from 'react';
import styled from 'styled-components';
import { ValueView } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { getMetadata } from '@penumbra-zone/getters/value-view';
import { getFormattedAmtFromValueView } from '@penumbra-zone/types/value-view';
import { ConditionalWrap } from '../ConditionalWrap';
import { Pill, PillProps } from '../Pill';
import { Text } from '../Text';
import { AssetIcon } from '../AssetIcon';
import { Density } from '../types/Density';
import { useDensity } from '../hooks/useDensity';

type Context = 'default' | 'table';

const Row = styled.span`
  display: flex;
  gap: ${props => props.theme.spacing(2)};
  align-items: center;
  width: max-content;
  max-width: 100%;
  text-overflow: ellipsis;
`;

const AssetIconWrapper = styled.div`
  flex-shrink: 0;
`;

const PillMarginOffsets = styled.div<{ $density: Density }>`
  margin-left: ${props => props.theme.spacing(-2)};
  margin-top: ${props => props.theme.spacing(props.$density === 'sparse' ? 0 : -1)};
  margin-bottom: ${props => props.theme.spacing(props.$density === 'sparse' ? 0 : -1)};
`;

const Content = styled.div<{ $context: Context; $priority: 'primary' | 'secondary' }>`
  flex-grow: 1;
  flex-shrink: 1;

  display: flex;
  gap: ${props => props.theme.spacing(2)};
  align-items: center;

  overflow: hidden;

  ${props =>
    props.$context === 'table' &&
    props.$priority === 'secondary' &&
    `border-bottom: 2px dashed ${props.theme.color.other.tonalStroke};`};
`;

const SymbolWrapper = styled.div`
  flex-grow: 1;
  flex-shrink: 1;

  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const ValueText = ({ children, density }: { children: ReactNode; density: Density }) => {
  if (density === 'sparse') {
    return <Text body>{children}</Text>;
  }

  return <Text detail>{children}</Text>;
};

export interface ValueViewComponentProps<SelectedContext extends Context> {
  valueView?: ValueView;
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
  priority?: PillProps['priority'];
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

  if (!valueView) {
    return null;
  }

  const formattedAmount = getFormattedAmtFromValueView(valueView, true);
  const metadata = getMetadata.optional()(valueView);
  // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing -- possibly empty string
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
      <Row>
        <AssetIconWrapper>
          <AssetIcon size={density === 'sparse' ? 'lg' : 'md'} metadata={metadata} />
        </AssetIconWrapper>

        <Content $context={context ?? 'default'} $priority={priority}>
          <ValueText density={density}>{formattedAmount} </ValueText>
          <SymbolWrapper title={symbol}>
            <ValueText density={density}>{symbol}</ValueText>
          </SymbolWrapper>
        </Content>
      </Row>
    </ConditionalWrap>
  );
};
