import { InternalMessage } from './shared';
import { JsonValue } from '@bufbuild/protobuf';

type AuthorizeRequestAsJson = JsonValue;
type DenomMetadataAsJson = JsonValue;

export type TxApproval = InternalMessage<
  'TX-APPROVAL',
  {
    authorizeRequest: AuthorizeRequestAsJson;
    denomMetadataByAssetId: Record<string, DenomMetadataAsJson>;
  },
  boolean
>;
