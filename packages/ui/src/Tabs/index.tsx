import styled, { DefaultTheme } from 'styled-components';
import { tab } from '../utils/typography';
import { motion } from 'framer-motion';
import { useId } from 'react';
import { buttonInteractions } from '../utils/button';
import * as RadixTabs from '@radix-ui/react-tabs';

const TEN_PERCENT_OPACITY_IN_HEX = '1a';

const Root = styled.div`
  border: 1px solid ${props => props.theme.color.other.tonalStroke};
  border-radius: ${props => props.theme.borderRadius.sm};
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

const Tab = styled.button<{
  $actionType: ActionType;
  $getFocusOutlineColor: (theme: DefaultTheme) => string;
  $getBorderRadius: (theme: DefaultTheme) => string;
}>`
  flex-grow: 1;
  flex-shrink: 1;
  flex-basis: 0; /** Ensure equal widths */

  appearance: none;
  background-color: transparent;
  border: none;
  border-radius: ${props => props.theme.borderRadius.xs};
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
  cursor: pointer;

  ${tab}
  ${buttonInteractions}

  &::after {
    inset: ${props => props.theme.spacing(0.5)};
  }
`;

const SelectedIndicator = styled(motion.div)`
  background-color: ${props => props.theme.color.text.primary + TEN_PERCENT_OPACITY_IN_HEX};
  border-radius: ${props => props.theme.borderRadius.xs};
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
                $getBorderRadius={theme => theme.borderRadius.xs}
              >
                {value === option.value && <SelectedIndicator layout layoutId={layoutId} />}
                {option.label}
              </Tab>
            </RadixTabs.Trigger>
          ))}
        </Root>
      </RadixTabs.List>
    </RadixTabs.Root>
  );
};
