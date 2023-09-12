import { swMessageHandler } from './routes/service-worker/message-handler';
import { Services } from './controllers/services';

export const services = new Services();
await services.onServiceWorkerInit();

chrome.runtime.onMessage.addListener(swMessageHandler);
