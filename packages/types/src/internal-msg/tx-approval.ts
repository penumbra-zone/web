import { AuthorizeRequest } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/custody/v1alpha1/custody_pb';
import { InternalMessage } from './shared';
import { Jsonified } from '../jsonified';
import { TransactionView } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1alpha1/transaction_pb';

export type TxApproval = InternalMessage<
  'TX-APPROVAL',
  {
    authorizeRequest: Jsonified<AuthorizeRequest>;
    transactionViewFromPlan: Jsonified<TransactionView>;
  },
  boolean
>;
