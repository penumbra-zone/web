import {
  BalancesRequest,
  BalancesResponse,
  AssetId,
  AddressIndex,
} from '@penumbra-zone/protobuf/types';
import { viewClient } from '../../clients';

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

  const iterable = viewClient.balances(req);
  return Array.fromAsync(iterable);
};
