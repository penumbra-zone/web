import { makeAutoObservable } from 'mobx';
import { TransactionPlannerRequest } from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';
import { PositionId } from '@penumbra-zone/protobuf/penumbra/core/component/dex/v1/dex_pb';
import { planBuildBroadcast } from '@/pages/trade/ui/order-form/helpers.tsx';
import { connectionStore } from '@/shared/model/connection';
import { AddressIndex } from '@penumbra-zone/protobuf/penumbra/core/keys/v1/keys_pb';
import { queryClient } from '@/shared/const/queryClient.ts';
import { getPositionData, PositionData } from '@/pages/trade/api/positions.ts';
import { penumbra } from '@/shared/const/penumbra.ts';
import { DexService } from '@penumbra-zone/protobuf';
import { openToast } from '@penumbra-zone/ui/Toast';

class PositionsStore {
  public loading = false;

  constructor() {
    makeAutoObservable(this);
  }

  setLoading(state: boolean) {
    this.loading = state;
  }

  closePositions = async (positions: PositionId[]): Promise<void> => {
    try {
      this.setLoading(true);

      const planReq = new TransactionPlannerRequest({
        positionCloses: positions.map(positionId => ({ positionId })),
        source: new AddressIndex({ account: connectionStore.subaccount }),
      });

      await planBuildBroadcast('positionClose', planReq);
      await this.updatePositionsInCache(positions);
    } catch (e) {
      openToast({
        type: 'error',
        message: 'Error with withdraw action',
        description: String(e),
      });
    } finally {
      this.setLoading(false);
    }
  };

  withdrawPositions = async (positions: PositionId[]): Promise<void> => {
    try {
      this.setLoading(true);

      // Fetching latest position data as the planner request requires current reserves + pair
      const promises = positions.map(positionId =>
        penumbra.service(DexService).liquidityPositionById({ positionId }),
      );
      const latestPositionData = await Promise.all(promises);

      const planReq = new TransactionPlannerRequest({
        positionWithdraws: positions.map((positionId, i) => ({
          positionId,
          tradingPair: latestPositionData[i]?.data?.phi?.pair,
          reserves: latestPositionData[i]?.data?.reserves,
        })),
        source: new AddressIndex({ account: connectionStore.subaccount }),
      });

      await planBuildBroadcast('positionWithdraw', planReq);
      await this.updatePositionsInCache(positions);
    } catch (e) {
      openToast({
        type: 'error',
        message: 'Error with withdraw action',
        description: String(e),
      });
    } finally {
      this.setLoading(false);
    }
  };

  private async updatePositionsInCache(positions: PositionId[]): Promise<void> {
    const promises = positions.map(id => this.updatePositionInCache(id));
    await Promise.all(promises);
  }

  // After a successful action, update the position state in the cache
  private async updatePositionInCache(positionId: PositionId) {
    const { data } = await penumbra.service(DexService).liquidityPositionById({ positionId });
    if (data) {
      const newPositionData = await getPositionData(positionId, data);
      queryClient.setQueryData<PositionData[]>(['positions'], oldData => {
        if (!oldData) {
          throw new Error('Trying to update position data cache when none is present');
        }
        // Finding matching positionId and swap out the position data with latest
        return oldData.map(p => (p.positionId === positionId ? newPositionData : p));
      });
    }
  }
}

export const positionsStore = new PositionsStore();
