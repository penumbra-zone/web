import { useMemo } from 'react';
import { TransactionClassification } from '@penumbra-zone/perspective/transaction/classification';
import {
  Metadata,
  Denom,
  Value,
  Balance,
  AssetImage,
} from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { AddressView } from '@penumbra-zone/protobuf/penumbra/core/keys/v1/keys_pb';
import { TransactionInfo } from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';
import { classifyTransaction } from '@penumbra-zone/perspective/transaction/classify';
import { findRelevantAssets } from '@penumbra-zone/perspective/action-view/relevant-assets';
import {
  IbcRelay,
  Ics20Withdrawal,
} from '@penumbra-zone/protobuf/penumbra/core/component/ibc/v1/ibc_pb';
import { unpackIbcRelay } from '@penumbra-zone/perspective/action-view/ibc';
import { GetMetadata } from '../ActionView/types';
import { isMetadata } from '../AssetSelector';
import { adaptEffects, SummaryEffect } from './adapt-effects';
import { fromString } from '@penumbra-zone/types/amount';
import { addressFromBech32m } from '@penumbra-zone/bech32m/penumbra';
import { TransactionSummary_Effects } from '@penumbra-zone/protobuf/penumbra/core/transaction/v1/transaction_pb';

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
export const useClassification = (info: TransactionInfo, getMetadataByAssetId?: GetMetadata) => {
  // classify the transaction and extract the main action
  const { type, action } = classifyTransaction(info.view);

  // categorize and sum up transaction summary effects
  const effects = adaptEffects(info.summary?.effects ?? [], getMetadataByAssetId);

  // Special handling for deposit transactions that may not have summary effects
  let enhancedEffects = effects;
  if (type === 'ibcRelayAction' && effects.length === 0 && info.view?.bodyView?.actionViews) {
    // For deposit transactions without effects, extract balance info from IBC relay actions
    const ibcRelayActions = info.view.bodyView.actionViews.filter(
      actionView => actionView.actionView.case === 'ibcRelayAction',
    );

    if (ibcRelayActions.length > 0) {
      const depositEffects: TransactionSummary_Effects[] = [];

      for (const ibcAction of ibcRelayActions) {
        try {
          const unpacked = unpackIbcRelay(ibcAction.actionView.value as IbcRelay);
          if (unpacked?.tokenData && unpacked.packet) {
            const receiverAddress = unpacked.tokenData.receiver;

            // Try to parse the receiver address to create AddressView
            let receiverAddressView: AddressView | undefined;
            try {
              if (receiverAddress) {
                const parsedAddress = addressFromBech32m(receiverAddress);
                receiverAddressView = new AddressView({
                  addressView: {
                    case: 'opaque',
                    value: {
                      address: parsedAddress,
                    },
                  },
                });
              }
            } catch (error) {
              console.warn('Failed to parse receiver address:', error);
            }

            const amount = fromString(unpacked.tokenData.amount);
            let assetDenom = unpacked.tokenData.denom;

            // Try to get metadata by denom first
            let asset = getMetadataByAssetId?.(new Denom({ denom: assetDenom }));

            if (!asset) {
              // Sometimes denom comes in form of "uosmo", and sometimes as "transfer/channel-4/uosmo",
              // where "transfer" is `sourcePort` and "channel-4" is `sourceChannel`.
              // Extract the denom part and merge it with destination data.
              // Penumbra is the only asset that doesn't have "transfer" in the denom – hardcode it here.
              const denomMatch = /\/([^/]+)$/.exec(unpacked.tokenData.denom);
              assetDenom = `${unpacked.packet.destinationPort}/${unpacked.packet.destinationChannel}/${denomMatch?.[1] ?? unpacked.tokenData.denom}`;
              if (unpacked.tokenData.denom === 'upenumbra' || denomMatch?.[1] === 'upenumbra') {
                assetDenom = 'upenumbra';
              }

              asset = getMetadataByAssetId?.(new Denom({ denom: assetDenom }));
            }

            // Create a TransactionSummary_Effects object
            if ((asset || assetDenom) && receiverAddressView) {
              const effectValues = [];

              if (asset?.penumbraAssetId) {
                effectValues.push({
                  negated: true, // true means positive (adaptEffects uses !balance.negated)
                  value: new Value({
                    amount: amount,
                    assetId: asset.penumbraAssetId,
                  }),
                });
              }

              if (effectValues.length > 0) {
                depositEffects.push(
                  new TransactionSummary_Effects({
                    address: receiverAddressView,
                    balance: new Balance({
                      values: effectValues,
                    }),
                  }),
                );
              }
            }
          }
        } catch (error) {
          // console.log('Error unpacking IBC relay:', error);
        }
      }

      // Process the deposit effects through adaptEffects to get proper address resolution
      if (depositEffects.length > 0) {
        enhancedEffects = adaptEffects(depositEffects, getMetadataByAssetId);
      }
    }
  }

  // extract the assets from the main transaction action
  const relevantAssets = findRelevantAssets(action);
  const assets = useMemo(() => {
    const processedAssets = relevantAssets
      .map(asset => {
        if (isMetadata(asset)) {
          // For delegation tokens from findRelevantAssets, we need to properly transform them
          if (asset.display.startsWith('delegation_')) {
            // Create a new metadata object with the correct symbol for delegation tokens
            // This will have the correct symbol so AssetGroup can identify it as delegated
            const enhancedDelegationMetadata = new Metadata({
              symbol: 'delUM', // Use the standardized delegation symbol
              name: 'Delegated Penumbra',
              display: asset.display, // Keep the original display for reference
              images: [
                new AssetImage({
                  svg: 'https://raw.githubusercontent.com/prax-wallet/registry/main/images/um.svg',
                }),
              ],
            });
            return enhancedDelegationMetadata;
          }
          // For other metadata objects, assume they're already enhanced
          return asset;
        }
        // For AssetId objects, get metadata through the normal flow
        const metadata = getMetadataByAssetId?.(asset);
        return metadata; // Use the (already enhanced) metadata directly
      })
      .filter(Boolean) as Metadata[];

    return processedAssets;
  }, [getMetadataByAssetId, relevantAssets]);

  const memo = info.view?.bodyView?.memoView?.memoView;
  const address = memo?.case === 'visible' ? memo.value.plaintext?.returnAddress : undefined;
  const memoText = memo?.case === 'visible' ? (memo.value.plaintext?.text ?? '') : '';

  let data: SummaryData = {
    type,
    assets,
    effects: enhancedEffects,
    label: CLASSIFICATION_LABEL_MAP[type],
  };

  // If this is a deposit and we have enhancedEffects, use assets from there
  if (type === 'ibcRelayAction' && enhancedEffects.length > 0 && effects.length === 0) {
    const depositAssets = enhancedEffects
      .flatMap(effect =>
        effect.balances.map(balance => {
          if (balance.view.valueView.case === 'knownAssetId') {
            return balance.view.valueView.value.metadata; // Metadata is already enhanced
          }
          return undefined;
        }),
      )
      .filter(Boolean) as Metadata[];
    data.assets = depositAssets; // Metadata is already enhanced
  }

  if (type === 'send') {
    // For send transactions, look at the effects to find the recipient address
    // The recipient is typically the account with positive balance changes
    const recipientEffect = enhancedEffects.find(
      effect => effect.balances.some(balance => !balance.negative) && effect.address,
    );

    data = {
      ...data,
      address: recipientEffect?.address ?? address,
      memo: memoText || DEFAULT_MEMO,
      additionalText: 'to',
    };
  }

  if (type === 'receive') {
    // For receive transactions, the address from memo is typically the sender
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

  if (type === 'internalTransfer') {
    // For internal transfers, find the source and destination accounts
    const sourceEffect = enhancedEffects.find(
      effect => effect.balances.some(balance => balance.negative) && effect.address,
    );
    const destinationEffect = enhancedEffects.find(
      effect => effect.balances.some(balance => !balance.negative) && effect.address,
    );

    data = {
      ...data,
      address: destinationEffect?.address ?? sourceEffect?.address,
      memo: memoText || DEFAULT_MEMO,
      additionalText: destinationEffect?.address ? 'to' : 'from',
    };
  }

  // for position close/withdraw actions, there are usually no icons – create stub metadata
  if (type === 'positionClose') {
    data = {
      ...data,
      assets: [
        new Metadata({
          display: 'lpnft_closed_',
        }),
      ],
    };
  }

  if (type === 'positionWithdraw') {
    data = {
      ...data,
      assets: [
        new Metadata({
          display: 'lpnft_withdrawn_',
        }),
      ],
    };
  }

  return data;
};
