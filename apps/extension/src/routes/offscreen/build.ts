import {InternalMessageHandler } from '@penumbra-zone/types/src/internal-msg/shared';
import { ActionBuildMessage } from './types';

export const buildActionHandler: InternalMessageHandler<ActionBuildMessage> = (jsonReq, responder) => {
    const worker = new Worker(new URL('../web-worker/router.ts', import.meta.url));

    // Set up event listener to recieve messages from web worker
    worker.addEventListener('message', function(e) {
        console.log('result recieved from worker: ', e.data);
    }, false);

    // TODO: Structure the data to send to the web worker

    // Send data to web worker
    worker.postMessage({ type: 'worker', data: jsonReq });
};