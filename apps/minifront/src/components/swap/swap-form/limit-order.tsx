import { SwapSlice } from '../../../state/swap';
import { isValidAmount } from '../../../state/helpers.ts';
import { getAddressIndex } from '@penumbra-zone/getters/address-view';
import { TransactionPlannerRequest } from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';

const assembleSwapRequest = async ({
  assetIn,
  amount,
  assetOut,
}: Pick<SwapSlice, 'assetIn' | 'assetOut' | 'amount'>) => {
  if (!assetIn) {
    throw new Error('`assetIn` is undefined');
  }
  if (!assetOut) {
    throw new Error('`assetOut` is undefined');
  }
  if (!isValidAmount(amount, assetIn)) {
    throw new Error('Invalid amount');
  }

  const addressIndex = getAddressIndex(assetIn.accountAddress);

  return new TransactionPlannerRequest({
    positionOpens: [
      {
        position: {
          phi: {
            component: { p: { lo: '1000000' }, q: { lo: '1000000' } },
            pair: {
              asset1: { inner: 'HW2Eq3UZVSBttoUwUi/MUtE7rr2UU7/UH500byp7OAc=' },
              asset2: { inner: 'KeqcLzNx9qSH5+lcJHBB9KNW+YPrBk5dKzvPMiypahA=' },
            },
          },
          nonce: 'QvdZ/22Fhufk9ea3nxSedhYP3C0LHW5HtbMlp27aIpY=',
          state: { state: 'POSITION_STATE_ENUM_OPENED' },
          reserves: { r1: {}, r2: { lo: '1000000' } },
          closeOnFill: true,
        },
      },
    ],
    source: getAddressIndex(assetIn.accountAddress),
  });
};

export const LimitOrder = () => {
  return (
    <div>
      <h1>Limit order</h1>
      <button>SEND LIMIT ORDER</button>
    </div>
  );
};
