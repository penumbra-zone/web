# Streams

The classes `PortStreamSource` and `PortStreamSink` provide a way to stream jsonifiable values between documents through the chrome runtime.

In [the stream spec's model](https://streams.spec.whatwg.org/#model):

- the message channel is a Push source
- the Producer is the document which names the channel and listens for `onConnect`
- the Consumer is the document which recieves the channel name and calls `connect`

## Stream Lifecycle

The Producer must convey the channel name to the Consumer out-of-band.

All steps must be completely synchronous until an 'async' step, or task ordering may violate expectations.

### Initialization

1. Producer names the channel.
2. Producer attaches an `onConnect` handler for that name.
3. **async then Producer**
4. Producer transmits channel name to Consumer.
5. **async then Consumer**
6. Consumer receives the channel name.
7. **async then Consumer**
8. Consumer calls `connect` and obtains a port
9. Consumer constructs a `new PortStreamSource`
10. the `Source` attaches `onMessage`, `onDisconnect` handlers
11. _timeout clock begins for Source_
12. **async then Consumer**
13. Producer's `onConnect` activates and provides a port
14. Producer constructs a `new PortStreamSink`
15. the Sink attaches an `onDisconnect` handler
16. _timeout clock begins for Sink_

Enter any other phase.

### Streaming

1. Producer writes a chunk to Sink
2. _timeout clock is reset for Sink_
3. Sink posts a `StreamValue` message
4. **async then Consumer**
5. Source receives the `StreamValue` message
6. _timeout clock is reset for Source_
7. Source enqueues the chunk

Enter Streaming again or any Termination phase.

### Termination

#### Success: Producer finished

1. Producer finishes writing, and calls `PortStreamSink.close`.
2. Sink removes its `onDisconnect` handler
3. Sink posts a `StreamEnd` message
4. **async then Consumer**
5. Source receives the `StreamEnd` control
6. Source closes its controller
7. Source disconnects the channel

Complete.

#### Success: Consumer cancel

1. Consumer finishes reading, and calls `PortStreamSource.cancel`
2. Source disconnects the channel

Enter phase Success: Consumer disconnect

#### Success: Consumer disconnect

The consumer cancelled or was destroyed.

1. Producer Sink's `onDisconnect` handler is activated
2. Sink errors its controller with `Code.Canceled`

Complete.

#### Failure: Producer abort

1. Producer calls `PortStreamSink.abort`
2. Sink detaches its `onDisconnect` handler
3. Sink posts a `StreamAbort` message
4. **async then Consumer**
5. Consumer's Source recieves the `StreamAbort` control
6. Source disconnects the channel
7. Source errors its controller with `Code.Aborted`

Complete.

#### Failure: Producer disconnect

1. Consumer Source's `onDisconnect` handler is activated
2. Source errors its controller with `Code.Unavailable`

Complete.

#### Failure: Timeout

Either counterpart may time out.

1. a timeout clock expires
2. the stream controller is errored with `Code.DeadlineExceeded`
3. the channel is disconnected
4. **async then** counterpart
   - **Producer** enters Success: Consumer disconnect
   - **Consumer** enters Failure: Producer disconnect
