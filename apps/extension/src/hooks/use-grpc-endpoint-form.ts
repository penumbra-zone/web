import { createPromiseClient } from '@connectrpc/connect';
import { QueryService } from '@buf/penumbra-zone_penumbra.connectrpc_es/penumbra/core/app/v1/app_connect';
import { createGrpcWebTransport } from '@connectrpc/connect-web';
import { useState } from 'react';
import { AllSlices } from '../state';
import { useStoreShallow } from '../utils/use-store-shallow';
import { useChainIdQuery } from './chain-id';
import { ServicesMessage } from '@penumbra-zone/types/src/services';

const useSaveGrpcEndpointSelector = (state: AllSlices) => ({
  grpcEndpoint: state.network.grpcEndpoint,
  setGrpcEndpoint: state.network.setGRPCEndpoint,
});

/**
 * Provides everything needed for a gRPC endpoint picking form.
 */
export const useGrpcEndpointForm = () => {
  const { chainId: currentChainId } = useChainIdQuery();
  const [newChainId, setNewChainId] = useState<string>();
  const { grpcEndpoint, setGrpcEndpoint } = useStoreShallow(useSaveGrpcEndpointSelector);
  const [grpcEndpointInput, setGrpcEndpointInput] = useState<string>(grpcEndpoint ?? '');
  const [rpcError, setRpcError] = useState<string>();

  const onSubmit = async (
    /** Callback to run when the RPC endpoint successfully saves */
    onSuccess?: () => unknown,
  ) => {
    try {
      const trialClient = createPromiseClient(
        QueryService,
        createGrpcWebTransport({ baseUrl: grpcEndpointInput }),
      );
      const { appParameters } = await trialClient.appParameters({});
      if (!appParameters?.chainId) throw new Error('Endpoint did not provide a valid chainId');

      setRpcError(undefined);
      setNewChainId(appParameters.chainId);
      await setGrpcEndpoint(grpcEndpointInput);
      // If the chain id has changed, our cache is invalid
      if (appParameters.chainId !== currentChainId)
        void chrome.runtime.sendMessage(ServicesMessage.ClearCache);
      if (onSuccess) onSuccess();
    } catch (e: unknown) {
      console.warn('Could not use new RPC endpoint', e);
      setRpcError(String(e) || 'Unknown RPC failure');
    }
  };

  const chainId = newChainId ?? currentChainId;

  return {
    chainId,
    /** The gRPC endpoint saved to local storage. */
    grpcEndpoint,
    /**
     * The gRPC endpoint entered into the text field, which may or may not be
     * the same as the one saved in local storage.
     */
    grpcEndpointInput,
    setGrpcEndpointInput,
    rpcError,
    setRpcError,
    onSubmit,
  };
};
