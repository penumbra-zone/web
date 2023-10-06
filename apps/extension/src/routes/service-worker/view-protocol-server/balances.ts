import {
  BalancesRequest,
  BalancesResponse,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1alpha1/view_pb';
import {
  addLoHi,
  Base64Str,
  base64ToUint8Array,
  IndexedDbInterface,
  NewNoteRecord,
  uint8ArrayToBase64,
} from 'penumbra-types';
import { ViewReqMessage } from './helpers/generic';
import { AddressIndex } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1alpha1/keys_pb';
import {
  AssetId,
  Value,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1alpha1/asset_pb';
import { Amount } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/num/v1alpha1/num_pb';

type AssetIdStr = Base64Str;
type BalancesMap = Record<AssetIdStr, BalancesResponse>;
type AccountMap = Record<AddressIndex['account'], BalancesMap>;

export const isBalancesRequest = (msg: ViewReqMessage): msg is BalancesRequest => {
  return msg.getType().typeName === BalancesRequest.typeName;
};

const initializeProto = (noteRecord: NewNoteRecord, accountNumber: number): BalancesResponse =>
  new BalancesResponse({
    account: new AddressIndex({
      account: accountNumber,
      randomizer: base64ToUint8Array(noteRecord.addressIndex.randomizer),
    }),
    balance: new Value({
      amount: new Amount({ hi: 0n, lo: 0n }),
      assetId: new AssetId({ inner: base64ToUint8Array(noteRecord.note.value.assetId.inner) }),
    }),
  });

// Handles aggregating amounts and filtering by account number/asset id
export const handleBalancesReq = async function* (
  req: BalancesRequest,
  indexedDb: IndexedDbInterface,
): AsyncIterable<BalancesResponse> {
  const allNotes = await indexedDb.getAllNotes();

  const accounts: AccountMap = {};

  for (const noteRecord of allNotes) {
    const accountNumber = noteRecord.addressIndex.account ?? 0;
    if (!accounts[accountNumber]) {
      accounts[accountNumber] = {};
    }

    const assetId = noteRecord.note.value.assetId.inner;
    if (!accounts[accountNumber]![assetId]) {
      accounts[accountNumber]![assetId] = initializeProto(noteRecord, accountNumber);
    }

    // Many type overrides, but initialization above guarantees presence
    const amount = accounts[accountNumber]![assetId]!.balance!.amount!;

    // Doing some amount aggregation assetIds have a total amount
    const newAmount = addLoHi(
      { lo: amount.lo, hi: amount.hi },
      {
        lo: BigInt(noteRecord.note.value.amount.lo),
        hi: BigInt(noteRecord.note.value.amount.hi ?? 0n),
      },
    );
    amount.lo = newAmount.lo;
    amount.hi = newAmount.hi;
  }

  const responses = Object.entries(accounts)
    .filter(
      ([accountNumber]) =>
        !req.accountFilter || // No account filter requested
        Number(accountNumber) === req.accountFilter.account, // Address indexes match
    )
    .flatMap(([, balances]) =>
      Object.entries(balances)
        .filter(
          ([assetId]) =>
            !req.assetIdFilter || // No asset id filter requested
            assetId === uint8ArrayToBase64(req.assetIdFilter.inner), // Asset id's match
        )
        .map(([, balances]) => balances),
    );

  yield* responses;
};
