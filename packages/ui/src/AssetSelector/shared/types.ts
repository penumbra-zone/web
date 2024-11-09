import { BalancesResponse } from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';
import { Metadata } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { ActionType } from '../../utils/action-type';

export type AssetSelectorValue = BalancesResponse | Metadata;

export interface AssetSelectorBaseProps {
  /** The value of the selected asset or balance */
  value?: AssetSelectorValue;

  /** Callback when the selected asset or balance changes */
  onChange?: (value: AssetSelectorValue) => void;

  /** The title of the dialog */
  dialogTitle?: string;

  /**
   * What type of action is this component related to? Leave as `default` for most
   * buttons, set to `accent` for the single most important action on a given
   * page, set to `unshield` for actions that will unshield the user's funds,
   * and set to `destructive` for destructive actions.
   *
   * Default: `default`
   */
  actionType?: ActionType;

  /** Whether the asset selector is disabled */
  disabled?: boolean;
}
