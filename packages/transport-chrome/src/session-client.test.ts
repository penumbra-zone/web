/* eslint-disable @typescript-eslint/no-unsafe-assignment -- tests */
import { mockChannel, MockedChannel } from '@penumbra-zone/mock-chrome/runtime/connect';
import type { TransportMessage, TransportStream } from '@penumbra-zone/transport-dom/messages';
import { beforeEach, describe, expect, it, type Mock, type MockedFunction, vi } from 'vitest';
import type { TransportInitChannel } from './message.js';
import { CRSessionClient } from './session-client.js';

Object.assign(CRSessionClient, {
  clearSingleton() {
    // @ts-expect-error -- manipulating private property
    CRSessionClient.singleton = undefined;
  },
  currentSingleton(): CRSessionClient | undefined {
    // @ts-expect-error -- manipulating private property
    return CRSessionClient.singleton;
  },
});

// @ts-expect-error -- manipulating private property
// eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
const clearSingleton = (): void => CRSessionClient.clearSingleton();

// @ts-expect-error -- manipulating private property
// eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
const currentSingleton = (): CRSessionClient | undefined => CRSessionClient.currentSingleton();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const lastResult = <T extends (...args: any[]) => any>(mfn: MockedFunction<T>): ReturnType<T> => {
  const last = mfn.mock.results.at(-1);
  if (last?.type === 'return') {
    return last.value as never;
  }
  throw last?.value;
};

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

    clearSingleton();

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

  it('should be a singleton', () => {
    expect(CRSessionClient).toBeDefined();
    expect(currentSingleton()).not.toBeDefined();

    const porty = CRSessionClient.init('test');
    expect(porty).toBeDefined();
    expect(currentSingleton()).toBeDefined();

    const singleton = currentSingleton();

    const porty2 = CRSessionClient.init('test2');
    expect(porty2).toBeDefined();
    expect(currentSingleton()).toBe(singleton);

    clearSingleton();
    expect(currentSingleton()).not.toBeDefined();
    const porty3 = CRSessionClient.init('test3');
    expect(porty3).toBeDefined();
    expect(currentSingleton()).toBeDefined();
    expect(currentSingleton()).not.toBe(singleton);
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

  describe('should respond with failure if forwarding the input throws an error', () => {
    const testMessage: TransportMessage = { requestId: '123', message: 'normal message' };
    const postThrowError = Error('wololo');
    const postThrowFunction = () => 'why would you do this?';
    const postThrowObject = { seriously: 'you should probably be throwing errors' };

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
      expect(domMessageHandler).not.toHaveBeenCalled();

      connectPortPostMessage.mockImplementationOnce(() => {
        throw postThrowError;
      });

      domPort.postMessage(testMessage);
      await vi.waitFor(() => expect(domMessageHandler).toHaveBeenCalled());
      expect(domMessageErrorHandler).not.toHaveBeenCalled();
      expect(domMessageHandler).toHaveBeenLastCalledWith(expect.any(MessageEvent));
      const [{ data: throwErrorResponse }]: [MessageEvent] = domMessageHandler.mock.lastCall!;

      /** @todo should include a requestId whenever possible */
      expect(throwErrorResponse).not.toHaveProperty('requestId');
      /** @todo check for possible improvements */
      expect(throwErrorResponse).toMatchObject({
        error: {
          message: postThrowError.message,
          details: [
            {
              type: postThrowError.name,
              value: postThrowError.cause,
            },
            testMessage,
          ],
        },
      });
    });

    it('should respond with failure if forwarding the input throws a non-error object', async () => {
      connectPortPostMessage.mockImplementationOnce(() => {
        // eslint-disable-next-line @typescript-eslint/only-throw-error
        throw postThrowObject;
      });

      domPort.postMessage(testMessage);
      await vi.waitFor(() => expect(domMessageHandler).toHaveBeenCalled());
      expect(domMessageHandler).toHaveBeenLastCalledWith(expect.any(MessageEvent));
      const [{ data: throwObjectResponse }]: [MessageEvent] = domMessageHandler.mock.lastCall!;

      expect(throwObjectResponse).not.toHaveProperty('requestId');
      expect(throwObjectResponse).toMatchObject({
        error: {
          message: String(postThrowObject),
          details: [
            {
              type: (Object.getPrototypeOf(postThrowObject) as unknown)?.constructor?.name,
              value: postThrowObject,
            },
            testMessage,
          ],
        },
      });
    });

    it.fails.skip(
      'will incorrectly fail to respond, throwing an uncaught `DataCloneError` when attempting to report some throwables',
      async () => {
        connectPortPostMessage.mockImplementationOnce(() => {
          // eslint-disable-next-line @typescript-eslint/only-throw-error
          throw postThrowFunction;
        });

        domPort.postMessage(testMessage);

        await vi.waitFor(() => expect(domMessageHandler).toHaveBeenCalled());
        expect(domMessageHandler).toHaveBeenLastCalledWith(expect.any(MessageEvent));
        const [{ data: throwFunctionResponse }]: [MessageEvent] = domMessageHandler.mock.lastCall!;

        expect(throwFunctionResponse).not.toHaveProperty('requestId');
        expect(throwFunctionResponse).toMatchObject({
          error: {
            message: String(postThrowFunction),
            details: [
              {
                type: postThrowFunction.name,
                value: postThrowFunction,
              },
              testMessage,
            ],
          },
        });
      },
    );
  });

  describe("should respond with failure if the input isn't a valid message", () => {
    // present behavior
    it('should silently fail if the input is not a `TransportEvent`', async () => {
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

    it.todo('should respond with failure if the input is not a `TransportEvent`', async () => {
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

    it.todo('should respond with failure if the input has no `requestId`', async () => {
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

    it.todo('should respond with failures if the input is malformed', async () => {
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
    // present behavior
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

    // present behavior
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
      expect.fail(),
    );

    it.todo('should respond with failures if the client disconnects from the extension', () =>
      expect.fail(),
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

    // presently fails, but in the wrong way.
    it.fails.todo(
      'when receiving a stream request, should try to open stream subchannels',
      async () => {
        const streamRequest: TransportStream = { stream: new ReadableStream(), requestId: '123' };

        domPort = CRSessionClient.init(testName);
        expect(domPort).toBeDefined();
        expect(mockedConnect).toHaveBeenCalledOnce();
        expect(extOnConnectListener).toHaveBeenCalledOnce();

        domPort.postMessage(streamRequest, [streamRequest.stream]);
        await vi.waitFor(() => expect(extOnMessageListener).toHaveBeenCalled());

        expect(extOnMessageListener).toHaveBeenCalledWith(
          expect.objectContaining({
            requestId: streamRequest.requestId,
            channel: expect.stringContaining('STREAM'),
          }),
        );
      },
    );
  });
});
