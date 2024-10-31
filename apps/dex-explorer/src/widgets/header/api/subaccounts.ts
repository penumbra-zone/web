import {
  AddressView,
  AddressView_Decoded,
  AddressIndex,
} from '@penumbra-zone/protobuf/penumbra/core/keys/v1/keys_pb';
import { useQuery } from '@tanstack/react-query';
import { ViewService } from '@penumbra-zone/protobuf';
import { penumbra } from '@/shared/const/penumbra';

const ACCOUNT_INDEXES = [0, 1, 2, 3, 4, 5];

const fetchQuery = async (): Promise<AddressView[]> => {
  const service = penumbra.service(ViewService);

  return Promise.all(
    ACCOUNT_INDEXES.map(async index => {
      const response = await service.addressByIndex({ addressIndex: { account: index } });

      return new AddressView({
        addressView: {
          case: 'decoded',
          value: new AddressView_Decoded({
            address: response.address,
            index: new AddressIndex({ account: index }),
          }),
        },
      });
    }),
  );
};

export const useSubaccounts = () => {
  return useQuery({
    queryKey: ['view-service-accounts'],
    queryFn: fetchQuery,
  });
};
