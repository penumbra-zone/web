import { InternalMessage } from './shared';
import { JsonValue } from '@bufbuild/protobuf';

// JsonValue === AuthorizeRequest
export type TxApproval = InternalMessage<'TX-APPROVAL', JsonValue, boolean>;
