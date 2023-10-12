# Message Passing

### Page/Popup <--> Service Worker

The extension makes use of the [standard messaging passing api](https://developer.chrome.com/docs/extensions/mv3/messaging/) exposed
by Chrome. However, this is not typesafe. For that reason, there is an [internal typesafe message router](../apps/extension/src/routes/service-worker/extension/router.ts)
that we should be using. Just add a new message type to `SwRequestMessage`, add it to the router, and create a new file to handle the request.

### Dapp <--> Extension

#### View Server calls

This one is much more tricky. We want to treat the extension as a kind of GRPC service that the frontend uses that is compatible with the published protobufs.

However, this requires a [new GRPC transport](../packages/transport/src/create.ts) that wraps the underlying `window.postMessage` and `chrome.sendMessage` apis.

This way, the consumer only needs to do

```typescript
const client = createPromiseClient(ViewProtocolService, createEventTransport(ViewProtocolService));
```

And in their react component:

```typescript
// For unary requests
const { data, isLoading, isError } = useQuery({
  queryKey: ['chainParameters'],
  refetchInterval: 0,
  queryFn: () => client.chainParameters({}),
});
```

```typescript
// For stream requests
const balances = useMemo(() => client.balances({}), []);
const { data, end, error } = useStreamQuery(balances);
```

And the complexity of the underlying message passing system is abstracted away.
