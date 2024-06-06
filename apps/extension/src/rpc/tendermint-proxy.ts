import type { PromiseClient, ServiceImpl } from '@connectrpc/connect';
import { TendermintProxyService } from '@penumbra-zone/protobuf';

/**
 * This function is used to create a proxy that clobbers the nanos on the block
 * header timestamp and removes the list of commit signatures from the block.
 * Minifront doesn't use this request for anything related to consensus, so it's
 * safe for Minifront, but it may break other consumers.
 *
 * This is necessary because the CometBFT nanos field does not comply with the
 * google.protobuf.Timestamp spec, and may include negative nanos. This causes
 * failures when re-serializing the block header: bufbuild deserializes the
 * negative nanos, but refuses to re-serialize.
 *
 * Ideally,
 * - cometbft serialization should be compliant with google.protobuf.Timestamp
 * - bufbuild should provide JsonSerializationOption to disable the error
 *
 * We should explore PRing bufbuild or monkey-patching the serialization.
 */
export const makeTendermintProxyZeroNanos = (
  c: PromiseClient<typeof TendermintProxyService>,
): Pick<ServiceImpl<typeof TendermintProxyService>, 'getBlockByHeight'> => ({
  getBlockByHeight: async req => {
    const r = await c.getBlockByHeight(req);
    if (r.block?.header?.time?.nanos) r.block.header.time.nanos = 0;
    if (r.block?.lastCommit?.signatures.length) r.block.lastCommit.signatures = [];
    return r;
  },
});
