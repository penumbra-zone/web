/* eslint-disable @typescript-eslint/no-unsafe-assignment -- tests */
import { ConnectError } from '@connectrpc/connect';
import { errorToJson } from '@connectrpc/connect/protocol-connect';
import { mockChannel, MockedChannel } from '@penumbra-zone/mock-chrome/runtime/connect';
import type { TransportMessage, TransportStream } from '@penumbra-zone/transport-dom/messages';
import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest';
import { ChannelLabel, nameConnection } from './channel-names.js';
import { lastResult } from './last-result.js';
import type { TransportInitChannel } from './message.js';
import { CRSessionClient } from './session-client.js';

Object.assign(CRSessionClient, {
  clearSingleton() {
    // @ts-expect-error -- manipulating private property
    CRSessionClient.singleton = undefined;
  },
});

// @ts-expect-error -- manipulating private property
// eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
const clearSingleton = (): void => CRSessionClient.clearSingleton();

describe('CRSessionClient', () => {
  let testName: string = undefined as never;

  let domPort: MessagePort | undefined;

  let mockedChannel: MockedChannel;

  let domMessageHandler: undefined | Mock<[MessageEvent<unknown>], void>;
  let domMessageErrorHandler: undefined | Mock<[MessageEvent<unknown>], void>;

  beforeEach(({ expect }) => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    vi.stubGlobal('__DEV__', true);

    clearSingleton();

    testName = (expect.getState().currentTestName ?? 'no test name').split(' ').join('_');
    expect(testName).toBeDefined();

    domMessageHandler = undefined;
    domMessageErrorHandler = undefined;
    domPort = undefined;

    mockedChannel = mockChannel();

    vi.stubGlobal('chrome', { runtime: { connect: mockedChannel.connect } });
  });

  it('should return `MessagePort` on init, and connect the extension', () => {
    expect(mockedChannel.connect).not.toHaveBeenCalled();
    expect(mockedChannel.onConnect.dispatch).not.toHaveBeenCalled();

    domPort = CRSessionClient.init(testName);
    expect(domPort).toBeDefined();

    expect(mockedChannel.connect).toHaveBeenCalledOnce();
    expect(mockedChannel.onConnect.dispatch).toHaveBeenCalledOnce();
  });

  it('should return the same port for multiple calls', () => {
    const ports: MessagePort[] = [];

    for (let i = 0; i < 3; i++) {
      ports.push(CRSessionClient.init(testName));
      ports.map(porty => expect(porty).toBeInstanceOf(MessagePort));
      expect(ports.every(porty => ports.every(porty2 => porty === porty2))).toBe(true);
      expect(mockedChannel.connect).toHaveBeenCalledTimes(1);
    }
  });

  it.todo('should not return the same port for multiple calls', () => {
    const ports: MessagePort[] = [];

    for (let i = 0; i < 3; i++) {
      ports.push(CRSessionClient.init(testName));
      ports.map(porty => expect(porty).toBeInstanceOf(MessagePort));
      expect(
        ports.every((porty, index) => {
          const portsWithoutPorty = ports.slice(0, index).concat(ports.slice(index + 1));
          return portsWithoutPorty.every(notPorty => porty !== notPorty);
        }),
      ).toBe(false);
      expect(mockedChannel.connect).toHaveBeenCalledTimes(ports.length);
    }
  });

  it('should attach callbacks to the port and forward messages', async () => {
    const exampleMessage: TransportMessage = { message: 'example message', requestId: '123' };

    domPort = CRSessionClient.init(testName);

    const extPort = lastResult(mockedChannel.mockPorts).onConnectPort;

    expect(extPort.onMessage.dispatch).not.toHaveBeenCalled();
    domPort.postMessage(exampleMessage);
    await vi.waitFor(() => expect(extPort.onMessage.dispatch).toHaveBeenCalled());

    expect(extPort.onMessage.dispatch).toHaveBeenLastCalledWith(
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

      connectPortPostMessage = lastResult(mockedChannel.connect).postMessage;

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

    it.todo(
      'updated: should respond with failure if forwarding the input throws an error',
      async () => {
        const postThrowError = Error('wololo');
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
      },
    );

    it.todo(
      'updated: should respond with failure if forwarding the input throws an error with cause detail',
      async () => {
        const postThrowError = new Error('bad thing', { cause: 'indeed' });

        connectPortPostMessage.mockImplementationOnce(() => {
          throw postThrowError;
        });

        expect(domMessageHandler).not.toHaveBeenCalled();
        domPort.postMessage(testMessage);
        await vi.waitFor(() => expect(domMessageHandler).toHaveBeenCalled());

        expect(domMessageHandler).toHaveBeenLastCalledWith(expect.any(MessageEvent));
        const [{ data: throwObjectResponse }]: [MessageEvent] = domMessageHandler.mock.lastCall!;

        expect(throwObjectResponse).toMatchObject({
          requestId: testMessage.requestId,
          error: { ...errorToJson(ConnectError.from(postThrowError), undefined) },
        });
      },
    );

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

    it.todo(
      'updated: should respond with failure if forwarding the input throws a non-error object',
      async () => {
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
      },
    );

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

    it.todo(
      'updated: should respond with failure if forwarding the input throws a non-serializeable object',
      async () => {
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

      const extPort = lastResult(mockedChannel.mockPorts).onConnectPort;

      vi.stubGlobal('console', { warn: mockWarn });
      domPort.postMessage(bustedMessage);
      await vi.waitFor(() =>
        expect(mockWarn).toHaveBeenCalledWith('Unknown item from client', bustedMessage),
      );

      expect(extPort.onMessage.dispatch).not.toHaveBeenCalled();
      expect(domMessageErrorHandler).not.toHaveBeenCalled();
      expect(domMessageHandler).not.toHaveBeenCalled();
    });

    it.fails.todo(
      'updated: should no longer silently fail if the input is not a `TransportEvent`',
      async () => {
        const mockWarn = vi.fn();

        const bustedMessage = { busted: true };

        domMessageHandler = vi.fn();
        domMessageErrorHandler = vi.fn();

        domPort = CRSessionClient.init(testName);
        domPort.addEventListener('message', domMessageHandler);
        domPort.addEventListener('messageerror', domMessageErrorHandler);
        domPort.start();

        const extPort = lastResult(mockedChannel.mockPorts).onConnectPort;

        vi.stubGlobal('console', { warn: mockWarn });
        domPort.postMessage(bustedMessage);
        await vi.waitFor(() =>
          expect(mockWarn).toHaveBeenCalledWith('Unknown item from client', bustedMessage),
        );

        expect(extPort.onMessage.dispatch).not.toHaveBeenCalled();
        expect(domMessageErrorHandler).not.toHaveBeenCalled();
        expect(domMessageHandler).not.toHaveBeenCalled();
      },
    );

    it.todo('should respond with failure if the input is not a `TransportEvent`', async () => {
      domMessageHandler = vi.fn();
      domMessageErrorHandler = vi.fn();

      domPort = CRSessionClient.init(testName);
      domPort.addEventListener('message', domMessageHandler);
      domPort.addEventListener('messageerror', domMessageErrorHandler);
      domPort.start();

      const extPort = lastResult(mockedChannel.mockPorts).onConnectPort;

      const bustedMessage = { busted: true };
      domPort.postMessage(bustedMessage);

      await vi.waitFor(() => expect(domMessageHandler).toHaveBeenCalled());

      expect(domMessageHandler).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ error: expect.anything() }) }),
      );
      expect(extPort.onMessage.dispatch).not.toHaveBeenCalled();
      expect(domMessageErrorHandler).not.toHaveBeenCalled();
    });

    it.todo('should respond with failure if the input has no `requestId`', async () => {
      domMessageHandler = vi.fn();
      domMessageErrorHandler = vi.fn();

      domPort = CRSessionClient.init(testName);
      domPort.addEventListener('message', domMessageHandler);
      domPort.addEventListener('messageerror', domMessageErrorHandler);
      domPort.start();

      const extPort = lastResult(mockedChannel.mockPorts).onConnectPort;

      const badMessage = { message: 'requestId absent' };
      domPort.postMessage(badMessage);

      await vi.waitFor(() => expect(domMessageHandler).toHaveBeenCalled());

      expect(domMessageHandler).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ error: expect.anything() }) }),
      );
      expect(extPort.onMessage.dispatch).not.toHaveBeenCalled();
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

      const extPort = lastResult(mockedChannel.mockPorts).onConnectPort;

      domPort.postMessage(goodMessage);
      await vi.waitFor(() => expect(extPort.onMessage.dispatch).toHaveBeenCalled());

      expect(extPort.onMessage.dispatch).toHaveBeenLastCalledWith(
        goodMessage,
        expect.objectContaining({
          name: expect.stringContaining(testName),
        }),
      );

      domPort.postMessage(badMessage);
      await vi.waitFor(() => expect(domMessageHandler).toHaveBeenCalled());

      expect(extPort.onMessage.dispatch).toHaveBeenCalledOnce(); // no new event on the extension side
      expect(domMessageHandler).toHaveBeenCalledOnce(); // but the message handler received an error
      expect(domMessageErrorHandler).not.toHaveBeenCalled(); // and the messageerror handler was not called
    });
  });

  describe('situations where the port is disconnected', () => {
    /**
     * there is no good way to identify that a closed `MessagePort` is closed.
     * so, this must be guarded against by logic in transport-dom.
     */
    // present behavior
    it('should silently drop messages if the port is disconnected by client', async () => {
      const testMessage: TransportMessage = { message: 'going nowhere', requestId: '123' };
      domPort = CRSessionClient.init(testName);
      domPort.start();
      const extPort = lastResult(mockedChannel.mockPorts).onConnectPort;

      // disconnect port from client page
      expect(extPort.onDisconnect.dispatch).not.toHaveBeenCalled();
      domPort.postMessage(false);
      await vi.waitFor(() => expect(extPort.onDisconnect.dispatch).toHaveBeenCalledOnce());
      expect(extPort.onMessage.dispatch).not.toHaveBeenCalled();

      const clientPort = lastResult(mockedChannel.mockPorts).connectPort;
      expect(clientPort.disconnect).toHaveBeenCalledOnce();
      expect(clientPort.postMessage).not.toHaveBeenCalled();

      // try to send a message again
      domPort.postMessage(testMessage);

      // no events to wait for, just give it a moment
      await new Promise(resolve => void setTimeout(resolve, 50));

      expect(clientPort.postMessage).not.toHaveBeenCalled();
      expect(extPort.onMessage.dispatch).not.toHaveBeenCalled();
    });

    /**
     * the chrome message system will emit both a disconnect event to notify
     * listeners, and synchronous errors on use of a closed `chrome.runtime.Port`.
     */
    // present behavior
    it('should respond with failures if the extension disconnects from the client', async () => {
      const testRequest: TransportMessage = { message: 'hello', requestId: '123' };
      const testRequest2: TransportMessage = { message: 'hello again', requestId: '456' };

      domPort = CRSessionClient.init(testName);

      expect(mockedChannel.connect).toHaveBeenCalledWith(
        expect.objectContaining({
          name: expect.stringContaining(testName),
        }),
      );

      domMessageHandler = vi.fn();
      domMessageErrorHandler = vi.fn();
      domPort.addEventListener('message', domMessageHandler);
      domPort.addEventListener('messageerror', domMessageErrorHandler);
      domPort.start();

      const { connectPort: sessionPort, onConnectPort: extPort } = lastResult(
        mockedChannel.mockPorts,
      );
      const expectStateAtDisconnect = () => {
        expect(domMessageErrorHandler).not.toHaveBeenCalled();
        expect(domMessageHandler).toHaveBeenCalledOnce();
        expect(domMessageHandler).toHaveBeenLastCalledWith(
          expect.objectContaining({ data: false }),
        );

        expect(extPort.onMessage.dispatch).not.toHaveBeenCalled();
        expect(extPort.onDisconnect.dispatch).toHaveBeenCalledOnce();
        expect(sessionPort.onDisconnect.dispatch).toHaveBeenCalledOnce();
      };

      expect(domMessageHandler).not.toHaveBeenCalled();

      // extension-side disconnect
      extPort.disconnect();
      // page will be notified of the extension-side disconnect
      await vi.waitFor(() => expect(domMessageHandler).toHaveBeenCalled());

      // state at disconnect
      expectStateAtDisconnect();

      // try to send a message again
      domPort.postMessage(testRequest);
      domPort.postMessage(testRequest2);
      await new Promise(resolve => void setTimeout(resolve, 10));

      // same state as before
      expectStateAtDisconnect();
    });

    it.todo(
      'updated: should respond with failures if the extension port is disconnected by the client',
      async () => {
        const testRequest: TransportMessage = { message: 'hello', requestId: '123' };
        const testRequest2: TransportMessage = { message: 'hello again', requestId: '456' };

        domPort = CRSessionClient.init(testName);

        expect(mockedChannel.connect).toHaveBeenCalledWith(
          expect.objectContaining({
            name: expect.stringContaining(testName),
          }),
        );

        const sessionPort = lastResult(mockedChannel.connect);

        domMessageHandler = vi.fn();
        domMessageErrorHandler = vi.fn();
        domPort.addEventListener('message', domMessageHandler);
        domPort.addEventListener('messageerror', domMessageErrorHandler);
        domPort.start();

        await vi.waitFor(() => expect(extOnConnectListener).toHaveBeenCalled());

        // just disconnect immediately
        lastResult(mockedChannel.mockPorts).onConnectPort.disconnect();

        // page will not be notified of the disconnect
        await vi.waitFor(() => expect(domMessageHandler).not.toHaveBeenCalled());

        // try to send a message again
        domPort.postMessage(testRequest);

        expect(sessionPort.onDisconnect.dispatch).toHaveBeenCalledOnce();
        expect(domMessageErrorHandler).not.toHaveBeenCalled();

        // attempt to use the port again
        domPort.postMessage(testRequest2);
        await new Promise(resolve => void setTimeout(resolve, 10));

        // nothing will happen
        expect(sessionPort.onDisconnect.dispatch).toHaveBeenCalledOnce();
        expect(sessionPort.postMessage).not.toHaveBeenCalled();
        expect(domMessageErrorHandler).not.toHaveBeenCalled();
        expect(domMessageHandler).not.toHaveBeenCalled();
      },
    );

    it.todo('should transparently reconnect if the extension disconnects from the client', () =>
      expect.fail('not yet implemented'),
    );

    it.todo('should respond with failures if the client disconnects from the extension', () =>
      expect.fail('not yet implemented'),
    );
  });

  describe('stream subchannels', () => {
    it('when receiving a stream channel response, should connect to stream subchannels', async () => {
      const unaryRequest: TransportMessage = { message: 'unary message', requestId: '123' };
      const streamResponse: TransportInitChannel = {
        channel: nameConnection(testName, ChannelLabel.STREAM),
        requestId: '123',
      };

      const extStreamConnectListener = vi.fn<[ChromePort]>();
      const extOnMessageListener = vi.fn<[unknown, ChromePort]>();
      const extSessionConnectListener = vi.fn((port: ChromePort) => {
        if (port.name.startsWith(testName)) {
          port.onMessage.addListener(extOnMessageListener);
        }
      });

      mockedChannel.onConnect.addListener(extSessionConnectListener);

      domPort = CRSessionClient.init(testName);
      expect(domPort).toBeDefined();
      expect(mockedChannel.connect).toHaveBeenCalledTimes(1);
      expect(mockedChannel.onConnect.dispatch).toHaveBeenCalledTimes(1);

      extOnMessageListener.mockImplementationOnce((_, port) => {
        mockedChannel.onConnect.addListener(extStreamConnectListener);
        port.postMessage(streamResponse);
      });
      domPort.postMessage(unaryRequest);
      await vi.waitFor(() => expect(mockedChannel.onConnect.dispatch).toHaveBeenCalledTimes(2));

      expect(mockedChannel.connect).toHaveBeenCalledTimes(2);
      expect(extOnMessageListener).toHaveBeenCalledOnce();
      expect(extStreamConnectListener).toHaveBeenCalledOnce();
      expect(extSessionConnectListener).toHaveBeenLastCalledWith(
        expect.objectContaining({
          name: streamResponse.channel,
        }),
      );
      expect(mockedChannel.connect).toHaveBeenLastCalledWith(
        expect.objectContaining({ name: streamResponse.channel }),
      );
    });

    it.todo(
      'when making a stream channel request, should listen for stream subchannels',
      async () => {
        const mockedChannel2 = mockChannel();

        // stub the chrome runtime in both directions, for this test
        vi.stubGlobal('chrome', {
          runtime: { connect: mockedChannel.connect, onConnect: mockedChannel2.onConnect },
        });

        const streamRequest: TransportStream = { stream: new ReadableStream(), requestId: '123' };

        domPort = CRSessionClient.init(testName);
        expect(domPort).toBeDefined();
        expect(mockedChannel.connect).toHaveBeenCalledOnce();
        expect(lastResult(mockedChannel.mockPorts).onConnectPort).toBeDefined();

        domPort.postMessage(streamRequest, [streamRequest.stream]);
        await vi.waitFor(() => expect(mockedChannel2.onConnect.addListener).toHaveBeenCalled());

        expect(lastResult(mockedChannel2.mockPorts).onConnectPort).toHaveBeenCalledWith(
          expect.objectContaining({
            requestId: streamRequest.requestId,
            channel: expect.stringContaining(ChannelLabel.STREAM),
          }),
        );
      },
    );
  });
});
