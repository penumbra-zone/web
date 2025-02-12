/* eslint-disable @typescript-eslint/no-unsafe-assignment -- tests */
import { mockChannel, MockedChannel } from '@penumbra-zone/mock-chrome/runtime/connect';
import type { TransportMessage, TransportStream } from '@penumbra-zone/transport-dom/messages';
import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest';
import type { TransportInitChannel } from './message.js';
import { CRSessionClient } from './session-client.js';
import { lastResult } from './last-result.js';
import { errorToJson } from '@connectrpc/connect/protocol-connect';
import { ConnectError } from '@connectrpc/connect';

describe('CRSessionClient', () => {
  let testName: string = undefined as never;

  let mockedConnect: MockedChannel['connect'];
  let mockedOnConnect: MockedChannel['onConnect'];
  let domPort: MessagePort | undefined;

  let mockedChannel: MockedChannel;

  const extOnDisconnectListener = vi.fn<[chrome.runtime.Port], void>();
  const extOnMessageListener = vi.fn<[unknown, chrome.runtime.Port], void>();
  const extOnConnectListener = vi.fn((p: chrome.runtime.Port) => {
    p.onMessage.addListener(extOnMessageListener);
    p.onDisconnect.addListener(extOnDisconnectListener);
  });

  let domMessageHandler: undefined | Mock<[MessageEvent<unknown>], void>;
  let domMessageErrorHandler: undefined | Mock<[MessageEvent<unknown>], void>;

  beforeEach(({ expect }) => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();

    testName = (expect.getState().currentTestName ?? 'no test name').split(' ').join('_');
    expect(testName).toBeDefined();

    domMessageHandler = undefined;
    domMessageErrorHandler = undefined;
    domPort = undefined;

    mockedChannel = mockChannel();
    mockedConnect = mockedChannel.connect;
    mockedOnConnect = mockedChannel.onConnect;
    mockedOnConnect.addListener(extOnConnectListener);

    vi.stubGlobal('chrome', { runtime: { connect: mockedConnect } });
  });

  it('should not be a singleton', () => {
    const porty = CRSessionClient.init('test');
    expect(porty).toBeDefined();
    expect(mockedConnect).toHaveBeenCalledTimes(1);

    const porty2 = CRSessionClient.init('test2');
    expect(porty2).toBeDefined();
    expect(porty2).not.toBe(porty);
    expect(mockedConnect).toHaveBeenCalledTimes(2);

    const porty3 = CRSessionClient.init('test3');
    expect(porty3).toBeDefined();
    expect(porty3).not.toBe(porty);
    expect(porty3).not.toBe(porty2);
    expect(mockedConnect).toHaveBeenCalledTimes(3);
  });

  it('should return `MessagePort` on init, and connect the extension', () => {
    expect(mockedConnect).not.toHaveBeenCalled();
    expect(extOnConnectListener).not.toHaveBeenCalled();

    domPort = CRSessionClient.init(testName);
    expect(domPort).toBeDefined();

    expect(mockedConnect).toHaveBeenCalled();
    expect(extOnConnectListener).toHaveBeenCalled();
  });

  it('should attach callbacks to the port and forward messages', async () => {
    const exampleMessage: TransportMessage = { message: 'example message', requestId: '123' };

    domPort = CRSessionClient.init(testName);

    expect(extOnMessageListener).not.toHaveBeenCalled();
    domPort.postMessage(exampleMessage);
    await vi.waitFor(() => expect(extOnMessageListener).toHaveBeenCalled());

    expect(extOnMessageListener).toHaveBeenLastCalledWith(
      exampleMessage,
      expect.objectContaining({
        name: expect.stringContaining(testName),
      }),
    );
    expect(mockedChannel.mockSenders).toHaveBeenLastCalledWith(
      expect.objectContaining({
        name: expect.stringContaining(testName),
      }),
    );
  });

  describe('should reliably report errors', () => {
    const testMessage: TransportMessage = { requestId: '123', message: 'normal message' };

    let connectPortPostMessage: Mock<[unknown], void>;

    let domPort: MessagePort;
    const domMessageHandler = vi.fn<[MessageEvent], void>();
    const domMessageErrorHandler = vi.fn<[MessageEvent], void>();

    beforeEach(() => {
      domMessageHandler.mockClear();
      domMessageErrorHandler.mockClear();

      domPort = CRSessionClient.init(testName);
      domPort.addEventListener('message', domMessageHandler);
      domPort.addEventListener('messageerror', domMessageErrorHandler);

      connectPortPostMessage = lastResult(mockedConnect).postMessage;

      domPort.start();
    });

    it('should respond with failure if forwarding the input throws an error', async () => {
      const postThrowError = Error('wololo');
      console.log('connectPortPostMessage.mock.calls', connectPortPostMessage.mock.calls);
      console.log('last mocked connect', lastResult(mockedConnect));
      connectPortPostMessage.mockImplementationOnce(() => {
        throw postThrowError;
      });

      expect(domMessageHandler).not.toHaveBeenCalled();
      domPort.postMessage(testMessage);
      await vi.waitFor(() => expect(domMessageHandler).toHaveBeenCalled());

      expect(domMessageHandler).toHaveBeenLastCalledWith(expect.any(MessageEvent));
      const [{ data: throwErrorResponse }]: [MessageEvent] = domMessageHandler.mock.lastCall!;

      expect(throwErrorResponse).toMatchObject({
        requestId: testMessage.requestId,
        error: errorToJson(ConnectError.from(postThrowError), undefined),
      });
    });

    it('should respond with failure if forwarding the input throws an error with cause detail', async () => {
      const postThrowError = new Error('bad thing', { cause: 'indeed' });

      connectPortPostMessage.mockImplementationOnce(() => {
        throw postThrowError;
      });

      expect(domMessageHandler).not.toHaveBeenCalled();
      domPort.postMessage(testMessage);
      await vi.waitFor(() => expect(domMessageHandler).toHaveBeenCalled());

      expect(domMessageHandler).toHaveBeenLastCalledWith(expect.any(MessageEvent));
      const [{ data: throwObjectResponse }]: [MessageEvent] = domMessageHandler.mock.lastCall!;

      console.log('throwObjectResponse', throwObjectResponse);
      expect(throwObjectResponse).toMatchObject({
        requestId: testMessage.requestId,
        error: { ...errorToJson(ConnectError.from(postThrowError), undefined) },
      });
    });

    it('should respond with failure if forwarding the input throws a non-error object', async () => {
      const postThrowObject = { seriously: 'you should probably be throwing errors' };

      connectPortPostMessage.mockImplementationOnce(() => {
        // eslint-disable-next-line @typescript-eslint/only-throw-error
        throw postThrowObject;
      });

      expect(domMessageHandler).not.toHaveBeenCalled();
      domPort.postMessage(testMessage);
      await vi.waitFor(() => expect(domMessageHandler).toHaveBeenCalled());

      expect(domMessageHandler).toHaveBeenLastCalledWith(expect.any(MessageEvent));
      const [{ data: throwObjectResponse }]: [MessageEvent] = domMessageHandler.mock.lastCall!;

      expect(throwObjectResponse).toMatchObject({
        requestId: testMessage.requestId,
        error: errorToJson(ConnectError.from(postThrowObject), undefined),
      });
    });

    it('should respond with failure if forwarding the input throws a non-serializeable object', async () => {
      const postThrowFunction = () => 'why would you do this';
      connectPortPostMessage.mockImplementationOnce(() => {
        // eslint-disable-next-line @typescript-eslint/only-throw-error
        throw postThrowFunction;
      });

      expect(domMessageHandler).not.toHaveBeenCalled();
      domPort.postMessage(testMessage);
      await vi.waitFor(() => expect(domMessageHandler).toHaveBeenCalled());

      expect(domMessageHandler).toHaveBeenLastCalledWith(expect.any(MessageEvent));
      const [{ data: throwFunctionResponse }]: [MessageEvent] = domMessageHandler.mock.lastCall!;

      expect(throwFunctionResponse).toMatchObject({
        requestId: testMessage.requestId,
        error: errorToJson(ConnectError.from(postThrowFunction), undefined),
      });
    });
  });

  describe("should respond with failure if the input isn't a valid message", () => {
    it.fails('should no longer silently fail if the input is not a `TransportEvent`', async () => {
      const mockWarn = vi.fn();

      const bustedMessage = { busted: true };

      domMessageHandler = vi.fn();
      domMessageErrorHandler = vi.fn();

      domPort = CRSessionClient.init(testName);
      domPort.addEventListener('message', domMessageHandler);
      domPort.addEventListener('messageerror', domMessageErrorHandler);
      domPort.start();

      vi.stubGlobal('console', { warn: mockWarn });
      domPort.postMessage(bustedMessage);
      await vi.waitFor(() =>
        expect(mockWarn).toHaveBeenCalledWith('Unknown item from client', bustedMessage),
      );

      expect(extOnMessageListener).not.toHaveBeenCalled();
      expect(domMessageErrorHandler).not.toHaveBeenCalled();
      expect(domMessageHandler).not.toHaveBeenCalled();
    });

    it('should respond with failure if the input is not a `TransportEvent`', async () => {
      domMessageHandler = vi.fn();
      domMessageErrorHandler = vi.fn();

      domPort = CRSessionClient.init(testName);
      domPort.addEventListener('message', domMessageHandler);
      domPort.addEventListener('messageerror', domMessageErrorHandler);
      domPort.start();

      const bustedMessage = { busted: true };
      domPort.postMessage(bustedMessage);

      await vi.waitFor(() => expect(domMessageHandler).toHaveBeenCalled());

      expect(domMessageHandler).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ error: expect.anything() }) }),
      );
      expect(extOnMessageListener).not.toHaveBeenCalled();
      expect(domMessageErrorHandler).not.toHaveBeenCalled();
    });

    it('should respond with failure if the input has no `requestId`', async () => {
      domMessageHandler = vi.fn();
      domMessageErrorHandler = vi.fn();

      domPort = CRSessionClient.init(testName);
      domPort.addEventListener('message', domMessageHandler);
      domPort.addEventListener('messageerror', domMessageErrorHandler);
      domPort.start();

      const badMessage = { message: 'requestId absent' };
      domPort.postMessage(badMessage);

      await vi.waitFor(() => expect(domMessageHandler).toHaveBeenCalled());

      expect(domMessageHandler).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ error: expect.anything() }) }),
      );
      expect(extOnMessageListener).not.toHaveBeenCalled();
      expect(domMessageErrorHandler).not.toHaveBeenCalled();
    });

    it('should respond with failures if the input is malformed', async () => {
      const goodMessage: TransportMessage = { requestId: '123', message: "this one's good" };
      const badMessage = { requestId: '456', messerg: "this one's bad" };

      domMessageHandler = vi.fn();
      domMessageErrorHandler = vi.fn();
      domPort = CRSessionClient.init(testName);
      domPort.addEventListener('message', domMessageHandler);
      domPort.addEventListener('messageerror', domMessageErrorHandler);
      domPort.start();

      domPort.postMessage(goodMessage);
      await vi.waitFor(() => expect(extOnMessageListener).toHaveBeenCalled());

      expect(extOnMessageListener).toHaveBeenLastCalledWith(
        goodMessage,
        expect.objectContaining({
          name: expect.stringContaining(testName),
        }),
      );

      domPort.postMessage(badMessage);
      await vi.waitFor(() => expect(domMessageHandler).toHaveBeenCalled());

      expect(extOnMessageListener).toHaveBeenCalledOnce(); // no new event on the extension side
      expect(domMessageHandler).toHaveBeenCalledOnce(); // but the message handler received an error
      expect(domMessageErrorHandler).not.toHaveBeenCalled(); // and the messageerror handler was not called
    });
  });

  describe('should respond with failure when the port is disconnected', () => {
    /**
     * there is no good way to identify that a closed `MessagePort` is closed.
     * so, this is guarded against by the transport.
     */
    it('should silently drop messages if the port is disconnected by client', async () => {
      const testMessage: TransportMessage = { message: 'going nowhere', requestId: '123' };
      domPort = CRSessionClient.init(testName);

      domPort.start();

      // disconnect port from client page
      expect(extOnDisconnectListener).not.toHaveBeenCalled();
      domPort.postMessage(false);
      await vi.waitFor(() => expect(extOnDisconnectListener).toHaveBeenCalledOnce());
      expect(extOnMessageListener).not.toHaveBeenCalled();

      const clientPort = lastResult(mockedChannel.mockPorts).connectPort;
      expect(clientPort.disconnect).toHaveBeenCalledOnce();
      expect(clientPort.postMessage).not.toHaveBeenCalled();

      // try to send a message again
      domPort.postMessage(testMessage);

      // no events to wait for, just give it a moment
      await new Promise(resolve => void setTimeout(resolve, 50));

      expect(clientPort.postMessage).not.toHaveBeenCalled();
      expect(extOnMessageListener).not.toHaveBeenCalled();
    });

    /**
     * the chrome message system will emit both a disconnect event to notify
     * listeners, and synchronous errors on use of a closed `chrome.runtime.Port`.
     */
    it('should respond with failures if the extension disconnects from the client', async () => {
      const testRequest: TransportMessage = { message: 'hello', requestId: '123' };
      const testRequest2: TransportMessage = { message: 'hello again', requestId: '456' };

      domPort = CRSessionClient.init(testName);

      expect(mockedConnect).toHaveBeenCalledWith(
        expect.objectContaining({
          name: expect.stringContaining(testName),
        }),
      );

      const connectOnDisconnectDispatch = lastResult(mockedConnect).onDisconnect.dispatch;

      domMessageHandler = vi.fn();
      domMessageErrorHandler = vi.fn();
      domPort.addEventListener('message', domMessageHandler);
      domPort.addEventListener('messageerror', domMessageErrorHandler);
      domPort.start();

      // just disconnect immediately
      lastResult(mockedChannel.mockPorts).onConnectPort.disconnect();

      // page will be notified of the disconnect
      await vi.waitFor(() => expect(domMessageHandler).toHaveBeenCalled());
      expect(domMessageHandler).toHaveBeenCalledWith(expect.objectContaining({ data: false }));

      // try to send a message again
      domPort.postMessage(testRequest);

      expect(extOnMessageListener).not.toHaveBeenCalled();
      expect(extOnDisconnectListener).toHaveBeenCalledOnce();
      expect(connectOnDisconnectDispatch).toHaveBeenCalledOnce();
      expect(domMessageErrorHandler).not.toHaveBeenCalled();

      // attempt to use the port again
      domPort.postMessage(testRequest2);
      await new Promise(resolve => void setTimeout(resolve, 10));

      // nothing will happen
      expect(extOnMessageListener).not.toHaveBeenCalled();
      expect(extOnDisconnectListener).toHaveBeenCalledOnce();
      expect(connectOnDisconnectDispatch).toHaveBeenCalledOnce();
      expect(domMessageErrorHandler).not.toHaveBeenCalled();
      expect(domMessageHandler).toHaveBeenCalledOnce();
    });

    it.todo('should transparently reconnect if the extension disconnects from the client', () =>
      expect.fail('not yet implemented'),
    );

    it.todo('should respond with failures if the client disconnects from the extension', () =>
      expect.fail('not yet implemented'),
    );
  });

  describe('stream subchannels', () => {
    it('when receiving a stream response, should try to connect to stream subchannels', async () => {
      const unaryRequest: TransportMessage = { message: 'unary message', requestId: '123' };
      const streamResponse: TransportInitChannel = { channel: 'some-channel', requestId: '123' };

      domPort = CRSessionClient.init(testName);
      expect(domPort).toBeDefined();
      expect(mockedConnect).toHaveBeenCalledOnce();
      expect(extOnConnectListener).toHaveBeenCalledOnce();

      extOnMessageListener.mockImplementationOnce((_, port) => port.postMessage(streamResponse));

      domPort.postMessage(unaryRequest);
      await vi.waitFor(() => expect(extOnMessageListener).toHaveBeenCalled());

      expect(extOnMessageListener).toHaveBeenCalledOnce();
      expect(extOnConnectListener).toHaveBeenCalledTimes(2);
      expect(mockedConnect).toHaveBeenCalledTimes(2);
      expect(mockedConnect).toHaveBeenCalledWith(
        expect.objectContaining({
          name: expect.stringContaining(streamResponse.channel),
        }),
      );
    });

    it.skip('when receiving a stream request, should try to open stream subchannels', () => {
      const streamRequest: TransportStream = { stream: new ReadableStream(), requestId: '123' };

      domPort = CRSessionClient.init(testName);
      expect(domPort).toBeDefined();
      expect(extOnConnectListener).toHaveBeenCalledOnce();

      expect(mockedConnect).toHaveBeenCalledTimes(1);
      domPort.postMessage(streamRequest, [streamRequest.stream]);
      // need to stub onConnect global for the client?
      // await vi.waitFor(() => expect(mockedConnect).toHaveBeenCalledTimes(2));
      // await vi.waitFor(() => expect(extOnMessageListener).toHaveBeenCalled());

      expect(extOnMessageListener).toHaveBeenCalledWith(
        expect.objectContaining({
          requestId: streamRequest.requestId,
          channel: expect.stringContaining('STREAM'),
        }),
      );
    });
  });
});
