import {
  AddressView_OpaqueSchema,
  AddressViewSchema,
} from '@penumbra-zone/protobuf/penumbra/core/keys/v1/keys_pb';
import { create } from '@bufbuild/protobuf';
import type { AddressView } from '@penumbra-zone/protobuf/penumbra/core/keys/v1/keys_pb';
import { Translator } from './types.js';

export const asOpaqueAddressView: Translator<AddressView> = addressView => {
  if (!addressView) {
    return create(AddressViewSchema);
  }

  if (addressView.addressView.case === 'opaque') {
    return addressView;
  }

  return create(AddressViewSchema, {
    addressView: {
      case: 'opaque',
      value: create(AddressView_OpaqueSchema, {
        address: addressView.addressView.value?.address,
      }),
    },
  });
};
