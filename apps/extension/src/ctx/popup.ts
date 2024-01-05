import type { GetTxApprovalFn } from '@penumbra-zone/router';
import { popupControl } from '../control/popup';

export const getTxApproval: GetTxApprovalFn = popupControl.txApproval;
