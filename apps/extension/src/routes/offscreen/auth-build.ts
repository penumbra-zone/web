import { SwMessage, SwMessageHandler } from '../service-worker/extension/types';
import {
  AuthorizeAndBuildRequest,
  AuthorizeAndBuildResponse,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1alpha1/view_pb';

export type AuthBuildMessage = SwMessage<
  'AUTH_AND_BUILD',
  AuthorizeAndBuildRequest,
  Promise<AuthorizeAndBuildResponse>
>;

// eslint-disable-next-line @typescript-eslint/require-await
export const authAndBuildHandler: SwMessageHandler<AuthBuildMessage> = async req => {
  // const worker = new Worker(new URL('work-me.ts', import.meta.url));
  // worker.postMessage({
  //   type: 'addOne',
  //   data: {
  //     // @ts-expect-error
  //     val: message.data.value as number,
  //   },
  // });

  // worker.onmessage = e => {
  //   sendResponse({
  //     type: 'addOneResult',
  //     data: {
  //       newVal: e.data.answer as number,
  //     },
  //   });
  // };

  console.log('offscreen req', req);

  return new AuthorizeAndBuildResponse();
};
