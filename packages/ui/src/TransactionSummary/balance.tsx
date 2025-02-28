import { useMemo } from 'react';
import {
  Balance_SignedValue,
  ValueView,
} from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { GetMetadataByAssetId } from '../ActionView/types';
import { ValueViewComponent } from '../ValueView';
import { Density } from '../Density';

export interface SummaryBalanceProps {
  balance: Balance_SignedValue;
  getMetadataByAssetId?: GetMetadataByAssetId;
}

export const SummaryBalance = ({ balance, getMetadataByAssetId }: SummaryBalanceProps) => {
  const valueView = useMemo(() => {
    if (!balance.value?.amount) {
      return undefined;
    }

    const assetId = balance.value.assetId;
    const metadata = assetId && getMetadataByAssetId?.(assetId);
    if (metadata) {
      return new ValueView({
        valueView: {
          case: 'knownAssetId',
          value: {
            metadata,
            amount: balance.value.amount,
          },
        },
      });
    }

    return new ValueView({
      valueView: {
        case: 'unknownAssetId',
        value: {
          assetId,
          amount: balance.value.amount,
        },
      },
    });
  }, [balance, getMetadataByAssetId]);

  if (!valueView) {
    return null;
  }

  return (
    <Density slim>
      <ValueViewComponent
        valueView={valueView}
        showIcon={false}
        signed={balance.negated ? 'negative' : 'positive'}
        priority='tertiary'
      />
    </Density>
  );
};
