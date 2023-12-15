import {InternalMessageHandler, InternalResponse } from '@penumbra-zone/types/src/internal-msg/shared';
import { ActionBuildMessage } from './types';
import { Action, ActionPlan, TransactionPlan, WitnessData } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1alpha1/transaction_pb';

const spawnWorker = (
    transactionPlan: TransactionPlan, 
    actionPlan: ActionPlan, 
    witness: WitnessData, 
    fullViewingKey: string,
    key_type: string,
): Promise<any> => {
    return new Promise((resolve, reject) => {
        const worker = new Worker(new URL('../web-worker/router.ts', import.meta.url));

        // Set up event listener to recieve messages from the web worker
        worker.addEventListener('message', function(e) {
            console.log('Result recieved from worker: ', e.data);
            resolve(e.data);
        }, false);

        // Set up error handling
        worker.addEventListener('error', function (error) {
            console.error('Error in worker:', error);
            reject(error);
        });

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
    });
};

export const buildActionHandler: InternalMessageHandler<ActionBuildMessage> = async (jsonReq, responder) => {
    // Destructure the data object to get individual fields
    const { transactionPlan, actionPlan, witness, fullViewingKey, action_types } = jsonReq

    // Array to store promises for each worker
    const workerPromises: Promise<any>[] = [];

    // Spawn web workers
    for (let i = 0; i < actionPlan.length; i++) {
        workerPromises.push(spawnWorker(transactionPlan, actionPlan[i]!, witness, fullViewingKey, action_types[i]!))
    }

    // Wait for promises to resolve
    const results = await Promise.all(workerPromises);

    console.log("results are: ", results)

    // Construct response format
    const response: InternalResponse<ActionBuildMessage> = {
        type: 'ACTION_AND_BUILD', 
        data: results,
    };
    responder(response)

    return results
};