import { Code, ConnectError, createPromiseClient } from '@connectrpc/connect';
import { QueryService } from '@buf/penumbra-zone_penumbra.connectrpc_es/penumbra/core/app/v1/app_connect';
import { createGrpcWebTransport } from '@connectrpc/connect-web';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { AllSlices } from '../../../state';
import { useStoreShallow } from '../../../utils/use-store-shallow';
import { ServicesMessage } from '@penumbra-zone/types/src/services';
import { GRPC_ENDPOINTS } from '@penumbra-zone/constants/src/grpc-endpoints';
import { debounce } from 'lodash';

const randomSort = () => (Math.random() >= 0.5 ? 1 : -1);

const useSaveGrpcEndpointSelector = (state: AllSlices) => ({
  grpcEndpoint: state.network.grpcEndpoint,
  setGrpcEndpoint: state.network.setGRPCEndpoint,
});

const isValidUrl = (url: string) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Provides everything needed for a gRPC endpoint picking form.
 */
export const useGrpcEndpointForm = () => {
  const [originalChainId, setOriginalChainId] = useState<string | undefined>();
  const [chainId, setChainId] = useState<string>();
  const grpcEndpoints = useMemo(() => [...GRPC_ENDPOINTS].sort(randomSort), []);
  const { grpcEndpoint, setGrpcEndpoint } = useStoreShallow(useSaveGrpcEndpointSelector);
  const [grpcEndpointInput, setGrpcEndpointInput] = useState<string>(
    grpcEndpoint ?? grpcEndpoints[0]?.url ?? '',
  );
  const [rpcError, setRpcError] = useState<string>();
  const [isSubmitButtonEnabled, setIsSubmitButtonEnabled] = useState(false);
  const isCustomGrpcEndpoint = !GRPC_ENDPOINTS.some(({ url }) => url === grpcEndpointInput);

  const setGrpcEndpointInputOnLoadFromState = useCallback(() => {
    if (grpcEndpoint) setGrpcEndpointInput(grpcEndpoint);
  }, [grpcEndpoint]);

  useEffect(setGrpcEndpointInputOnLoadFromState, [setGrpcEndpointInputOnLoadFromState]);

  const handleChangeGrpcEndpointInput = useMemo(() => {
    return debounce(async (grpcEndpointInput: string) => {
      setIsSubmitButtonEnabled(false);
      setRpcError(undefined);

      if (!isValidUrl(grpcEndpointInput)) return;

      try {
        const trialClient = createPromiseClient(
          QueryService,
          createGrpcWebTransport({ baseUrl: grpcEndpointInput }),
        );
        const { appParameters } = await trialClient.appParameters({});
        if (!appParameters?.chainId) throw new ConnectError('', Code.NotFound);

        setIsSubmitButtonEnabled(true);
        setChainId(appParameters.chainId);

        // Only set the original chain ID the first time, so that we can compare
        // it on submit.
        setOriginalChainId(originalChainId =>
          originalChainId ? originalChainId : appParameters.chainId,
        );
      } catch (e) {
        if (e instanceof ConnectError && e.code === Code.NotFound) {
          setRpcError(
            'Could not get a chain ID from this endpoint. Please double-check your endpoint URL and try again.',
          );
        } else if (e instanceof ConnectError && e.code === Code.Unknown) {
          setRpcError(
            'Could not connect to endpoint. Please double-check your endpoint URL and try again.',
          );
        } else {
          setRpcError('Could not connect to endpoint: ' + String(e));
        }
      }
    }, 400);
  }, []);

  useEffect(
    () => void handleChangeGrpcEndpointInput(grpcEndpointInput),
    [handleChangeGrpcEndpointInput, grpcEndpointInput],
  );

  const onSubmit = async (
    /** Callback to run when the RPC endpoint successfully saves */
    onSuccess: () => void | Promise<void>,
  ) => {
    setIsSubmitButtonEnabled(false);
    await setGrpcEndpoint(grpcEndpointInput);
    // If the chain id has changed, our cache is invalid
    if (originalChainId !== chainId) void chrome.runtime.sendMessage(ServicesMessage.ClearCache);
    await onSuccess();
    setIsSubmitButtonEnabled(true);
  };

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
    grpcEndpoints,
    rpcError,
    onSubmit,
    isSubmitButtonEnabled,
    isCustomGrpcEndpoint,
  };
};
