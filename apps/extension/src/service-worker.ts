import { Services } from './services';

export const services = new Services();
await services.onServiceWorkerInit();
