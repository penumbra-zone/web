import { Services } from 'penumbra-services';
import { penumbraMessageHandler } from 'penumbra-router';

export const services = new Services();
await services.initialize();
chrome.runtime.onMessage.addListener(penumbraMessageHandler(services));
