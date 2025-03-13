import {
  EquivalentValue,
  ValueViewSchema,
} from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { create } from '@bufbuild/protobuf';
import { createGetter } from './utils/create-getter.js';

export const asValueView = createGetter((equivalentValue?: EquivalentValue) =>
  equivalentValue
    ? create(ValueViewSchema, {
        valueView: {
          case: 'knownAssetId',
          value: {
            amount: equivalentValue.equivalentAmount,
            metadata: equivalentValue.numeraire,
          },
        },
      })
    : undefined,
);
