import { MemoView } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1/transaction_pb';
import { Translator } from './types';
import { asOpaqueAddressView } from './address-view';

export const asOpaqueMemoView: Translator<MemoView> = memoView =>
  memoView?.memoView.case === 'opaque'
    ? memoView
    : new MemoView({
        memoView: {
          case: 'opaque',
          value: {},
        },
      });

export const asReceiverMemoView: Translator<MemoView> = memoView =>
  memoView?.memoView.case === 'opaque'
    ? memoView
    : new MemoView({
        memoView: {
          case: 'visible',
          value: {
            ...memoView?.memoView.value,

            ...(memoView?.memoView.value?.plaintext
              ? {
                  plaintext: {
                    ...memoView.memoView.value.plaintext,

                    ...(memoView.memoView.value.plaintext.returnAddress
                      ? {
                          returnAddress: asOpaqueAddressView(
                            memoView.memoView.value.plaintext.returnAddress,
                          ),
                        }
                      : {}),
                  },
                }
              : {}),
          },
        },
      });
