import { ReactNode } from 'react';
import { cn } from '../../lib/utils';

/**
 * A select list is a nicely formatted vertical list of options for a user to
 * choose from. It's functionally identical to a series of radio buttons, but
 * presents options as clickable rectangular buttons, rather than circular radio
 * buttons.
 *
 * @example
 * ```tsx
 * <SelectList>
 *   <SelectList.Option
 *     label="Preexisting option 1"
 *     secondary="Option 1 description"
 *     onSelect={() => setOption(1)}
 *     value={1}
 *     isSelected={option === 1}
 *     image={<Option1Icon className='size-full' />}
 *   />
 *   <SelectList.Option
 *     label="Preexisting option 2"
 *     secondary="Option 2 description"
 *     onSelect={() => setOption(2)}
 *     value={2}
 *     isSelected={option === 2}
 *     image={<Option2Icon className='size-full' />}
 *   />
 *   <SelectList.Option
 *     label='Custom option'
 *     secondary={
 *       <input
 *         type='url'
 *         value={customOption}
 *         ref={customOptionInput}
 *         onChange={e => setCustomOption(e.target.value)}
 *         className='w-full bg-transparent'
 *       />
 *     }
 *     onSelect={() => {
 *       customOptionInput.current?.focus();
 *     }}
 *     isSelected={option === customOption}
 *     image={<CustomIcon className='size-full' />}
 *   />
 * </SelectList>
 * ```
 */
export const SelectList = ({ children }: { children: ReactNode }) => (
  <div className='flex flex-col gap-2'>{children}</div>
);

interface BaseOptionProps {
  label: string;
  secondary?: ReactNode;
  isSelected?: boolean;
  image?: ReactNode;
}

interface OptionPropsWithValue<T> extends BaseOptionProps {
  value: T;
  onSelect: (value: T) => void;
}

interface OptionPropsWithoutValue extends BaseOptionProps {
  onSelect?: () => void;
}

type OptionProps<T = never> = OptionPropsWithValue<T> | OptionPropsWithoutValue;

/**
 * `SelectList.Option` can be used to render either a selectable option in a
 * `SelectList`, or a bit of UI (via the `secondary` prop) for e.g., adding a
 * custom item to a list.
 *
 * In the latter case, leave `value` undefined. `onSelect` is also optional, but
 * you can define it if it's useful for, e.g., focusing on a text field on
 * click.
 */
const Option = <T,>({ label, secondary, isSelected, image, ...rest }: OptionProps<T>) => (
  <div
    className={cn(
      'flex items-center cursor-pointer gap-4 rounded-[6px] border-[1px] border-DEFAULT border-solid border-border bg-charcoal p-4 transition-colors',
      isSelected && 'border-teal',
    )}
    role='button'
    aria-selected={isSelected}
    onClick={() => {
      if ('value' in rest && 'onSelect' in rest) rest.onSelect(rest.value);
      else if (rest.onSelect) rest.onSelect();
    }}
  >
    {image && <div className='flex size-8 shrink-0 items-center justify-center'>{image}</div>}

    <div className='flex grow flex-col gap-1'>
      <div>{label}</div>

      {!!secondary && <span className='text-xs text-muted-foreground'>{secondary}</span>}
    </div>
  </div>
);

SelectList.Option = Option;
