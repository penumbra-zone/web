import { ReactNode, useId, useState } from 'react';
import styled from 'styled-components';
import { RadioGroup } from '@radix-ui/react-radio-group';
import { Dialog } from '../Dialog';
import { ActionType } from '../utils/ActionType.ts';
import { IsAnimatingProvider } from '../IsAnimatingProvider';
import { getHash, SelectorValue } from './utils/helpers.ts';
import { AssetSelectorContext } from './utils/Context.tsx';
import { AssetSelectorSearchFilter } from './SearchFilter.tsx';
import { AssetSelectorTrigger } from './Trigger.tsx';
import { ListItem } from './ListItem.tsx';

const OptionsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing(1)};
`;

interface ChildrenArguments {
  onClose: VoidFunction;
  /**
   * Takes the `Metadata` or `BalancesResponse` and returns
   * a unique key string to be used within map in React
   */
  getKeyHash: typeof getHash;
}

export interface AssetSelectorProps {
  /** The title to show above the asset selector dialog when it opens */
  dialogTitle: string;

  /** The currently selected `Metadata` or `BalancesResponse` */
  value?: SelectorValue;
  /** Fires when the new `ListItem` gets selected */
  onChange?: (value: SelectorValue) => void;

  actionType?: ActionType;
  disabled?: boolean;

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

  /** A value of the search filter inside the selector dialog */
  search?: string;
  /** Fires when user inputs the value into the search filter inside the selector dialog */
  onSearchChange?: (newValue: string) => void;
}

/**
 * Allows users to choose an asset for e.g., the swap and send forms. Note that
 * it can render an array of just `Metadata`s, or a mixed array of
 * both `Metadata`s and `BalancesResponse`s. The latter is useful for e.g.,
 * letting the user estimate a swap of an asset they don't hold.
 *
 * Use `AssetSelector.ListItem` inside the `AssetSelector` to render the options
 * of the selector. It is up to the consumer to sort or group the options however they want.
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
export const AssetSelector = ({
  value,
  onChange,
  dialogTitle,
  actionType,
  disabled,
  children,
  search,
  onSearchChange,
}: AssetSelectorProps) => {
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

        <IsAnimatingProvider>
          {props => (
            <Dialog.Content title={dialogTitle} motion={{ ...props, layoutId }} key={layoutId}>
              {onSearchChange && (
                <AssetSelectorSearchFilter value={search} onChange={onSearchChange} />
              )}

              <RadioGroup asChild>
                <OptionsWrapper>
                  {typeof children === 'function'
                    ? children({ onClose, getKeyHash: getHash })
                    : children}
                </OptionsWrapper>
              </RadioGroup>
            </Dialog.Content>
          )}
        </IsAnimatingProvider>
      </AssetSelectorContext.Provider>
    </Dialog>
  );
};

AssetSelector.ListItem = ListItem;
