import { ActionView } from '@penumbra-zone/protobuf/penumbra/core/transaction/v1/transaction_pb';
import { AssetId, Metadata, Denom } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';

export type ActionViewType = Exclude<ActionView['actionView']['case'], undefined>;

export type ActionViewValueType = Exclude<ActionView['actionView']['value'], undefined>;

export type GetMetadata = (assetId: AssetId | Denom) => Metadata | undefined;

export interface ActionViewBaseProps {
  /**
   * A helper function that is needed to match action assets with their metadata.
   * Can be omitted, but it generally improves the rendering logic, especially for opaque views.
   * If omitted, some assets may be rendered as unknown.
   */
  getMetadata?: GetMetadata;
}
