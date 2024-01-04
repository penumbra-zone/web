import { createContextKey } from '@connectrpc/connect';

import { ExtensionStorage, LocalStorageState, SessionStorageState } from '@penumbra-zone/storage';
import type { ServicesInterface } from '@penumbra-zone/types';

import { WalletId } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1alpha1/keys_pb';
import {
  Action,
  WitnessData,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1alpha1/transaction_pb';
import { AuthorizeRequest } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/custody/v1alpha1/custody_pb';
import { WitnessAndBuildRequest } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1alpha1/view_pb';

// this interface requires awareness of extension internals, and should be refactored
export interface OffscreenCtx {
  buildAction: (
    arg: WitnessAndBuildRequest,
    witness: WitnessData,
    fullViewingKey: string,
  ) => Promise<Action[]>;
}
export const offscreenCtx = createContextKey({} as OffscreenCtx);

// these context values provide broad access to storage, to maintain existing
// impl. they are too tightly coupled to our extension and should be refactored
export const servicesCtx = createContextKey({} as ServicesInterface);
export const extLocalCtx = createContextKey({} as ExtensionStorage<LocalStorageState>);
export const extSessionCtx = createContextKey({} as ExtensionStorage<SessionStorageState>);

// these are good examples: simple functions, using types from spec
export type AssertWalletIdFn = (walletId?: WalletId) => Promise<void>;
export type GetTxApprovalFn = (authReq: AuthorizeRequest) => Promise<void>;

// init ctx with safe defaults, and require adapter to provide a working value
export const assertWalletIdCtx = createContextKey<AssertWalletIdFn>(() => Promise.reject());
export const getTxApprovalCtx = createContextKey<GetTxApprovalFn>(() => Promise.reject());
