import { swMessageHandler } from './routes/service-worker/root-router';
import { Services } from './services';

export const services = new Services();
await services.initialize();
// Now ready to handle messages
chrome.runtime.onMessage.addListener(swMessageHandler);
