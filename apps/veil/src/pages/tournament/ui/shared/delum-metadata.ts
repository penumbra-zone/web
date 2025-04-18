import { Metadata } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';

const GENERIC_DELUM_DENOM =
  'delegation_penumbravalid12s9lanucncnyasrsqgy6z532q7nwsw3aqzzeqas55kkpyf6lhsqs2w0zar';

/**
 * This delUM metadata is only needed to render the asset in the UI.
 * Use it ONLY if you're sure the asset should be a delUM.
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
