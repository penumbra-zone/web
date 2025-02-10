import * as RadixTabs from '@radix-ui/react-tabs';
import cn from 'clsx';
import { tab, tabMedium, tabSmall } from '../utils/typography';
import { ActionType, getFocusOutlineColorByActionType } from '../utils/action-type';
import { Density, useDensity } from '../utils/density';

type LimitedActionType = Exclude<ActionType, 'destructive'>;

const getIndicatorColor = (actionType: LimitedActionType): string => {
  if (actionType === 'accent') {
    return cn('bg-accentRadialGradient');
  }
  if (actionType === 'unshield') {
    return cn('bg-unshieldRadialGradient');
  }
  return cn('bg-neutralRadialGradient');
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

const getDensityClasses = (density: Density): string => {
  if (density === 'slim') {
    return cn('h-7 gap-4');
  }
  if (density === 'compact') {
    return cn('h-[44px] gap-2');
  }
  return cn('h-[44px] gap-4');
};

const getDensityItemClasses = (density: Density): string => {
  if (density === 'compact') {
    return cn(tabMedium, 'p-2');
  }
  if (density === 'slim') {
    return cn(tabSmall, 'py-1 px-2');
  }
  return cn(tab, 'grow shrink basis-0 p-2');
};

export interface TabsTab {
  value: string;
  label: string;
  disabled?: boolean;
  as?: React.ElementType;
  tabProps?: Record<string, React.HTMLAttributes<HTMLElement>>;
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
        <div className={cn(getDensityClasses(density), 'flex items-stretch box-border')}>
          {options.map(option => {
            const Component = option.as ?? 'button';
            return (
              <RadixTabs.Trigger
                value={option.value}
                key={option.value.toString()}
                disabled={option.disabled}
                asChild
              >
                <Component
                  onClick={() => onChange(option.value)}
                  disabled={option.disabled}
                  className={cn(
                    'appearance-none border-none text-inherit cursor-pointer',
                    'h-full relative whitespace-nowrap rounded-t-xs',
                    'transition-[background-color,outline-color,color] duration-150',
                    value === option.value ? 'text-text-primary' : 'text-text-secondary',
                    getDensityItemClasses(density),
                    getFocusOutlineColorByActionType(actionType),
                    'focus-visible:outline focus-visible:outline-2',
                    'hover:bg-action-hoverOverlay',
                  )}
                  {...(option.tabProps ?? {})}
                >
                  <div
                    className={cn(
                      value === option.value ? 'opacity-100' : 'opacity-0',
                      'absolute inset-0 transition-opacity pointer-events-none',
                      'border-b-2 border-solid',
                      getIndicatorColor(actionType),
                      getBorderColor(actionType),
                    )}
                  />
                  {option.label}
                </Component>
              </RadixTabs.Trigger>
            );
          })}
        </div>
      </RadixTabs.List>
    </RadixTabs.Root>
  );
};
