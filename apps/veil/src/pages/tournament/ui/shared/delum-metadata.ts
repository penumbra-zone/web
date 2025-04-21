import { Metadata } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';

const GENERIC_DELUM_DENOM =
  'delegation_penumbravalid12s9lanucncnyasrsqgy6z532q7nwsw3aqzzeqas55kkpyf6lhsqs2w0zar';

/**
 * TODO: remove this in favor of correct delUM—UM conversion
 * https://github.com/penumbra-zone/web/pull/2269#pullrequestreview-2780489876
 */
export const GENERIC_DELUM = new Metadata({
  denomUnits: [
    {
      denom: GENERIC_DELUM_DENOM,
      exponent: 6,
    },
  ],
  display: GENERIC_DELUM_DENOM,
  symbol: 'delUM',
});
