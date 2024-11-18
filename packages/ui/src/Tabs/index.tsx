import { tab, tabSmall } from '../utils/typography';
import { buttonBase, getOverlays } from '../utils/button';
import * as RadixTabs from '@radix-ui/react-tabs';
import { ActionType } from '../utils/action-type';
import { useDensity } from '../utils/density';
import cn from 'clsx';

type LimitedActionType = Exclude<ActionType, 'destructive'>;

const getIndicatorColor = (actionType: LimitedActionType): string => {
  if (actionType === 'accent') {
    return cn('bg-tabAccent');
  }
  if (actionType === 'unshield') {
    return cn('bg-tabUnshield');
  }
  return cn('bg-tabNeutral');
};

const getBorderColor = (actionType: LimitedActionType): string => {
  if (actionType === 'accent') {
    return cn('border-action-primaryFocusOutline');
  }
  if (actionType === 'unshield') {
    return cn('border-action-unshieldFocusOutline');
  }
  return cn('border-action-neutralFocusOutline');
};

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
  const density = useDensity();

  return (
    <RadixTabs.Root value={value} onValueChange={onChange}>
      <RadixTabs.List asChild>
        <div
          className={cn(
            'flex items-stretch box-border gap-4',
            density === 'sparse' ? 'h-[44px]' : 'h-7',
          )}
        >
          {options.map(option => (
            <RadixTabs.Trigger
              value={option.value}
              key={option.value.toString()}
              disabled={option.disabled}
              asChild
            >
              <button
                onClick={() => onChange(option.value)}
                disabled={option.disabled}
                className={cn(
                  buttonBase,
                  getOverlays({ actionType, density }),
                  'h-full relative whitespace-nowrap text-text-primary',
                  density === 'sparse'
                    ? cn(tab, 'grow shrink basis-0 p-2')
                    : cn(tabSmall, 'py-1 px-2'),
                  'before:rounded-tl-xs before:rounded-tr-xs before:rounded-bl-none before:rounded-br-none',
                  'focus-within:outline-none',
                  'after:inset-[2px]',
                )}
              >
                {value === option.value && (
                  <div
                    className={cn(
                      'absolute inset-0 -z-[1]',
                      'border-b-2 border-solid',
                      getIndicatorColor(actionType),
                      getBorderColor(actionType),
                    )}
                  />
                )}
                {option.label}
              </button>
            </RadixTabs.Trigger>
          ))}
        </div>
      </RadixTabs.List>
    </RadixTabs.Root>
  );
};
