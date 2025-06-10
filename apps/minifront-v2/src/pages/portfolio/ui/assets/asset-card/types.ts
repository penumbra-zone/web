import { AddressView } from '@penumbra-zone/protobuf/penumbra/core/keys/v1/keys_pb';
import { Metadata } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';

/**
 * Represents an asset with its display information
 */
export interface AssetData {
  id: string;
  name: string;
  symbol: string;
  amount: string;
  value: string | null;
  icon?: string;
  /** Original metadata for AssetIcon to access display denomination and other fields */
  originalMetadata?: Metadata;
}

/**
 * Represents an account with its assets
 */
export interface AccountData {
  id: string;
  name: string;
  assets: AssetData[];
  addressView?: AddressView;
}
