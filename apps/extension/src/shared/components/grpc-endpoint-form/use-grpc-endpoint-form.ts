import { Code, ConnectError, createPromiseClient } from '@connectrpc/connect';
import { AppService } from '@penumbra-zone/protobuf';
import { createGrpcWebTransport } from '@connectrpc/connect-web';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { AllSlices } from '../../../state';
import { useStoreShallow } from '../../../utils/use-store-shallow';
import { ServicesMessage } from '../../../message/services';
import debounce from 'lodash/debounce';
import { ChainRegistryClient } from '@penumbra-labs/registry';

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

const getRpcsFromRegistry = () => {
  const registryClient = new ChainRegistryClient();
  const { rpcs } = registryClient.globals();
  return rpcs.toSorted(randomSort);
};

export const useGrpcEndpointForm = () => {
  const grpcEndpoints = useMemo(() => getRpcsFromRegistry(), []);

  // Get the rpc set in storage (if present)
  const { grpcEndpoint, setGrpcEndpoint } = useStoreShallow(useSaveGrpcEndpointSelector);

  const [originalChainId, setOriginalChainId] = useState<string | undefined>();
  const [chainId, setChainId] = useState<string>();
  const [grpcEndpointInput, setGrpcEndpointInput] = useState<string>('');
  const [rpcError, setRpcError] = useState<string>();
  const [isSubmitButtonEnabled, setIsSubmitButtonEnabled] = useState(false);
  const [confirmChangedChainIdPromise, setConfirmChangedChainIdPromise] = useState<
    PromiseWithResolvers<void> | undefined
  >();

  const isCustomGrpcEndpoint =
    grpcEndpointInput !== '' && !grpcEndpoints.some(({ url }) => url === grpcEndpointInput);

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
          AppService,
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

  const chainIdChanged = !!originalChainId && !!chainId && originalChainId !== chainId;

  const onSubmit = async (
    /** Callback to run when the RPC endpoint successfully saves */
    onSuccess: () => void | Promise<void>,
  ) => {
    setIsSubmitButtonEnabled(false);

    // If the chain id has changed, our cache is invalid
    if (chainIdChanged) {
      const promiseWithResolvers = Promise.withResolvers<void>();
      setConfirmChangedChainIdPromise(promiseWithResolvers);

      try {
        await promiseWithResolvers.promise;
      } catch {
        setIsSubmitButtonEnabled(true);
        return;
      } finally {
        setConfirmChangedChainIdPromise(undefined);
      }

      await setGrpcEndpoint(grpcEndpointInput);
      void chrome.runtime.sendMessage(ServicesMessage.ClearCache);
    } else {
      await setGrpcEndpoint(grpcEndpointInput);
    }

    await onSuccess();
    setIsSubmitButtonEnabled(true);
    setOriginalChainId(chainId);
  };

  return {
    chainId,
    originalChainId,
    /**
     * gRPC endpoints report which chain they represent via the `chainId`
     * property returned by their `appParameters` RPC method. All endpoints for
     * a given chain will have the same chain ID. If the chain ID changes when a
     * user selects a different gRPC endpoint, that means that the new gRPC
     * endpoint represents an entirely different chain than the user was
     * previously using. This is significant, and should be surfaced to the
     * user.
     */
    chainIdChanged,
    confirmChangedChainIdPromise,
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
