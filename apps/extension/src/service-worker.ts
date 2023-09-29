import { Services } from './controllers/services';

export const services = new Services();
void services.onServiceWorkerInit();
