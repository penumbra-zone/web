
import { TransactionView } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1alpha1/transaction_pb';
import { MemoViewComponent } from './memo-view';
import { ActionViewComponent } from './action-view';
import { ViewBox, ViewSection } from './viewbox';
import { displayAmount, fromBaseUnitAmount } from '@penumbra-zone/types';

const TransactionViewComponent: React.FC<{ txv: TransactionView, hash?: string }> = ({ txv, hash }) => {
    return (
        <>
            <div className='text-xl font-bold'>Transaction View</div>
            {hash ? (
                <>
                    <div className='font-mono italic text-muted-foreground'>{hash}</div>
                </>
            ) : (<></>)}
            <MemoViewComponent memo={txv.bodyView?.memoView!} />
            <ViewSection heading='Actions'>
                {
                    txv.bodyView?.actionViews?.map((av) => (
                        <ActionViewComponent actionView={av} />
                    ))
                }
            </ViewSection>
            <ViewSection heading='Parameters'>
                <ViewBox label='Fee' visibleContent={
                    <div className='font-mono'>{
                        /* TODO: fix. (1) why isn't fee in txparams? (2) why isn't there a ValueView in the txv? */
                        displayAmount(fromBaseUnitAmount(txv.bodyView?.fee?.amount!, 1))
                    } upenumbra</div>
                } />
                <ViewBox label='Chain ID' visibleContent={
                    <div className='font-mono'>{txv.bodyView?.transactionParameters?.chainId}</div>
                } />
            </ViewSection>
        </>
    );
}

export { TransactionViewComponent };