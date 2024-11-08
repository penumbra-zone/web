import type { LucideIcon } from 'lucide-react';
import type { FC, MouseEventHandler } from 'react';
import { getMenuItem, DropdownMenuItemBase } from '../utils/menu-item';
import { Text } from '../Text';

export interface MenuItemProps extends DropdownMenuItemBase {
  label: string;
  icon?: LucideIcon | FC;
  onClick?: MouseEventHandler<HTMLButtonElement>;
}

/**
 * A button generally used in menus or selectable lists
 */
export const MenuItem = ({
  actionType = 'default',
  icon: IconComponent,
  label,
  onClick,
  disabled,
}: MenuItemProps) => {
  return (
    <button disabled={disabled} onClick={onClick} className={getMenuItem(actionType)}>
      {IconComponent && (
        <i className='flex size-6 items-center justify-center p-1'>
          <IconComponent size={16} />
        </i>
      )}
      <Text small>{label}</Text>
    </button>
  );
};
