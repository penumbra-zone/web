import { BalancesRequest } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';
import { AssetId } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import { AddressIndex } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1/keys_pb';
import { viewClient } from '../../clients';
import { streamToPromise } from '../stream';

interface BalancesProps {
  accountFilter?: AddressIndex;
  assetIdFilter?: AssetId;
}

export const getBalances = ({ accountFilter, assetIdFilter }: BalancesProps = {}) => {
  const req = new BalancesRequest();
  if (accountFilter) req.accountFilter = accountFilter;
  if (assetIdFilter) req.assetIdFilter = assetIdFilter;

  const iterable = viewClient.balances(req);
  return streamToPromise(iterable);
};
