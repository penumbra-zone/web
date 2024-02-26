import {
  BalancesRequest,
  BalancesResponse,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';
import {
  AssetId,
  Value,
  ValueView,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import { getAddressByIndex } from '../address';
import {
  AddressIndex,
  AddressView,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1/keys_pb';
import { viewClient } from '../../clients/grpc';
import { streamToPromise } from '../stream';

export interface AssetBalance {
  value: ValueView;
  address: AddressView;
  usdcValue: number;
}

interface BalancesProps {
  accountFilter?: AddressIndex;
  assetIdFilter?: AssetId;
}

const getBalances = ({ accountFilter, assetIdFilter }: BalancesProps = {}) => {
  const req = new BalancesRequest();
  if (accountFilter) req.accountFilter = accountFilter;
  if (assetIdFilter) req.assetIdFilter = assetIdFilter;

  const iterable = viewClient.balances(req);
  return streamToPromise(iterable);
};

export const getAssetBalances = async (): Promise<AssetBalance[]> => {
  const balances = await getBalances();
  const balancePromises = balances.map(constructAssetBalanceWithMetadata);
  return Promise.all(balancePromises);
};

const constructAssetBalanceWithMetadata = async ({
  balance,
  account,
}: BalancesResponse): Promise<AssetBalance> => {
  if (!balance) throw new Error('No balance in response');
  if (!account) throw new Error('No account in response');

  const value = await getValueView(balance);
  const address = await getAddressView(account);
  const usdcValue = await calculateUsdcValue(balance);

  return { value, address, usdcValue };
};

const getValueView = async (balance: Value): Promise<ValueView> => {
  if (!balance.assetId) throw new Error('no asset id in balance');
  if (!balance.amount) throw new Error('no amount in balance');

  const { denomMetadata } = await viewClient.assetMetadataById({ assetId: balance.assetId });

  if (!denomMetadata) {
    return new ValueView({
      valueView: { case: 'unknownAssetId', value: balance },
    });
  } else {
    return new ValueView({
      valueView: {
        case: 'knownAssetId',
        value: {
          amount: balance.amount,
          metadata: denomMetadata,
        },
      },
    });
  }
};

// @ts-expect-error TODO: implement actual pricing
// eslint-disable-next-line @typescript-eslint/no-unused-vars,@typescript-eslint/require-await
const calculateUsdcValue = async (balance: Value): Promise<number> => {
  return 0;
};

const getAddressView = async (index: AddressIndex): Promise<AddressView> => {
  const address = await getAddressByIndex(index.account);
  return new AddressView({
    addressView: {
      case: 'decoded',
      value: {
        address,
        index,
      },
    },
  });
};
