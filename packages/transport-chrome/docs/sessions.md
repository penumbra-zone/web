# Sessions

The classes `CRSessionClient` and `CRSessionManager` provide a way to adapt a `@penumbra-zone/transport-dom` channel transport to the Chrome extension runtime.

The high-level `CRSessionManager` is used as a singleton in the extension's background worker. A `CRSessionClient` is created for each client connection, providing a `MessagePort` that can be used by DOM channel transports.

The class `CRSession` is used by `CRSessionManager` to encapsulate individual client sessions, handling request processing and response delivery.

## Session Lifecycle

The session lifecycle involves `CRSessionManager` (Manager) and `CRSession` (Session) on the extension side, and `CRSessionClient` (Client) on the document side.

### Initialization

1. The extension initializes a Manager with a service entry function, a client validation callback, and a `managerId`.
2. Manager attaches an `onConnect` handler to respond to incoming connection attempts.
3. **async then Client**
4. A document is navigated, and a content script provides some way to request a session.
5. The document requests a session.
6. The content script creates a `MessageChannel` using `CRSessionClient.init(managerId)`, which returns a `MessagePort`.
7. One `MessagePort` is provided to the document for creation of a channel transport, while the other is retained by the `CRSessionClient`.
8. Client calls `chrome.runtime.connect({name: sessionName})` and obtains a `chrome.runtime.Port`.
9. Client attaches handlers to the `chrome.runtime.Port` for bidirectional communication.
10. **async then Manager**
11. The Manager's `onConnect` listener activates and receives the connection.
12. Manager performs basic synchronous validation (checking name format and origin).
13. Manager creates a new `CRSession` instance with the port.
14. The Session attaches message listeners immediately to avoid missing messages.
15. Asynchronous port validation begins, blocking handler execution, but not blocking message reception.
16. **async**

The Session is now in charge of the connection with the Client.

Enter any other phase.

### Communication

#### MethodKind.Unary

1. Client sends a `TransportMessage` with a new request ID
2. **async then Manager**
3. Session receives the message
4. Session obtains a response message from the service
5. Session sends a `TransportMessage` response to the client
6. **async then Client**
7. Client receives the `TransportMessage`
8. Client forwards the `TransportMessage`

Enter any other phase.

#### MethodKind.ServerStreaming

1. Client sends a `TransportMessage` with a new request ID
2. **async then Manager**
3. Session receives the message
4. Session obtains a response stream from the service
5. Session sinks the stream into a `PortStreamSink`
6. Session sends a `TransportInitChannel` response to the Client
7. **async then Client**
8. Client receives the `TransportInitChannel`
9. Client sources the stream from a `PortStreamSource`
10. Client forwards a `TransportStream`

Enter any other phase.

#### MethodKind.ClientStreaming, MethodKind.BidiStreaming

Support for client-streaming methods is experimental, and disabled unless `globalThis.__DEV__` is truthy.

1. Client creates a unique stream channel name.
2. Client sets up an `onConnect` listener for the stream subchannel.
3. Client sends a `TransportInitChannel` message with the channel name.
4. Client waits for the service to connect to this subchannel.
5. **async then Manager**
6. Session receives the `TransportInitChannel` message.
7. Session uses the stream channel name to connect to the client's offered subchannel.
8. Session creates a `PortStreamSource` to receive the stream data.
9. Session passes the `ReadableStream` to the service handler.
10. The service processes the client stream and may produce a response.

### Termination

#### Success: Client destroyed

1. The client is destroyed.
2. **async then Manager**
3. Session's `onDisconnect` handler activates.
4. The Session is aborted.

Complete.

#### Failure: Validation Error

1. The validation promise of a Session is rejected (port fails validation).
2. The Session is aborted with an Unauthenticated error code.
3. The port is disconnected.
4. **async then Client**
5. Client's `onDisconnect` handler activates.
6. The Client attempts to reconnect.
7. If validation continues to fail, the client will eventually stop.

# TODO: investigate behavior

Complete.

#### Failure: Origin Killed

1. Manager calls `killOrigin()` on the `CRSessionManager`
2. Manager aborts all sessions from that origin
3. Manager aborts all connections with that origin
4. **async then Client** (for each affected client)
5. Each client's `onDisconnect` handler activates
6. Each client attempts to reconnect.

# TODO: investigate behavior

Complete.

#### Reconnection

1. The extension worker is killed or the connection is otherwise lost.
2. **async then Client**
3. Client's `onDisconnect` handler activates.
4. Client triggers the reconnect process.
5. Client creates a new port with `chrome.runtime.connect()` using the same session name.
6. The extension worker is re-initialized to handle the incoming connection.

Enter Initialization phase.
