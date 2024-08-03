import {
  EquivalentValue,
  ValueView,
} from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { createGetter } from './utils/create-getter.js';

export const asValueView = createGetter((equivalentValue?: EquivalentValue) =>
  equivalentValue
    ? new ValueView({
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
