import { CreateZQueryStreamingProps, CreateZQueryUnaryProps } from './types';

/**
 * Some of the `createZQuery` props work differently depending on whether
 * `props.fetch` returns a promise or an `AsyncIterable`. This utility function
 * is a type predicate that informs our code both at compile- and run-time which
 * type of props and data we're working with.
 */
const isStreaming = <
  Name extends string,
  State,
  DataType,
  FetchArgs extends unknown[],
  ProcessedDataType,
>(
  props:
    | CreateZQueryUnaryProps<Name, State, DataType, FetchArgs>
    | CreateZQueryStreamingProps<Name, State, DataType, FetchArgs, ProcessedDataType>,
): props is CreateZQueryStreamingProps<Name, State, DataType, FetchArgs, ProcessedDataType> =>
  !!props.stream;

export const getSlice = <
  Name extends string,
  State,
  DataType,
  FetchArgs extends unknown[],
  ProcessedDataType = DataType,
>(
  props:
    | CreateZQueryUnaryProps<Name, State, DataType, FetchArgs>
    | CreateZQueryStreamingProps<Name, State, DataType, FetchArgs, ProcessedDataType>,
) => {
  const setAbortController = (abortController: AbortController | undefined) => {
    props.set(prevState => ({
      ...prevState,
      _zQueryInternal: {
        ...prevState._zQueryInternal,
        abortController,
      },
    }));
  };

  return {
    data: undefined,
    loading: false,
    error: undefined,

    revalidate: (...args: FetchArgs) => {
      const { _zQueryInternal } = props.get(props.getUseStore().getState());
      _zQueryInternal.abortController?.abort();
      setAbortController(new AbortController());
      void _zQueryInternal.fetch(...args);
    },

    _zQueryInternal: {
      referenceCount: 0,

      fetch: async (...args: FetchArgs) => {
        // We have to use the `props` object (rather than its destructured
        // properties) since we're passing the full `props` object to
        // `isStreaming`, which is a type predicate. If we use previously
        // destructured properties after the type predicate, the type
        // predicate won't apply to them, since the type predicate was called
        // after destructuring.
        if (isStreaming<Name, State, DataType, FetchArgs, ProcessedDataType>(props)) {
          const startState = props.get(props.getUseStore().getState());
          const abortController = startState._zQueryInternal.abortController;

          const { onStart, onValue, onEnd, onError, onAbort } = props.stream(startState.data);

          props.set(prevState => ({
            ...prevState,
            loading: true,
            ...(onStart ? { data: onStart(prevState.data) } : {}),
          }));

          try {
            for await (const item of props.fetch(...args)) {
              if (abortController?.signal.aborted) {
                if (onAbort) {
                  props.set(prevState => ({
                    ...prevState,
                    data: onAbort(prevState.data),
                  }));
                }

                break;
              }

              props.set(prevState => ({
                ...prevState,
                data: onValue(prevState.data, item),
              }));
            }
          } catch (error) {
            props.set(prevState => ({
              ...prevState,
              error,
              ...(onError ? { data: onError(prevState.data, error) } : {}),
            }));
          } finally {
            props.set(prevState => ({
              ...prevState,
              loading: false,
              ...(onEnd ? { data: onEnd(prevState.data) } : {}),
            }));
          }
        } else {
          props.set(prevState => ({
            ...prevState,
            loading: true,
          }));

          try {
            const data = await props.fetch(...args);
            props.set(prevState => ({ ...prevState, data }));
          } catch (error) {
            props.set(prevState => ({ ...prevState, error }));
          } finally {
            props.set(prevState => ({
              ...prevState,
              loading: false,
            }));
          }
        }
      },
    },
  };
};
