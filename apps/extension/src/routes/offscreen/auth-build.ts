import {InternalMessageHandler } from '@penumbra-zone/types/src/internal-msg/shared';
import { AuthBuildMessage } from './types';

// eslint-disable-next-line @typescript-eslint/require-await
export const authAndBuildHandler: InternalMessageHandler<AuthBuildMessage> = (jsonReq, responder) => {
    console.log("Entered authAndBuildHandler!")
};