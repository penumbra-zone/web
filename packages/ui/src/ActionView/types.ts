import { ActionView } from '@penumbra-zone/protobuf/penumbra/core/transaction/v1/transaction_pb';
import { AssetId, Metadata } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';

export type ActionViewType = Exclude<ActionView['actionView']['case'], undefined>;

export type ActionViewValueType = Exclude<ActionView['actionView']['value'], undefined>;

export type GetMetadataByAssetId = (assetId: AssetId) => Metadata | undefined;
