import cn from 'clsx';
import { ElementType, useMemo } from 'react';
import { TransactionInfo } from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';
import { TransactionClassification } from '@penumbra-zone/perspective/transaction/classification';
import { AddressView } from '@penumbra-zone/protobuf/penumbra/core/keys/v1/keys_pb';
import { Metadata } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { classifyTransaction } from '@penumbra-zone/perspective/transaction/classify';
import { findRelevantAssets } from '@penumbra-zone/perspective/action-view/relevant-assets';
import { GetMetadataByAssetId } from '../ActionView/types';
import { isMetadata } from '../AssetSelector';
import { useDensity } from '../utils/density';
import { AssetGroup } from '../AssetIcon';
import { Pill } from '../Pill';
import { Text } from '../Text';
import { AddressViewComponent } from '../AddressView';
import { unpackIbcRelay } from '@penumbra-zone/perspective/action-view/ibc';
import { IbcRelay } from '@penumbra-zone/protobuf/penumbra/core/component/ibc/v1/ibc_pb';

interface SummaryData {
  type: TransactionClassification;
  label: string;
  memo?: string;
  additionalText?: string;
  assets: Metadata[];
  address?: AddressView;
}

const DEFAULT_MEMO = 'Memo empty';

const CLASSIFICATION_LABEL_MAP: Record<TransactionClassification, string> = {
  unknown: 'Unknown',
  unknownInternal: 'Unknown (Internal)',
  receive: 'Receive',
  send: 'Send',
  internalTransfer: 'Internal Transfer',
  ics20Withdrawal: 'Withdrawal',
  ibcRelayAction: 'Deposit',
  swap: 'Swap',
  swapClaim: 'Swap Claim',
  delegate: 'Delegate',
  undelegate: 'Undelegate',
  undelegateClaim: 'Undelegate Claim',
  dutchAuctionSchedule: 'Dutch Auction Schedule',
  dutchAuctionEnd: 'Dutch Auction End',
  dutchAuctionWithdraw: 'Dutch Auction Withdraw',
  delegatorVote: 'Delegator Vote',
  validatorVote: 'Validator Vote',
  communityPoolDeposit: 'Community Pool Deposit',
  communityPoolOutput: 'Community Pool Output',
  communityPoolSpend: 'Community Pool Spend',
  positionClose: 'Position Close',
  positionOpen: 'Position Open',
  positionRewardClaim: 'Position Reward Claim',
  positionWithdraw: 'Position Withdraw',
  proposalDepositClaim: 'Proposal Deposit Claim',
  proposalSubmit: 'Proposal Submit',
  proposalWithdraw: 'Proposal Withdraw',
  validatorDefinition: 'Validator Definition',
  liquidityTournamentVote: 'Liquidity Tournament Vote',
};

const useClassification = (info: TransactionInfo, getMetadataByAssetId?: GetMetadataByAssetId) => {
  // classify the transaction and extract the main action
  const { type, action } = classifyTransaction(info.view);

  // extract the assets from the main transaction action
  const relevantAssets = findRelevantAssets(action);
  const assets = useMemo(() => {
    return relevantAssets
      .map(asset => {
        if (isMetadata(asset)) {
          return asset;
        }
        return getMetadataByAssetId?.(asset);
      })
      .filter(Boolean) as Metadata[];
  }, [getMetadataByAssetId, relevantAssets]);

  const memo = info.view?.bodyView?.memoView?.memoView;
  const address = memo?.case === 'visible' ? memo.value.plaintext?.returnAddress : undefined;
  const memoText = memo?.case === 'visible' ? memo.value.plaintext?.text : undefined;

  let data: SummaryData = {
    type,
    assets,
    label: CLASSIFICATION_LABEL_MAP[type],
  };

  if (type === 'send') {
    data = {
      ...data,
      address,
      memo: memoText ?? DEFAULT_MEMO,
      additionalText: 'to',
    };
  }

  if (type === 'receive') {
    data = {
      ...data,
      address,
      memo: memoText ?? DEFAULT_MEMO,
      additionalText: 'from',
    };
  }

  if (type === 'ibcRelayAction' && action?.actionView.value) {
    const unpacked = unpackIbcRelay(action.actionView.value as IbcRelay);
    if (unpacked?.tokenData) {
      data = {
        ...data,
        additionalText: 'from',
        memo: unpacked.tokenData.memo || DEFAULT_MEMO,
        address: new AddressView({
          addressView: {
            case: 'opaque',
            value: {
              address: {
                altBech32m: unpacked.tokenData.sender,
              },
            },
          },
        }),
      };
    }
  }

  return data;
};

export interface TransactionSummaryProps {
  info: TransactionInfo;
  getMetadataByAssetId?: GetMetadataByAssetId;
  as?: ElementType;
}

export const TransactionSummary = ({
  info,
  getMetadataByAssetId,
  as: Container = 'div',
}: TransactionSummaryProps) => {
  const density = useDensity();
  const { label, assets, additionalText, address, memo, type } = useClassification(
    info,
    getMetadataByAssetId,
  );

  return (
    <Container
      className={cn(
        'h-[72px] w-full px-3 bg-other-tonalFill5 rounded-sm flex items-center text-text-primary',
      )}
    >
      <AssetGroup assets={assets} />
      <div className='flex flex-col'>
        <div className='flex items-center gap-1 text-text-secondary'>
          <Pill priority='primary' context='technical-default'>
            {label}
          </Pill>
          {additionalText && <Text detailTechnical>{additionalText}</Text>}
          {address && (
            <AddressViewComponent addressView={address} external={type === 'ibcRelayAction'} />
          )}
        </div>
        {memo && (
          <Text color='text.secondary' detailTechnical>
            {memo}
          </Text>
        )}
      </div>
    </Container>
  );
};
