import { AuthorizeRequest } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/custody/v1/custody_pb';
import { AllSlices, SliceCreator } from '.';
import { PopupType, TxApproval } from '../message/popup';
import { TransactionView } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1/transaction_pb';
import { viewClient } from '../clients';
import { ConnectError } from '@connectrpc/connect';
import { errorToJson } from '@connectrpc/connect/protocol-connect';
import type {
  InternalRequest,
  InternalResponse,
} from '@penumbra-zone/types/src/internal-msg/shared';
import type { Jsonified, Stringified } from '@penumbra-zone/types/src/jsonified';
import { UserChoice } from '@penumbra-zone/types/src/user-choice';
import {
  classifyTransaction,
  TransactionClassification,
} from '@penumbra-zone/types/src/transaction';
import {
  asPublicTransactionView,
  asReceiverTransactionView,
} from '@penumbra-zone/types/src/translators/transaction-view';

export interface TxApprovalSlice {
  /**
   * Zustand doesn't like JsonValue, because the type is infinitely deep. And we
   * can't store instances of custom classes (like `TransactionView`s) in the
   * store, because we're using Immer middleware for Zustand, which requires
   * that everything be JSON-serializeable. So we'll store `Stringified`
   * representations of them instead.
   */
  responder?: (m: InternalResponse<TxApproval>) => void;
  authorizeRequest?: Stringified<AuthorizeRequest>;
  transactionView?: Stringified<TransactionView>;
  choice?: UserChoice;

  asSender?: Stringified<TransactionView>;
  asReceiver?: Stringified<TransactionView>;
  asPublic?: Stringified<TransactionView>;
  transactionClassification?: TransactionClassification;

  acceptRequest: (
    req: InternalRequest<TxApproval>,
    responder: (m: InternalResponse<TxApproval>) => void,
  ) => Promise<void>;

  setChoice: (choice: UserChoice) => void;

  sendResponse: () => void;
}

export const createTxApprovalSlice = (): SliceCreator<TxApprovalSlice> => (set, get) => ({
  acceptRequest: async (
    { request: { authorizeRequest: authReqJson, transactionView: txViewJson } },
    responder,
  ) => {
    const existing = get().txApproval;
    if (existing.authorizeRequest ?? existing.transactionView ?? existing.responder)
      throw new Error('Another request is still pending');

    const authorizeRequest = AuthorizeRequest.fromJson(authReqJson);
    const transactionView = TransactionView.fromJson(txViewJson);

    // pregenerate views from various perspectives.
    // TODO: should this be done in the component?
    const asSender = transactionView;
    const asPublic = asPublicTransactionView(transactionView);
    const asReceiver = await asReceiverTransactionView(transactionView, {
      // asRecieverTransactionView will need to ask viewClient about address provenace
      isControlledAddress: address =>
        viewClient.indexByAddress({ address }).then(({ addressIndex }) => Boolean(addressIndex)),
    });
    const transactionClassification = classifyTransaction(transactionView);

    set(state => {
      state.txApproval.responder = responder;
      state.txApproval.authorizeRequest = authorizeRequest.toJsonString();
      state.txApproval.transactionView = transactionView.toJsonString();

      state.txApproval.asSender = asSender.toJsonString();
      state.txApproval.asPublic = asPublic.toJsonString();
      state.txApproval.asReceiver = asReceiver.toJsonString();
      state.txApproval.transactionClassification = transactionClassification;

      state.txApproval.choice = undefined;
    });
  },

  setChoice: choice => {
    set(state => {
      state.txApproval.choice = choice;
    });
  },

  sendResponse: () => {
    const {
      responder,
      choice,
      transactionView: transactionViewString,
      authorizeRequest: authorizeRequestString,
    } = get().txApproval;

    if (!responder) throw new Error('No responder');

    try {
      if (choice === undefined || !transactionViewString || !authorizeRequestString)
        throw new Error('Missing response data');

      // zustand doesn't like jsonvalue so stringify
      const transactionView = TransactionView.fromJsonString(
        transactionViewString,
      ).toJson() as Jsonified<TransactionView>;
      const authorizeRequest = AuthorizeRequest.fromJsonString(
        authorizeRequestString,
      ).toJson() as Jsonified<AuthorizeRequest>;

      responder({
        type: PopupType.TxApproval,
        data: {
          choice,
          transactionView,
          authorizeRequest,
        },
      });
    } catch (e) {
      responder({
        type: PopupType.TxApproval,
        error: errorToJson(ConnectError.from(e), undefined),
      });
    } finally {
      set(state => {
        state.txApproval.responder = undefined;
        state.txApproval.authorizeRequest = undefined;
        state.txApproval.transactionView = undefined;
        state.txApproval.choice = undefined;

        state.txApproval.asSender = undefined;
        state.txApproval.asReceiver = undefined;
        state.txApproval.asPublic = undefined;
        state.txApproval.transactionClassification = undefined;
      });
    }
  },
});

export const txApprovalSelector = (state: AllSlices) => state.txApproval;
