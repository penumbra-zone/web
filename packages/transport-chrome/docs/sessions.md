# Sessions

The classes `CRSessionClient` and `CRSessionManager` provide a way to adapt a `@penumbra-zone/transport-dom` channel transport to the Chrome extension runtime.

The high-level `CRSessionManager` is used as a singleton. A `CRSessionClient` may be shared among transports, or instantiated multiple times for multiple transports.

The class `CRSession` is used by `CRSessionManager` to encapsulate individual client sessions.

## Session Lifecycle

The session lifecycle involves `CRSessionManager` Manager and `CRSession` Session on the extension side, and `CRSessionClient` Client on the document side.

### Initialization

1. The extension initializes a Manager with a service entry function, a client validation callback, and a `managerId`.
2. Manager attaches an `onConnect` handler to respond to incoming connection attempts.
3. **async then Client**
4. A document is navigated, and a content script provides some way to request a session.
5. The document requests a session.
6. The content script creates a `MessageChannel`. One `MessagePort` is provided to the document for creation of a channel transport, and the other `MessagePort` is provided to `CRSessionClient`.
7. Client calls `chrome.runtime.connect({name: sessionName})` and obtains a `chrome.runtime.Port`.
8. Client attaches handlers to the `chrome.runtime.Port`.
9. **async then Manager**
10. The Manager's `onConnect` listener activates
11. Manager performs some basic synchronous validation
12. Manager creates a new `CRSession` instance
13. The Session attaches listeners immediately
14. **async**

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

Support for client-streaming methods is experimental.

### Termination

#### Success: Client destroyed

1. The client is destroyed.
2. **async then Manager**
3. Session's `onDisconnect` handler activates.
4. The Session is aborted.

Complete.

#### Failure: Validation Error

1. The validation promise of a Session is rejected.
2. The Session is aborted.
3. **async then Client**
4. Client's `onDisconnect` handler activates.
5. The Client attempts to reconnect.

#### Failure: Origin Killed

1. Manager calls `killOrigin()` on the `CRSessionManager`
2. Manager aborts all sessions from that origin
3. Manager aborts all connections with that origin
4. **async then Client** (for each affected client)
5. Each client's `onDisconnect` handler activates
6. Each client attempts to reconnect.

Complete.

#### Reconnection

1. The extension worker is killed.
2. The extension worker is initialized.
3. **async then Client**
4. Client's `onDisconnect` handler activates
5. If reconnect is enabled, client creates a new port
6. Client re-establishes the connection following the Initialization phase
7. Client reuses the same session identity
8. **async then Manager**
9. Manager validates the new connection
10. Manager creates a new session as in Initialization

Enter any phase.
