import { AuthorizeRequest } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/custody/v1alpha1/custody_pb';
import { DenomMetadata } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1alpha1/asset_pb';
import { InternalMessage } from './shared';
import { Jsonified } from '../jsonified';

export type TxApproval = InternalMessage<
  'TX-APPROVAL',
  {
    authorizeRequest: Jsonified<AuthorizeRequest>;
    denomMetadataByAssetId: Record<string, Jsonified<DenomMetadata>>;
  },
  boolean
>;
