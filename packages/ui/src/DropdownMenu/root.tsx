import { ReactNode } from 'react';
import { Root as RadixDropdownMenuRoot } from '@radix-ui/react-dropdown-menu';
import { Trigger } from './trigger.tsx';
import { Content } from './content.tsx';
import { RadioGroup } from './radio-group.tsx';
import { RadioItem } from './radio-item.tsx';
import { CheckboxItem } from './checkbox-item.tsx';
import { Item } from './item.tsx';

interface ControlledDropdownMenuProps {
  /**
   * Whether the popover is currently open. If left `undefined`, this will be
   * treated as an uncontrolled popover — that is, it will open and close based
   * on user interactions rather than on state variables.
   */
  isOpen: boolean;
  /**
   * Callback for when the user closes the popover. Should update the state
   * variable being passed in via `isOpen`. If left `undefined`, users will not
   * be able to close it -- that is, it will only be able to be closed programmatically
   */
  onClose?: VoidFunction;
}

interface UncontrolledDropdownMenuProps {
  isOpen?: undefined;
  onClose?: undefined;
}

export type DropdownMenuProps = {
  children?: ReactNode;
} & (ControlledDropdownMenuProps | UncontrolledDropdownMenuProps);

/**
 * A dropdown menu with a set of subcomponents for composing complex menus.
 *
 * `<DropdownMenu>` can be controlled or uncontrolled. If `isOpen` is not provided
 * but `<DropdownMenu.Trigger>` is present, it will open itself.
 *
 * You can nest multiple components inside the `<DropdownMenu.Content>`:
 * - `<DropdownMenu.Item>` as an action button in the dropdown
 * - `<DropdownMenu.RadioGroup>` with `<DropdownMenu.RadioItem>` as a group of radio buttons
 * - `<DropdownMenu.CheckboxItem>` as a checkbox
 *
 * Example:
 *
 * ```tsx
 * const [radioValue, setRadioValue] = useState('1');
 * const [apple, setApple] = useState(false);
 * const [banana, setBanana] = useState(false);
 *
 * <DropdownMenu>
 *   <DropdownMenu.Trigger>
 *     <Button iconOnly icon={Filter}>
 *       Filter
 *     </Button>
 *   </DropdownMenu.Trigger>
 *
 *   <DropdownMenu.Content>
 *     <DropdownMenu.Item>Default item</DropdownMenu.Item>
 *     <DropdownMenu.Item actionType='destructive'>Destructive item</DropdownMenu.Item>
 *
 *     <DropdownMenu.RadioGroup value={value} onValueChange={setValue}>
 *       <DropdownMenu.RadioItem value='4'>Default</DropdownMenu.RadioItem>
 *       <DropdownMenu.RadioItem value='5' disabled>Disabled</DropdownMenu.RadioItem>
 *     </DropdownMenu.RadioGroup>
 *
 *     <DropdownMenu.CheckboxItem checked={apple} onChange={setApple}>Apple</DropdownMenu.CheckboxItem>
 *     <DropdownMenu.CheckboxItem checked={banana} onChange={setBanana}>Banana</DropdownMenu.CheckboxItem>
 *   </DropdownMenu.Content>
 * </DropdownMenu>
 * ```
 */
export const DropdownMenu = ({ children, onClose, isOpen }: DropdownMenuProps) => {
  return (
    <RadixDropdownMenuRoot
      open={isOpen}
      onOpenChange={onClose ? value => !value && onClose() : undefined}
    >
      {children}
    </RadixDropdownMenuRoot>
  );
};

DropdownMenu.Trigger = Trigger;
DropdownMenu.Content = Content;
DropdownMenu.RadioGroup = RadioGroup;
DropdownMenu.RadioItem = RadioItem;
DropdownMenu.CheckboxItem = CheckboxItem;
DropdownMenu.Item = Item;
