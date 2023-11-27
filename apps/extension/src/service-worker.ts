import { Services } from '@penumbra-zone/services';
import { penumbraMessageHandler } from '@penumbra-zone/router';

export const services = new Services();
await services.initialize();
chrome.runtime.onMessage.addListener(penumbraMessageHandler(services));

// Option A -> we set the keys in memory when service starts
//             Put this in a setTimeout() <-- a planned setting schedule
//             Make sure this doesn't block the initial requests that woke up the service worker
//             Lazy load pattern
