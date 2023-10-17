import { swMessageHandler } from './routes/service-worker/root-router';
import { Services } from './services';

export const services = new Services();
await services.initialize();
chrome.runtime.onMessage.addListener(swMessageHandler);
