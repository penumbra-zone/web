import {
  EquivalentValue,
  ValueView,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb.js';
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
