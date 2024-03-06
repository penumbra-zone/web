import { Metadata } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import {
  assetPatterns,
  DelegationCaptureGroups,
  UnbondingCaptureGroups,
} from '@penumbra-zone/constants';

const SHORTENED_ID_LENGTH = 8;

// If the metadata is for a delegation or unbonding tokens, customize its symbol.
// We can't trust the validator's self-described name, so use their validator ID (in metadata.display).
export const customizeSymbol = (metadata: Metadata) => {
  const delegationMatch = assetPatterns.delegationToken.exec(metadata.display);
  if (delegationMatch) {
    const { id } = delegationMatch.groups as unknown as DelegationCaptureGroups;
    const shortenedId = id.slice(0, SHORTENED_ID_LENGTH);
    const customized = metadata.clone();
    customized.symbol = `delUM(${shortenedId}…)`;
    return customized;
  }

  const unbondingMatch = assetPatterns.unbondingToken.exec(metadata.display);
  if (unbondingMatch) {
    const { id, epoch } = unbondingMatch.groups as unknown as UnbondingCaptureGroups;
    const shortenedId = id.slice(0, SHORTENED_ID_LENGTH);
    const customized = metadata.clone();
    customized.symbol = `unbondUMe${epoch}(${shortenedId}…)`;
    return customized;
  }

  return metadata;
};
