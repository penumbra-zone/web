import styled, { DefaultTheme } from 'styled-components';
import { tab } from '../utils/typography';
import { motion } from 'framer-motion';
import { useId } from 'react';
import { buttonBase, overlays } from '../utils/button';
import * as RadixTabs from '@radix-ui/react-tabs';

const Root = styled.div`
  height: 52px;
  padding: ${props => props.theme.spacing(1)};

  display: flex;
  align-items: stretch;
  box-sizing: border-box;
`;

type ActionType = 'default' | 'accent' | 'unshield';

const outlineColorByActionType: Record<ActionType, keyof DefaultTheme['color']['action']> = {
  default: 'neutralFocusOutline',
  accent: 'primaryFocusOutline',
  unshield: 'unshieldFocusOutline',
};

const gradientColorByActionType: Record<ActionType, 'neutral' | 'primary' | 'unshield'> = {
  default: 'neutral',
  accent: 'primary',
  unshield: 'unshield',
};

const Tab = styled.button<{
  $actionType: ActionType;
  $getFocusOutlineColor: (theme: DefaultTheme) => string;
  $getBorderRadius: (theme: DefaultTheme) => string;
}>`
  ${buttonBase}

  flex-grow: 1;
  flex-shrink: 1;
  flex-basis: 0; /** Ensure equal widths */

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

  ${tab}
  ${overlays}

  &:focus-within {
    outline: none;
  }

  &::after {
    inset: ${props => props.theme.spacing(0.5)};
  }
`;

const THIRTY_FIVE_PERCENT_OPACITY_IN_HEX = '59';
const SelectedIndicator = styled(motion.div)<{ $actionType: ActionType }>`
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
  actionType?: ActionType;
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

  return (
    <RadixTabs.Root value={value} onValueChange={onChange}>
      <RadixTabs.List asChild>
        <Root>
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
                $actionType={actionType}
                $getFocusOutlineColor={theme =>
                  theme.color.action[outlineColorByActionType[actionType]]
                }
                $getBorderRadius={theme => theme.borderRadius.none}
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
