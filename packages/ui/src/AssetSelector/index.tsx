import { Metadata } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { BalancesResponse } from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';
import { Dialog } from '../Dialog';
import { AssetSelectorDialogContent } from './AssetSelectorDialogContent';
import { useId, useState } from 'react';
import { AssetSelectorTrigger } from './Trigger.tsx';
import { ActionType } from '../utils/ActionType.ts';

export interface AssetSelectorProps<ValueType extends (BalancesResponse | Metadata) | Metadata> {
  /**
   * The currently selected `Metadata` or `BalancesResponse`.
   */
  value?: ValueType;
  onChange: (value: ValueType) => void;
  /**
   * An array of `Metadata`s and possibly `BalancesResponse`s to render as
   * options. If `BalancesResponse`s are included in the `options` array, those
   * options will be rendered with the user's balance of them.
   */
  options: ValueType[];
  /** The title to show above the asset selector dialog when it opens. */
  dialogTitle: string;

  actionType?: ActionType;
  disabled?: boolean;
}

/**
 * Allows users to choose an asset for e.g., the swap and send forms. Note that
 * the `options` prop can be an array of just `Metadata`s, or a mixed array of
 * both `Metadata`s and `BalancesResponse`s. The latter is useful for e.g.,
 * letting the user estimate a swap of an asset they don't hold.
 */
export const AssetSelector = <ValueType extends (BalancesResponse | Metadata) | Metadata>({
  value,
  onChange,
  options,
  dialogTitle,
  actionType,
  disabled,
}: AssetSelectorProps<ValueType>) => {
  const layoutId = useId();

  const [isOpen, setIsOpen] = useState(false);

  const handleChange = (newValue: ValueType) => {
    onChange(newValue);
    setIsOpen(false);
  };

  return (
    <Dialog isOpen={isOpen} onClose={() => setIsOpen(false)}>
      <Dialog.Trigger>
        <AssetSelectorTrigger
          value={value}
          actionType={actionType}
          disabled={disabled}
          layoutId={layoutId}
          key={layoutId}
          onClick={() => setIsOpen(true)}
        />
      </Dialog.Trigger>

      <AssetSelectorDialogContent
        title={dialogTitle}
        layoutId={layoutId}
        value={value}
        onChange={handleChange}
        options={options}
      />
    </Dialog>
  );
};
