import {
  EquivalentValue,
  ValueView,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import { createGetter } from './utils/create-getter';

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
