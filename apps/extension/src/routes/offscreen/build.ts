import {InternalMessageHandler } from '@penumbra-zone/types/src/internal-msg/shared';
import { ActionBuildMessage } from './types';
import { ActionPlan, TransactionPlan, WitnessData } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1alpha1/transaction_pb';

const spawnWorker = (
    transactionPlan: TransactionPlan, 
    actionPlan: ActionPlan, 
    witness: WitnessData, 
    fullViewingKey: string,
    key_type: string,
) => {
    const worker = new Worker(new URL('../web-worker/router.ts', import.meta.url));

    // Set up event listener to recieve messages from web worker
    worker.addEventListener('message', function(e) {
        console.log('result recieved from worker: ', e.data);
    }, false);

    // Send data to web worker
    worker.postMessage({ 
        type: 'worker', 
        data: {
            transactionPlan, 
            actionPlan, 
            witness, 
            fullViewingKey, 
            key_type
        } 
    });
};

export const buildActionHandler: InternalMessageHandler<ActionBuildMessage> = (jsonReq, responder) => {
    // Destructure the data object to get individual fields
    const { transactionPlan, actionPlan, witness, fullViewingKey, action_types } = jsonReq

    // Spawn web workers
    for (let i = 0; i < actionPlan.length; i++) {
        spawnWorker(transactionPlan, actionPlan[i]!, witness, fullViewingKey, action_types[i]!)
    }
};