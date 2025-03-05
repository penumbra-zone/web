import type { JsonValue } from '@bufbuild/protobuf';
import { ConnectError } from '@connectrpc/connect';
import { errorToJson } from '@connectrpc/connect/protocol-connect';
import type { ChannelHandlerFn } from '@penumbra-zone/transport-dom/adapter';
import { mockChannel, type MockedChannel } from '@repo/mock-chrome/runtime/channel.mock';
import { beforeEach, describe, expect, it, type MockedFunction, vi } from 'vitest';
import { ChannelLabel, nameConnection } from './channel-names.js';
import { CRSessionManager } from './session-manager.js';
import { lastResult } from './util/test/last-result.js';
import { getSingleMapItem } from './util/test/get-single-map-item.js';

describe('CRSessionManager', () => {
  let testName: string;
  let mockedChannel: MockedChannel;

  const tab: chrome.tabs.Tab = {
    id: 1,
    index: 0,
    pinned: false,
    highlighted: false,
    windowId: 1,
    incognito: false,
    active: true,
    selected: true,
    discarded: false,
    autoDiscardable: false,
    groupId: -1,
  };

  const extHost: chrome.runtime.MessageSender = {
    id: 'test-extension-id',
    origin: 'chrome-extension://test-extension-id',
  };

  // extension page client
  const extClient: chrome.runtime.MessageSender = {
    id: 'test-extension-id',
    origin: 'chrome-extension://test-extension-id',
    url: 'chrome-extension://test-extension-id/index.html',
    tab,
  };

  // localhost dapp client
  const localhostClient: chrome.runtime.MessageSender = {
    origin: 'http://localhost:8080',
    url: 'http://localhost:8080/index.html',
    tab,
  };

  // https dapp client
  const httpsClient: chrome.runtime.MessageSender = {
    origin: 'https://example.com',
    url: 'https://example.com/index.html',
    tab,
  };

  const httpClient: chrome.runtime.MessageSender = {
    origin: 'http://example.com',
    url: 'http://example.com/index.html',
    tab,
  };

  const checkPortSender = vi.fn(
    (port: chrome.runtime.Port): Promise<chrome.runtime.Port & { sender: { origin: string } }> => {
      return Promise.resolve(port as chrome.runtime.Port & { sender: { origin: string } });
    },
  );

  const mockHandler: MockedFunction<ChannelHandlerFn> = vi.fn(
    async (
      req: JsonValue | ReadableStream<JsonValue>,
    ): Promise<JsonValue | ReadableStream<JsonValue>> => {
      expect(req).toBeDefined();
      const res = 'test';
      return await Promise.resolve(res as JsonValue | ReadableStream<JsonValue>);
    },
  );

  beforeEach(({ expect }) => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();

    if (!Object.hasOwn(CRSessionManager, 'clearSingleton')) {
      Object.assign(CRSessionManager, {
        clearSingleton() {
          // @ts-expect-error -- manipulating undeclared private property
          CRSessionManager.singleton = undefined;
        },
      });
    }
    // @ts-expect-error -- calling undeclared method
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    CRSessionManager.clearSingleton();

    testName = (expect.getState().currentTestName ?? 'no test name').split(' ').join('_');
    expect(testName).toBeDefined();

    mockedChannel = mockChannel({
      mockSenders: vi.fn(() => ({
        connectSender: httpsClient,
        onConnectSender: extHost,
      })),
    });

    vi.stubGlobal('chrome', {
      runtime: {
        onConnect: mockedChannel.onConnect,
        id: 'test-extension-id',
      },
    });
  });

  it('should be a singleton', () => {
    const sessions1 = CRSessionManager.init(testName, mockHandler, checkPortSender);
    expect(sessions1).toBeDefined();
    expect(sessions1).toBeInstanceOf(Map);

    const sessions2 = CRSessionManager.init(testName, mockHandler, checkPortSender);
    expect(sessions2).toBe(sessions1);
  });

  describe('origin validation', () => {
    const testRequest = { requestId: '123', message: 'test' };
    const allSenders = [extClient, localhostClient, httpsClient, httpClient];

    describe('internal sender validation', () => {
      it.fails.each(allSenders)(
        'should handle $origin according to internal sender validation logic',
        async someSender => {
          const badSenders = [httpClient];
          const sessions = CRSessionManager.init(testName, mockHandler, checkPortSender);
          expect(sessions.size).toBe(0);

          const channelName = nameConnection(testName, ChannelLabel.TRANSPORT);
          mockedChannel.mockSenders.mockReturnValueOnce({
            connectSender: someSender,
            onConnectSender: extHost,
          });

          const clientPort = mockedChannel.connect({ name: channelName });
          expect(clientPort).toMatchObject({ name: channelName, sender: extHost });

          await vi.waitFor(() => expect(mockedChannel.onConnect.dispatch).toHaveBeenCalled());

          if (badSenders.includes(someSender)) {
            expect(
              lastResult(mockedChannel.mockPorts).onConnectPort.onMessage.addListener,
            ).not.toHaveBeenCalled();
            expect(sessions.size).toBe(0);
          } else {
            expect(
              lastResult(mockedChannel.mockPorts).onConnectPort.onMessage.addListener,
            ).toHaveBeenCalled();
            expect(sessions.size).toBe(1);
          }

          clientPort.postMessage(testRequest);

          if (!badSenders.includes(someSender)) {
            await vi.waitFor(() =>
              expect(mockHandler).toHaveBeenLastCalledWith(
                testRequest.message,
                expect.any(AbortSignal),
              ),
            );
          } else {
            expect(
              lastResult(mockedChannel.mockPorts).onConnectPort.onMessage.addListener,
            ).not.toHaveBeenCalled();
            expect(mockHandler).not.toHaveBeenCalled();
          }

          expect(checkPortSender).not.toHaveBeenCalled();
        },
      );
    });

    describe('parameterized sender validation', () => {
      const badSendersKeys = Array.from(allSenders.keys())
        .sort(() => Math.random() - 0.5)
        .slice(2);
      const badSenders = badSendersKeys.map(k => allSenders[k]);
      it.each(allSenders)(
        `should handle sender %# according to async validation callback forbidding ${badSendersKeys.join(', ')}`,
        async someSender => {
          checkPortSender.mockImplementation(port =>
            badSenders.includes(port.sender)
              ? Promise.reject(new Error('Bad sender'))
              : Promise.resolve(port as chrome.runtime.Port & { sender: { origin: string } }),
          );

          const sessions = CRSessionManager.init(testName, mockHandler, checkPortSender);
          expect(sessions.size).toBe(0);

          const channelName = nameConnection(testName, ChannelLabel.TRANSPORT);
          mockedChannel.mockSenders.mockReturnValueOnce({
            connectSender: someSender,
            onConnectSender: extHost,
          });

          const clientPort = mockedChannel.connect({ name: channelName });

          await vi.waitFor(
            () =>
              expect(checkPortSender).toHaveBeenCalledWith(
                expect.objectContaining({ name: channelName, sender: someSender }),
              ),
            { timeout: 100 },
          );

          // session will be created and listeners attached unconditionally
          await vi.waitFor(() => expect(sessions.size).toBe(1));

          if (badSenders.includes(someSender)) {
            // session will be aborted after validation callback rejects
            await vi.waitFor(() => expect(sessions.size).toBe(0));
            expect(checkPortSender.mock.results.at(-1)?.type).toBe('throw');
          }

          expect(
            lastResult(mockedChannel.mockPorts).onConnectPort.onMessage.addListener,
          ).toHaveBeenCalled();

          expect(mockHandler).not.toHaveBeenCalled();

          if (badSenders.includes(someSender)) {
            expect(() => clientPort.postMessage(testRequest)).toThrowError(
              'Attempting to use a disconnected port object',
            );
            expect(mockHandler).not.toHaveBeenCalled();
          } else {
            clientPort.postMessage(testRequest);
            await vi.waitFor(() =>
              expect(mockHandler).toHaveBeenLastCalledWith(
                testRequest.message,
                expect.any(AbortSignal),
              ),
            );
          }
        },
      );
    });
  });

  describe('request handling', () => {
    it('should handle unary requests, and generate a response', async () => {
      const testRequest = { requestId: '123', message: 'test-request' };
      const clientListener = vi.fn();

      const sessions = CRSessionManager.init(testName, mockHandler, checkPortSender);
      expect(sessions.size).toBe(0);

      const testResponse = { requestId: '123', message: 'test-response' };
      mockHandler.mockResolvedValueOnce(testResponse.message);

      const channelName = nameConnection(testName, ChannelLabel.TRANSPORT);
      const clientPort = mockedChannel.connect({ name: channelName });
      clientPort.onMessage.addListener(clientListener);

      await vi.waitFor(() => expect(sessions.size).toBe(1));
      expect(mockHandler).not.toHaveBeenCalled();
      clientPort.postMessage(testRequest);

      await vi.waitFor(() => expect(clientListener).toHaveBeenCalled());
      expect(mockHandler).toHaveBeenCalledWith(testRequest.message, expect.any(AbortSignal));
      expect(clientListener).toHaveBeenLastCalledWith(testResponse, clientPort);
    });

    it('should handle requests that generate a response stream by announcing a new channel', async () => {
      const testRequest = { requestId: '123', message: 'test-request' };
      const clientListener = vi.fn();

      const sessions = CRSessionManager.init(testName, mockHandler, checkPortSender);
      expect(sessions.size).toBe(0);

      mockHandler.mockResolvedValueOnce(
        new ReadableStream({
          start: cont => {
            cont.enqueue({ value: 'a' });
            cont.enqueue({ value: 'b' });
            cont.enqueue({ value: 'c' });
            cont.enqueue({ done: true });
            cont.close();
          },
        }),
      );

      const channelName = nameConnection(testName, ChannelLabel.TRANSPORT);
      const clientPort = mockedChannel.connect({ name: channelName });
      clientPort.onMessage.addListener(clientListener);

      expect(mockedChannel.onConnect.addListener).toHaveBeenCalledTimes(1);
      const mgrPort = lastResult(mockedChannel.mockPorts).onConnectPort;
      await vi.waitFor(() => expect(mgrPort.onMessage.addListener).toHaveBeenCalled());

      clientPort.postMessage(testRequest);

      await vi.waitFor(() => expect(mockHandler).toHaveBeenCalled());

      await vi.waitFor(() => expect(mockedChannel.onConnect.addListener).toHaveBeenCalledTimes(2));

      expect(mockHandler).toHaveBeenLastCalledWith(testRequest.message, expect.any(AbortSignal));
      await vi.waitFor(() => expect(clientPort.onMessage.dispatch).toHaveBeenCalled());

      expect(clientListener).toHaveBeenLastCalledWith(
        expect.objectContaining({
          requestId: testRequest.requestId,
          channel: expect.stringMatching(`^${testName} STREAM `) as string,
        }),
        clientPort,
      );
    });

    it('should forward errors thrown by request handlers', async () => {
      const handlerError = new Error('Handler error');
      const testRequest = { requestId: '123', message: 'hello' };
      const testResponse = {
        requestId: '123',
        error: errorToJson(ConnectError.from(handlerError), undefined),
      };
      const clientListener = vi.fn();

      const sessions = CRSessionManager.init(testName, mockHandler, checkPortSender);

      const channelName = nameConnection(testName, ChannelLabel.TRANSPORT);
      const clientPort = mockedChannel.connect({ name: channelName });
      clientPort.onMessage.addListener(clientListener);

      mockHandler.mockRejectedValueOnce(handlerError);

      await vi.waitFor(() => expect(sessions.size).toBe(1));
      // make a request that triggers an error from the handler
      clientPort.postMessage(testRequest);
      // wait for the serialized error response
      await vi.waitFor(() => expect(clientListener).toHaveBeenCalled());

      expect(mockHandler).toHaveBeenLastCalledWith(testRequest.message, expect.any(AbortSignal));
      expect(clientListener).toHaveBeenLastCalledWith(testResponse, clientPort);
    });
  });

  describe('session management', () => {
    it('should abort sessions on client disconnect', async () => {
      const sessions = CRSessionManager.init(testName, mockHandler, checkPortSender);
      expect(sessions.size).toBe(0);

      const channelName = nameConnection(testName, ChannelLabel.TRANSPORT);
      const clientPort = mockedChannel.connect({ name: channelName });

      await vi.waitFor(() => expect(sessions.size).toBe(1));
      const testSession = getSingleMapItem(sessions);

      clientPort.disconnect();

      await vi.waitFor(() =>
        expect(
          lastResult(mockedChannel.mockPorts).onConnectPort.onDisconnect.dispatch,
        ).toHaveBeenCalled(),
      );

      await vi.waitFor(() => expect(testSession.signal.aborted).toBe(true));
    });

    it('should disconnect sessions on session abort', async () => {
      const sessions = CRSessionManager.init(testName, mockHandler, checkPortSender);
      expect(sessions.size).toBe(0);

      const channelName = nameConnection(testName, ChannelLabel.TRANSPORT);
      const clientPort = mockedChannel.connect({ name: channelName });

      await vi.waitFor(() => expect(sessions.size).toBe(1));
      const testSession = getSingleMapItem(sessions);

      testSession.abort();

      await vi.waitFor(() => expect(testSession.signal.aborted).toBe(true));

      expect(clientPort.onDisconnect.dispatch).toHaveBeenCalled();
    });

    it('should remove aborted sessions from the session list', async () => {
      const sessions = CRSessionManager.init(testName, mockHandler, checkPortSender);
      expect(sessions.size).toBe(0);

      const channelName = nameConnection(testName, ChannelLabel.TRANSPORT);
      const clientPort = mockedChannel.connect({ name: channelName });

      await vi.waitFor(() => expect(sessions.size).toBe(1));
      const testSession = getSingleMapItem(sessions);

      clientPort.disconnect();

      await vi.waitFor(() => expect(testSession.signal.aborted).toBe(true));

      expect(sessions.size).toBe(0);
    });

    it('should abort all sessions for specific origin when killOrigin is called', async () => {
      const testRequest = { requestId: '123', message: 'test' };

      const sessions = CRSessionManager.init(testName, mockHandler, checkPortSender);
      expect(sessions.size).toBe(0);

      // Create a session for some other origin
      mockedChannel.mockSenders.mockReturnValueOnce({
        connectSender: localhostClient,
        onConnectSender: extHost,
      });
      const localhostClientPort = mockedChannel.connect({
        name: nameConnection(testName, ChannelLabel.TRANSPORT),
      });
      const localhostClientListener = vi.fn();
      localhostClientPort.onMessage.addListener(localhostClientListener);

      // Create multiple sessions for the same origin
      const httpsClientPorts = [
        mockedChannel.connect({ name: nameConnection(testName, ChannelLabel.TRANSPORT) }),
        mockedChannel.connect({ name: nameConnection(testName, ChannelLabel.TRANSPORT) }),
        mockedChannel.connect({ name: nameConnection(testName, ChannelLabel.TRANSPORT) }),
      ];

      mockedChannel.mockSenders.mockReturnValueOnce({
        connectSender: extClient,
        onConnectSender: extHost,
      });
      const extClientPort = mockedChannel.connect({
        name: nameConnection(testName, ChannelLabel.TRANSPORT),
      });
      const extClientListener = vi.fn();
      extClientPort.onMessage.addListener(extClientListener);

      await vi.waitFor(() => expect(sessions.size).toBe(5));
      // expect(checkPortSender).toHaveBeenCalledTimes(5);

      const targetOrigin = httpsClient.origin!;

      const sessionsSnapshot = Array.from(sessions.values());
      expect(sessionsSnapshot.some(session => session.signal.aborted)).toBeFalsy();

      // kill
      CRSessionManager.killOrigin(targetOrigin);
      expect(sessionsSnapshot.some(session => session.signal.aborted)).toBeTruthy();

      expect(
        sessionsSnapshot.every(
          session => session.signal.aborted === (session.sender.origin === targetOrigin),
        ),
      ).toBeTruthy();

      // the other sessions should continue to function normally
      extClientPort.postMessage(testRequest);
      await vi.waitFor(() => expect(extClientListener).toHaveBeenCalled());
      expect(mockHandler).toHaveBeenLastCalledWith(testRequest.message, expect.any(AbortSignal));
      mockHandler.mockClear();

      localhostClientPort.postMessage(testRequest);
      await vi.waitFor(() => expect(localhostClientListener).toHaveBeenCalled());
      expect(mockHandler).toHaveBeenLastCalledWith(testRequest.message, expect.any(AbortSignal));
      mockHandler.mockClear();

      // the aborted sessions should not be able to send messages
      for (const port of httpsClientPorts) {
        expect(() => port.postMessage(testRequest)).toThrowError(
          'Attempting to use a disconnected port object',
        );
        expect(mockHandler).not.toHaveBeenCalled();
      }
    });
  });
});
