import { isViewServerReq, viewServerRouter } from './grpc/view-protocol-server/router';
import {
  isStdRequest,
  ServicesInterface,
  ServiceWorkerResponse,
  SwRequestMessage,
} from '@penumbra-zone/types';
import { stdRouter } from './std/router';
import { custodyServerRouter, isCustodyServerReq } from './grpc/custody/router';
import { localExtStorage, sessionExtStorage } from '@penumbra-zone/storage';

// Used to filter for service worker messages and narrow their type to pass to the typed handler.
// Exposed to service worker for listening for internal and external messages
export const penumbraMessageHandler =
  (services: ServicesInterface) =>
  (
    message: unknown,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response: ServiceWorkerResponse<SwRequestMessage>) => void,
  ) => {
    if (!allowedRequest(sender)) return;

    if (isStdRequest(message)) return stdRouter(message, sender, sendResponse, services);
    else if (isViewServerReq(message)) {
      void (async () => {
        if (sender.origin && (await connectedSite(sender.origin)) && (await isLogin())) {
          viewServerRouter(message, sender, services);
        }
      })();
    } else if (isCustodyServerReq(message)) {
      void (async () => {
        if (sender.origin && (await connectedSite(sender.origin)) && (await isLogin())) {
          custodyServerRouter(message, sender, services);
        }
      })();
    }

    return;
  };

// Protections to guard for allowed messages only. Requirements:
// - TODO: If message from dapp, should only be from sites that have received permission via `connect`
// - If message from extension, ensure it comes from our own and not an external extension
const allowedRequest = (sender: chrome.runtime.MessageSender): boolean => {
  return sender.tab?.id !== undefined || sender.id === chrome.runtime.id;
};

const connectedSite = async (origin: string) => {
  return (await localExtStorage.get('connectedSites')).includes(origin);
};

const isLogin = async () => Boolean(await sessionExtStorage.get('passwordKey'));
