import type { Impl } from '.';
import { servicesCtx } from '../../ctx';


export const ownedPositionIds: Impl['ownedPositionIds'] = async (req, ctx) => {
    const services = ctx.values.get(servicesCtx);

    const { indexedDb } = await services.getWalletServices();


    return {  };
};
