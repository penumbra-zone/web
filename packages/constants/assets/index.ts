import { Metadata } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import LocalAssetRegistry from './local-asset-registry.json';
import { JsonValue } from '@bufbuild/protobuf';

export interface AssetPattens {
  lpNftPattern: RegExp;
  delegationTokenPattern: RegExp;
  proposalNftPattern: RegExp;
  unbondingTokenPattern: RegExp;
  votingReceiptPattern: RegExp;
}

export const assetPatterns: AssetPattens = {
  lpNftPattern: new RegExp('^lpnft_'),
  delegationTokenPattern: new RegExp('^delegation_'),
  proposalNftPattern: new RegExp('^proposal_'),
  unbondingTokenPattern: new RegExp('^unbonding_'),
  votingReceiptPattern: new RegExp('^voted_on_'),
};

export const localAssets: Metadata[] = LocalAssetRegistry.map(a =>
  Metadata.fromJson(a as JsonValue),
);
