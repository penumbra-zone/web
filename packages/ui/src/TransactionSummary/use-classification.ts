import { useMemo } from 'react';
import { TransactionClassification } from '@penumbra-zone/perspective/transaction/classification';
import { Metadata } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { AddressView } from '@penumbra-zone/protobuf/penumbra/core/keys/v1/keys_pb';
import { TransactionInfo } from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';
import { classifyTransaction } from '@penumbra-zone/perspective/transaction/classify';
import { findRelevantAssets } from '@penumbra-zone/perspective/action-view/relevant-assets';
import {
  IbcRelay,
  Ics20Withdrawal,
} from '@penumbra-zone/protobuf/penumbra/core/component/ibc/v1/ibc_pb';
import { unpackIbcRelay } from '@penumbra-zone/perspective/action-view/ibc';
import { GetMetadataByAssetId } from '../ActionView/types';
import { isMetadata } from '../AssetSelector';
import { sumBalances, SummaryEffect } from './sum-balances';

interface SummaryData {
  type: TransactionClassification;
  effects: SummaryEffect[];
  label: string;
  memo?: string;
  additionalText?: string;
  assets: Metadata[];
  tickers?: string[];
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
  dutchAuctionSchedule: 'Auction Schedule',
  dutchAuctionEnd: 'Auction End',
  dutchAuctionWithdraw: 'Auction Withdraw',
  delegatorVote: 'Vote',
  validatorVote: 'Vote',
  communityPoolDeposit: 'Community Pool Deposit',
  communityPoolOutput: 'Community Pool Output',
  communityPoolSpend: 'Community Pool Spend',
  positionClose: 'Close Position',
  positionOpen: 'Open Position',
  positionWithdraw: 'Withdraw Position',
  positionRewardClaim: 'Claim Position Reward',
  proposalDepositClaim: 'Proposal Deposit Claim',
  proposalSubmit: 'Create Proposal',
  proposalWithdraw: 'Withdraw Proposal',
  validatorDefinition: 'Validator Definition',
  liquidityTournamentVote: 'Liquidity Tournament Vote',
};

/**
 * A hook that prepares data from TransactionInfo to be rendered in TransactionSummary.
 */
export const useClassification = (
  info: TransactionInfo,
  getMetadataByAssetId?: GetMetadataByAssetId,
) => {
  // classify the transaction and extract the main action
  const { type, action } = classifyTransaction(info.view);

  // categorize and sum up transaction summary effects
  const effects = sumBalances(info.summary?.effects ?? [], getMetadataByAssetId);

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
  const memoText = memo?.case === 'visible' ? (memo.value.plaintext?.text ?? '') : '';

  let data: SummaryData = {
    type,
    assets,
    effects,
    label: CLASSIFICATION_LABEL_MAP[type],
  };

  if (type === 'send') {
    data = {
      ...data,
      address,
      memo: memoText || DEFAULT_MEMO,
      additionalText: 'to',
    };
  }

  if (type === 'receive') {
    data = {
      ...data,
      address,
      memo: memoText || DEFAULT_MEMO,
      additionalText: 'from',
    };
  }

  if (type === 'swap' || type === 'swapClaim' || type === 'dutchAuctionSchedule') {
    data = {
      ...data,
      tickers: assets.map(asset => asset.symbol),
    };
  }

  if (type === 'ibcRelayAction' && action?.actionView.value) {
    const unpacked = unpackIbcRelay(action.actionView.value as IbcRelay);
    if (unpacked?.tokenData) {
      data = {
        ...data,
        additionalText: 'from',
        memo: unpacked.tokenData.memo || memoText || DEFAULT_MEMO,
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

  if (type === 'ics20Withdrawal' && action?.actionView.value) {
    const value = action.actionView.value as Ics20Withdrawal;

    data = {
      ...data,
      additionalText: 'to',
      memo: value.ics20Memo || memoText || DEFAULT_MEMO,
      address: new AddressView({
        addressView: {
          case: 'opaque',
          value: {
            address: {
              altBech32m: value.destinationChainAddress,
            },
          },
        },
      }),
    };
  }

  if (type === 'delegate' && action?.actionView.value) {
    // const value = action.actionView.value as Delegate;
    data = {
      ...data,
      // additionalText: 'to',
      // TODO: map validator IdentityKey to an address (how?)
    };
  }

  return data;
};
