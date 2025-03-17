import {
  BalancesRequestSchema,
  BalancesResponse,
} from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';
import { create } from '@bufbuild/protobuf';
import { AssetId } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { AddressIndex } from '@penumbra-zone/protobuf/penumbra/core/keys/v1/keys_pb';
import { ViewService } from '@penumbra-zone/protobuf';
import { penumbra } from '../../penumbra';

export interface BalancesProps {
  accountFilter?: AddressIndex;
  assetIdFilter?: AssetId;
}

export const getBalances = ({ accountFilter, assetIdFilter }: BalancesProps = {}): Promise<
  BalancesResponse[]
> => {
  const req = create(BalancesRequestSchema, {});
  if (accountFilter) {
    req.accountFilter = accountFilter;
  }
  if (assetIdFilter) {
    req.assetIdFilter = assetIdFilter;
  }

  const iterable = penumbra.service(ViewService).balances(req);
  return Array.fromAsync(iterable);
};

export const getBalancesStream = ({
  accountFilter,
  assetIdFilter,
}: BalancesProps = {}): AsyncIterable<BalancesResponse> => {
  const req = create(BalancesRequestSchema);
  if (accountFilter) {
    req.accountFilter = accountFilter;
  }
  if (assetIdFilter) {
    req.assetIdFilter = assetIdFilter;
  }

  return penumbra.service(ViewService).balances(req);
};
