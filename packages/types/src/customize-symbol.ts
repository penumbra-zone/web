import { Metadata } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import { assetPatterns } from '@penumbra-zone/constants/src/assets';

const SHORTENED_ID_LENGTH = 8;

// If the metadata is for a delegation or unbonding tokens, customize its symbol.
// We can't trust the validator's self-described name, so use their validator ID (in metadata.display).
export const customizeSymbol = (metadata: Metadata) => {
  const delegationMatch = assetPatterns.delegationToken.capture(metadata.display);
  if (delegationMatch) {
    const shortenedId = delegationMatch.id.slice(0, SHORTENED_ID_LENGTH);
    const customized = metadata.clone();
    customized.symbol = `delUM(${shortenedId}…)`;
    return customized;
  }

  const unbondingMatch = assetPatterns.unbondingToken.capture(metadata.display);
  if (unbondingMatch) {
    const shortenedId = unbondingMatch.id.slice(0, SHORTENED_ID_LENGTH);
    const customized = metadata.clone();
    customized.symbol = `unbondUMat${unbondingMatch.startAt}(${shortenedId}…)`;
    return customized;
  }

  return metadata;
};
