import { ElementType } from 'react';
import cn from 'clsx';
import { TransactionInfo } from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';
import { GetMetadataByAssetId } from '../ActionView/types';
import { getTransactionClassificationLabel } from '@penumbra-zone/perspective/transaction/classify';
import { useDensity } from '../utils/density';

export interface TransactionSummaryProps {
  info: TransactionInfo;
  getMetadataByAssetId?: GetMetadataByAssetId;
  as?: ElementType;
}

export const TransactionSummary = ({ info, getMetadataByAssetId, as: Container = 'div' }: TransactionSummaryProps) => {
  const density = useDensity();
  const label = getTransactionClassificationLabel(info.view);

  return (
    <Container className={cn()}>
      {label}
    </Container>
  );
};
