import { Asset } from '../types/asset';
import { validateAmount, validateRecipient } from '../utils';
import { AllSlices, SliceCreator } from './index';

export interface SendValidationFields {
  recipient: boolean;
  amount: boolean;
}

export interface SendSlice {
  amount: string;
  asset: Asset | undefined;
  recipient: string;
  memo: string;
  hidden: boolean;
  validationErrors: SendValidationFields;
  setAmount: (amount: string) => void;
  setAsset: (asset: Asset) => void;
  setRecipient: (addr: string) => void;
  setMemo: (txt: string) => void;
  setHidden: (checked: boolean) => void;
}

export const createSendSlice = (): SliceCreator<SendSlice> => (set, get) => {
  return {
    amount: '',
    asset: undefined,
    recipient: '',
    memo: '',
    hidden: false,
    validationErrors: {
      recipient: false,
      amount: false,
    },
    setAmount: amount => {
      const { asset } = get().send;

      set(state => {
        state.send.amount = amount;
        state.send.validationErrors.amount = !asset ? false : validateAmount(amount, asset.balance);
      });
    },
    setAsset: asset => {
      const { amount } = get().send;

      set(state => {
        state.send.asset = asset;
        state.send.validationErrors.amount = validateAmount(amount, asset.balance);
      });
    },
    setRecipient: addr => {
      set(state => {
        state.send.recipient = addr;
        state.send.validationErrors.recipient = validateRecipient(addr);
      });
    },
    setMemo: txt => {
      set(state => {
        state.send.memo = txt;
      });
    },
    setHidden: (checked: boolean) => {
      set(state => {
        state.send.hidden = checked;
      });
    },
  };
};

export const sendSelector = (state: AllSlices) => state.send;
