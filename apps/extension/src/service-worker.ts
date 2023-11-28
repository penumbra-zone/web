import { Services } from '@penumbra-zone/services';
import { penumbraMessageHandler } from '@penumbra-zone/router';

export const services = new Services();
await services.initialize();
chrome.runtime.onMessage.addListener(penumbraMessageHandler(services));
