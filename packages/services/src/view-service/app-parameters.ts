import { AppParameters } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/app/v1/app_pb';
import type { Impl } from '.';
import { idbCtx } from '../ctx/prax';

export const appParameters: Impl['appParameters'] = async (_, ctx) => {
  const idb = await ctx.values.get(idbCtx)();

  const subscription = idb.subscribe('APP_PARAMETERS');
  const parameters = await idb.getAppParams();
  if (parameters) return { parameters };
  for await (const update of subscription)
    return { parameters: AppParameters.fromJson(update.value) };

  throw new Error('App parameters not available');
};
