import { ReactNode, useId, useState } from 'react';
import { Dialog } from '../Dialog';
import { getHash } from './shared/helpers';
import { AssetSelectorContext } from './shared/Context';
import { AssetSelectorSearchFilter } from './SearchFilter';
import { AssetSelectorTrigger } from './Trigger';
import { AssetSelectorBaseProps } from './shared/types';

interface ChildrenArguments {
  onClose: VoidFunction;
  /**
   * Takes the `Metadata` or `BalancesResponse` and returns
   * a unique key string to be used within map in React
   */
  getKeyHash: typeof getHash;
}

export interface AssetSelectorCustomProps extends AssetSelectorBaseProps {
  /** A value of the search filter inside the selector dialog */
  search?: string;

  /** Fires when user inputs the value into the search filter inside the selector dialog */
  onSearchChange?: (newValue: string) => void;

  /**
   * Use children as a function to get assistance with keying
   * the `ListItem`s and implement you own closing logic.
   *
   * Example:
   * ```tsx
   *  <AssetSelector>
   *    {({ getKeyHash, onClose }) => (
   *     <>
   *       {options.map(option => (
   *        <AssetSelector.ListItem key={getKeyHash(option)} value={option} />
   *       ))}
   *       <Button onClick={onClose}>Close</Button>
   *     </>
   *    )}
   *  </AssetSelector>
   * ```
   * */
  children?: ReactNode | ((args: ChildrenArguments) => ReactNode);
}

/**
 * A custom version of the `AssetSelector` that lets you customize the contents of the selector dialog.
 *
 * Use `AssetSelector.ListItem` inside the `AssetSelector.Custom` to render the options
 * of the selector. It is up for you to sort or group the options however you want.
 *
 * Example usage:
 *
 * ```tsx
 * const [value, setValue] = useState<Metadata | BalancesResponse>();
 * const [search, setSearch] = useState('');
 *
 * const filteredOptions = useMemo(
 *   () => mixedOptions.filter(filterMetadataOrBalancesResponseByText(search)),
 *   [search],
 * );
 *
 * return (
 *   <AssetSelector
 *     value={value}
 *     search={search}
 *     onChange={setValue}
 *     onSearchChange={setSearch}
 *   >
 *     {({ getKeyHash }) =>
 *       filteredOptions.map(option => (
 *         <AssetSelector.ListItem key={getKeyHash(option)} value={option} />
 *       ))
 *     }
 *   </AssetSelector>
 * );
 * ```
 */
export const AssetSelectorCustom = ({
  value,
  onChange,
  dialogTitle = 'Select Asset',
  actionType,
  disabled,
  children,
  search,
  onSearchChange,
}: AssetSelectorCustomProps) => {
  const layoutId = useId();

  const [isOpen, setIsOpen] = useState(false);

  const onClose = () => setIsOpen(false);

  return (
    <Dialog isOpen={isOpen} onClose={() => setIsOpen(false)}>
      <AssetSelectorContext.Provider value={{ onClose, onChange, value }}>
        <AssetSelectorTrigger
          value={value}
          actionType={actionType}
          disabled={disabled}
          layoutId={layoutId}
          key={layoutId}
          onClick={() => setIsOpen(true)}
        />

        <Dialog.Content
          title={dialogTitle}
          headerChildren={
            !!onSearchChange && (
              <AssetSelectorSearchFilter value={search} onChange={onSearchChange} />
            )
          }
        >
          <Dialog.RadioGroup value={value ? getHash(value) : undefined}>
            <div className='flex flex-col gap-1'>
              {typeof children === 'function'
                ? children({ onClose, getKeyHash: getHash })
                : children}
            </div>
          </Dialog.RadioGroup>
        </Dialog.Content>
      </AssetSelectorContext.Provider>
    </Dialog>
  );
};
