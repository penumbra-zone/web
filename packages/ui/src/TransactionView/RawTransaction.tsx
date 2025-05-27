import React from 'react';
import { JsonViewer } from '../JsonViewer';
import { typeRegistry } from '@penumbra-zone/protobuf';
import type { Jsonified } from '@penumbra-zone/types/jsonified';
import { TransactionView as PbTransactionView } from '@penumbra-zone/protobuf/penumbra/core/transaction/v1/transaction_pb';
import { SectionComponentProps } from './TransactionView';

// Use SectionComponentProps
export const RawTransaction: React.FC<SectionComponentProps> = ({ transactionToDisplay }) => {
  if (!transactionToDisplay) {
    return <div className='py-1 text-sm italic text-gray-500'>Raw JSON data unavailable.</div>;
  }

  const jsonToDisplay = transactionToDisplay.toJson({
    typeRegistry,
  }) as Jsonified<PbTransactionView>;

  return <JsonViewer data={jsonToDisplay} collapsed={true} />;
};
