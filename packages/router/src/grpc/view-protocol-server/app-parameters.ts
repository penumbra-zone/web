import type { Impl } from '.';
import { servicesCtx } from '../../ctx';

export const appParameters: Impl['appParameters'] = async (_, ctx) => {
  const services = ctx.values.get(servicesCtx);
  const parameters = await services.querier.app.appParams();
  return { parameters };
};
