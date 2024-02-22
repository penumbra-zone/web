import { Metadata } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import {
  assetPatterns,
  DelegationCaptureGroups,
  UnbondingCaptureGroups,
} from '@penumbra-zone/constants';

const DELEGATION_SYMBOL_LENGTH = 50 - 'delegation_penumbravalid1'.length;
const UNBONDING_SYMBOL_LENGTH = 41 - 'unbonding_epoch_'.length;

// If the metadata is for a delegation or unbonding tokens, customize its symbol.
// We can't trust the validator's self-described name, so use their validator ID (in metadata.display).
export const customizeSymbol = (metadata: Metadata) => {
  const delegationMatch = assetPatterns.delegationToken.exec(metadata.display);
  if (delegationMatch) {
    const { id } = delegationMatch.groups as unknown as DelegationCaptureGroups;
    const shortenedId = id.slice(0, DELEGATION_SYMBOL_LENGTH);
    metadata.symbol = `Delegated UM (${shortenedId}...)`;
  }

  const unbondingMatch = assetPatterns.unbondingToken.exec(metadata.display);
  if (unbondingMatch) {
    const { id, epoch } = unbondingMatch.groups as unknown as UnbondingCaptureGroups;
    const shortenedId = id.slice(0, UNBONDING_SYMBOL_LENGTH);
    metadata.symbol = `Unbonding UM, epoch ${epoch} (${shortenedId}...)`;
  }
};
