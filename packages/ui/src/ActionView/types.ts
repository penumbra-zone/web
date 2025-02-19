import { ActionView } from '@penumbra-zone/protobuf/penumbra/core/transaction/v1/transaction_pb';

export type ActionViewType = Exclude<ActionView['actionView']['case'], undefined>;

export type ActionViewValueType = Exclude<ActionView['actionView']['value'], undefined>;
