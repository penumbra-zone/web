import {
  BalancesRequest,
  BalancesResponse,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb.js';
import { AssetId } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb.js';
import { AddressIndex } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1/keys_pb.js';
import { ViewService } from '@penumbra-zone/protobuf';
import { praxClient } from '../../prax';

interface BalancesProps {
  accountFilter?: AddressIndex;
  assetIdFilter?: AssetId;
}

export const getBalances = ({ accountFilter, assetIdFilter }: BalancesProps = {}): Promise<
  BalancesResponse[]
> => {
  const req = new BalancesRequest();
  if (accountFilter) {
    req.accountFilter = accountFilter;
  }
  if (assetIdFilter) {
    req.assetIdFilter = assetIdFilter;
  }

  const iterable = praxClient.service(ViewService).balances(req);
  return Array.fromAsync(iterable);
};
