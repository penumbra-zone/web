import { ElementType, ReactNode } from 'react';
import cn from 'clsx';
import { TransactionInfo } from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';
import { GetMetadataByAssetId } from '../ActionView/types';
import { classifyTransaction } from '@penumbra-zone/perspective/transaction/classify';
import { findRelevantAssets } from '@penumbra-zone/perspective/action-view/relevant-assets';
import { TransactionClassification } from '@penumbra-zone/perspective/transaction/classification';
import { useDensity } from '../utils/density';

const getClassification = (info: TransactionInfo) => {
  const { type, action } = classifyTransaction(info.view);
  const assets = findRelevantAssets(action);
  const memo = info.view?.bodyView?.memoView?.memoView;

  const classes = {
    unknown: ['Unknown'],
    unknownInternal: ['Unknown (Internal)'],
    receive: ['Receive', 'from'],
    send: ['Send', 'to'],
    internalTransfer: ['Internal Transfer'],
    swap: ['Swap'],
    swapClaim: ['Swap Claim'],
    delegate: ['Delegate'],
    undelegate: ['Undelegate'],
    undelegateClaim: ['Undelegate Claim'],
    ics20Withdrawal: ['Ics20 Withdrawal'],
    dutchAuctionSchedule: ['Dutch Auction Schedule'],
    dutchAuctionEnd: ['Dutch Auction End'],
    dutchAuctionWithdraw: ['Dutch Auction Withdraw'],
    delegatorVote: ['Delegator Vote'],
    validatorVote: ['Validator Vote'],
    communityPoolDeposit: ['Community Pool Deposit'],
    communityPoolOutput: ['Community Pool Output'],
    communityPoolSpend: ['Community Pool Spend'],
    ibcRelayAction: ['IBC Relay Action'],
    positionClose: ['Position Close'],
    positionOpen: ['Position Open'],
    positionRewardClaim: ['Position Reward Claim'],
    positionWithdraw: ['Position Withdraw'],
    proposalDepositClaim: ['Proposal Deposit Claim'],
    proposalSubmit: ['Proposal Submit'],
    proposalWithdraw: ['Proposal Withdraw'],
    validatorDefinition: ['Validator Definition'],
    liquidityTournamentVote: ['Liquidity Tournament Vote'],
  } satisfies Record<TransactionClassification, [string] | [string, string, ReactNode]>;

  return classes[type];
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
  const [label] = getClassification(info);

  return (
    <Container
      className={cn(
        'h-[72px] w-full px-3 bg-other-tonalFill5 rounded-sm flex items-center text-text-primary',
      )}
    >
      {label}
    </Container>
  );
};
