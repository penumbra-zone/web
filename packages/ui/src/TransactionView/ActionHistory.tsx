import React from 'react';
import { ActionView as PbActionView } from '@penumbra-zone/protobuf/penumbra/core/transaction/v1/transaction_pb';
import { AssetId, Denom, Metadata } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { ActionView } from '../ActionView';
import { Connector } from './Connector';
import { Text } from '../Text';

interface ActionHistoryProps {
  actionViews?: PbActionView[];
  getTxMetadata: (assetIdOrDenom: AssetId | Denom | undefined) => Metadata | undefined;
}

export const ActionHistory: React.FC<ActionHistoryProps> = ({ actionViews, getTxMetadata }) => {
  if (!actionViews || actionViews.length === 0) {
    return <Text color='text.secondary'>No actions in this view.</Text>;
  }

  return (
    <div className='flex flex-col'>
      {actionViews.map((actionView, index) => (
        <React.Fragment key={index}>
          <ActionView action={actionView} getMetadata={getTxMetadata} />
          {index < actionViews.length - 1 && <Connector />}
        </React.Fragment>
      ))}
    </div>
  );
};
