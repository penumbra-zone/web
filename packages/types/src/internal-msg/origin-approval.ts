import { InternalMessage } from './shared';

export type OriginApproval = InternalMessage<'ORIGIN-APPROVAL', string, boolean | undefined>;
