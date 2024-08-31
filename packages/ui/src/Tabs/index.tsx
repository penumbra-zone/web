import styled, { css, DefaultTheme } from 'styled-components';
import { tab, tabSmall } from '../utils/typography';
import { motion } from 'framer-motion';
import { useId } from 'react';
import { buttonBase, overlays } from '../utils/button';
import * as RadixTabs from '@radix-ui/react-tabs';
import { ActionType } from '../utils/ActionType';
import { useDensity } from '../hooks/useDensity';
import { Density } from '../types/Density.ts';

const sparse = css`
  ${tab};

  flex-grow: 1;
  flex-shrink: 1;
  flex-basis: 0; /** Ensure equal widths */

  padding: ${props => props.theme.spacing(2)};
`;

const compact = css`
  ${tabSmall};

  padding: ${props => props.theme.spacing(1)} ${props => props.theme.spacing(2)};
`;

const Root = styled.div<{
  $density: Density;
}>`
  display: flex;
  align-items: stretch;
  box-sizing: border-box;
  gap: ${props => props.theme.spacing(4)};
  height: ${props => (props.$density === 'sparse' ? 44 : 28)}px;
`;

type LimitedActionType = Exclude<ActionType, 'destructive'>;

const outlineColorByActionType: Record<LimitedActionType, keyof DefaultTheme['color']['action']> = {
  default: 'neutralFocusOutline',
  accent: 'primaryFocusOutline',
  unshield: 'unshieldFocusOutline',
};

const gradientColorByActionType: Record<LimitedActionType, 'neutral' | 'primary' | 'unshield'> = {
  default: 'neutral',
  accent: 'primary',
  unshield: 'unshield',
};

const Tab = styled.button<{
  $actionType: LimitedActionType;
  $getFocusOutlineColor: (theme: DefaultTheme) => string;
  $getBorderRadius: (theme: DefaultTheme) => string;
  $density: Density;
}>`
  ${buttonBase};

  height: 100%;

  color: ${props => {
    switch (props.$actionType) {
      case 'accent':
        return props.theme.color.primary.light;
      case 'unshield':
        return props.theme.color.unshield.light;
      default:
        return props.theme.color.text.primary;
    }
  }};
  position: relative;
  white-space: nowrap;

  ${overlays}

  ${props => (props.$density === 'sparse' ? sparse : compact)}
  
  &:focus-within {
    outline: none;
  }

  &::after {
    inset: ${props => props.theme.spacing(0.5)};
  }
`;

const THIRTY_FIVE_PERCENT_OPACITY_IN_HEX = '59';
const SelectedIndicator = styled(motion.div)<{ $actionType: LimitedActionType }>`
  background: radial-gradient(
    at 50% 100%,
    ${props =>
        props.theme.color[gradientColorByActionType[props.$actionType]].light +
        THIRTY_FIVE_PERCENT_OPACITY_IN_HEX}
      0%,
    transparent 50%
  );
  border-bottom: 2px solid
    ${props => props.theme.color.action[outlineColorByActionType[props.$actionType]]};
  position: absolute;
  inset: 0;
  z-index: -1;
`;

export interface TabsTab {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface TabsProps {
  value: string;
  onChange: (value: string) => void;
  options: TabsTab[];
  actionType?: LimitedActionType;
}

/**
 * Use tabs for switching between related pages or views.
 *
 * Built atop Radix UI's `<Tabs />` component, so it's fully accessible and
 * supports keyboard navigation.
 *
 * ```TSX
 * <Tabs
 *   value={value}
 *   onChange={setValue}
 *   options={[
 *     { value: 'one', label: 'One' },
 *     { value: 'two', label: 'Two' },
 *     { value: 'three', label: 'Three', disabled: true },
 *   ]}
 * />
 * ```
 */
export const Tabs = ({ value, onChange, options, actionType = 'default' }: TabsProps) => {
  const layoutId = useId();
  const density = useDensity();

  return (
    <RadixTabs.Root value={value} onValueChange={onChange}>
      <RadixTabs.List asChild>
        <Root $density={density}>
          {options.map(option => (
            <RadixTabs.Trigger
              value={option.value}
              key={option.value.toString()}
              disabled={option.disabled}
              asChild
            >
              <Tab
                onClick={() => onChange(option.value)}
                disabled={option.disabled}
                $density={density}
                $actionType={actionType}
                $getFocusOutlineColor={theme =>
                  theme.color.action[outlineColorByActionType[actionType]]
                }
                $getBorderRadius={theme =>
                  `${theme.borderRadius.xs} ${theme.borderRadius.xs} ${theme.borderRadius.none} ${theme.borderRadius.none}`
                }
              >
                {value === option.value && (
                  <SelectedIndicator layout layoutId={layoutId} $actionType={actionType} />
                )}
                {option.label}
              </Tab>
            </RadixTabs.Trigger>
          ))}
        </Root>
      </RadixTabs.List>
    </RadixTabs.Root>
  );
};
