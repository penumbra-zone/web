import { Services } from './controllers/services';

export const services = new Services();
await services.onServiceWorkerInit();
