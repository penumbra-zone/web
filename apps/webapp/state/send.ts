import { Asset } from '../types/asset';
import { validateAmount, validateRecepient } from '../utils';
import { AllSlices, SliceCreator } from './index';

export interface SendValidationFields {
  recepient: boolean;
  amount: boolean;
}

export interface SendSlice {
  amount: string;
  asset: Asset | undefined;
  recepient: string;
  memo: string;
  hidden: boolean;
  validationErrors: SendValidationFields;
  setAmount: (txt: string) => void;
  setAsset: (asset: Asset) => void;
  setRecepient: (txt: string) => void;
  setMemo: (txt: string) => void;
  setHidden: (checked: boolean) => void;
}

export const createSendSlice = (): SliceCreator<SendSlice> => (set, get) => {
  return {
    amount: '',
    asset: undefined,
    recepient: '',
    memo: '',
    hidden: false,
    validationErrors: {
      recepient: false,
      amount: false,
    },
    setAmount: txt => {
      const { asset } = get().send;

      set(state => {
        state.send.amount = txt;
        state.send.validationErrors.amount = !asset ? false : validateAmount(txt, asset.balance);
      });
    },
    setAsset: asset => {
      const { amount } = get().send;

      set(state => {
        state.send.asset = asset;
        state.send.validationErrors.amount = validateAmount(amount, asset.balance);
      });
    },
    setRecepient: txt => {
      set(state => {
        state.send.recepient = txt;
        state.send.validationErrors.recepient = validateRecepient(txt);
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
