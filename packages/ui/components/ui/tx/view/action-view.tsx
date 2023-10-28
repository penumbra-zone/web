import { ActionView } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1alpha1/transaction_pb';
import { ViewBox } from './viewbox';
import { OutputView, SpendView } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/shielded_pool/v1alpha1/shielded_pool_pb';
import { SpendViewComponent } from './spend';
import { OutputViewComponent } from './output';

const ActionViewComponent: React.FC<{ actionView: ActionView }> = ({ actionView }) => {
    const av = actionView;
    // Dispatch to each action type
    if (av.actionView?.case === 'spend') {
        return (<SpendViewComponent value={av.actionView?.value as SpendView} />);
    }
    if (av.actionView?.case === 'output') {
        return (<OutputViewComponent value={av.actionView?.value as OutputView} />);
    }
    if (av.actionView?.case === 'swap') {
        return (<ViewBox label='Swap' />);
    }
    if (av.actionView?.case === 'swapClaim') {
        return (<ViewBox label='Swap Claim' />);
    }
    if (av.actionView?.case === 'ics20Withdrawal') {
        return (<ViewBox label='ICS20 Withdrawal' />);
    }
    if (av.actionView?.case === 'delegate') {
        return (<ViewBox label='Delegate' />);
    }
    if (av.actionView?.case === 'undelegate') {
        return (<ViewBox label='Undelegate' />);
    }
    if (av.actionView?.case === 'undelegateClaim') {
        return (<ViewBox label='Undelegate Claim' />);
    }
    if (av.actionView?.case === 'validatorDefinition') {
        return (<ViewBox label='Validator Definition' />);
    }
    if (av.actionView?.case === 'ibcAction') {
        return (<ViewBox label='IBC Action' />);
    }
    if (av.actionView?.case === 'proposalSubmit') {
        return (<ViewBox label='Proposal Submit' />);
    }
    if (av.actionView?.case === 'proposalWithdraw') {
        return (<ViewBox label='Proposal Withdraw' />);
    }
    if (av.actionView?.case === 'validatorVote') {
        return (<ViewBox label='Validator Vote' />);
    }
    if (av.actionView?.case === 'delegatorVote') {
        return (<ViewBox label='Delegator Vote' />);
    }
    if (av.actionView?.case === 'proposalDepositClaim') {
        return (<ViewBox label='Proposal Deposit Claim' />);
    }
    if (av.actionView?.case === 'positionOpen') {
        return (<ViewBox label='Position Open' />);
    }
    if (av.actionView?.case === 'positionClose') {
        return (<ViewBox label='Position Close' />);
    }
    if (av.actionView?.case === 'positionWithdraw') {
        return (<ViewBox label='Position Withdraw' />);
    }
    if (av.actionView?.case === 'positionRewardClaim') {
        return (<ViewBox label='Position Reward Claim' />);
    }
    if (av.actionView?.case === 'daoSpend') {
        return (<ViewBox label='DAO Spend' />);
    }
    if (av.actionView?.case === 'daoOutput') {
        return (<ViewBox label='DAO Output' />);
    }
    if (av.actionView?.case === 'daoDeposit') {
        return (<ViewBox label='DAO Deposit' />);
    }
    return (<></>);
}

export { ActionViewComponent };