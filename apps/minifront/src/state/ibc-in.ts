import { AllSlices, SliceCreator } from '.';
import { getEphemeralAddress } from '../fetchers/address';

import { Address } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1/keys_pb';
import { PlainMessage, toPlainMessage } from '@bufbuild/protobuf';

export interface IbcInSlice {
  txInProgress: boolean;

  setAccount: (account: number) => Promise<void>;
  account: number;
  address: PlainMessage<Address>;

  shield: () => Promise<void>;
}

export const createIbcInSlice = (): SliceCreator<IbcInSlice> => set => {
  //const cosmosKit = get().cosmosKit;
  return {
    txInProgress: false,
    account: 0,
    address: toPlainMessage(new Address()),
    setAccount: async (account: number) => {
      const address = await getEphemeralAddress(account);
      set(state => {
        state.ibcIn.account = account;
        state.ibcIn.address = toPlainMessage(address);
      });
    },
    shield: async () => {
      /* not implemented */
    },
  };
};

export const ibcInSelector = (state: AllSlices) => state.ibcIn;
