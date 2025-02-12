/* eslint-disable @typescript-eslint/no-unsafe-assignment -- test code */
import type { JsonValue } from '@bufbuild/protobuf';
import { ConnectError } from '@connectrpc/connect';
import { errorToJson } from '@connectrpc/connect/protocol-connect';
import {
  mockChannel,
  type MockedChannel,
  type MockedPort,
  type MockSendersImpl,
} from '@penumbra-zone/mock-chrome/runtime/connect';
import type { ChannelHandlerFn } from '@penumbra-zone/transport-dom/adapter';
import { beforeEach, describe, expect, it, type MockedFunction, vi } from 'vitest';
import { ChannelLabel, nameConnection } from './channel-names.js';
import { CRSessionManager } from './session-manager.js';

Object.assign(CRSessionManager, {
  clearSingleton() {
    // @ts-expect-error -- manipulating private property
    CRSessionManager.singleton = undefined;
  },
  currentSingleton(): CRSessionManager | undefined {
    // @ts-expect-error -- manipulating private property
    return CRSessionManager.singleton;
  },
});

// @ts-expect-error -- manipulating private property
// eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
const clearSingleton = (): void => CRSessionManager.clearSingleton();

const getOnlySession = (sessions: ReturnType<typeof CRSessionManager.init>) => {
  expect(sessions.size).toBe(1);
  const onlySession = sessions.values().next();
  if (!onlySession.done) {
    return onlySession.value;
  }
  expect.unreachable('No session found');
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const lastResult = <T extends (...args: any[]) => any>(mfn: MockedFunction<T>): ReturnType<T> => {
  const last = mfn.mock.results.at(-1);
  if (last?.type === 'return') {
    return last.value as never;
  }
  throw last?.value;
};

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
  const httpsClient = {
    origin: 'https://example.com',
    url: 'https://example.com/index.html',
    tab,
  };

  const httpClient = {
    origin: 'http://example.com',
    url: 'http://example.com/index.html',
    tab,
  };

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

    clearSingleton();

    testName = (expect.getState().currentTestName ?? 'no test name').split(' ').join('_');
    expect(testName).toBeDefined();

    mockedChannel = mockChannel({
      mockSenders: vi.fn<Parameters<MockSendersImpl>>(() => ({
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
    const sessions1 = CRSessionManager.init(testName, mockHandler);
    expect(sessions1).toBeDefined();
    expect(sessions1).toBeInstanceOf(Map);

    const sessions2 = CRSessionManager.init(testName, mockHandler);
    expect(sessions2).toBe(sessions1);
  });

  it('should accept connections from valid origins', () => {
    const sessions = CRSessionManager.init(testName, mockHandler);
    expect(sessions.size).toBe(0);

    let clientPort: MockedPort | undefined;

    let channelName = nameConnection(testName, ChannelLabel.TRANSPORT);
    mockedChannel.mockSenders.mockReturnValueOnce({
      connectSender: extClient,
      onConnectSender: extHost,
    });
    clientPort = mockedChannel.connect({ name: channelName });
    expect(clientPort).toMatchObject({ name: channelName, sender: extHost });

    channelName = nameConnection(testName, ChannelLabel.TRANSPORT);
    mockedChannel.mockSenders.mockReturnValueOnce({
      connectSender: localhostClient,
      onConnectSender: extHost,
    });
    clientPort = mockedChannel.connect({ name: channelName });
    expect(clientPort).toMatchObject({ name: channelName, sender: extHost });

    channelName = nameConnection(testName, ChannelLabel.TRANSPORT);
    mockedChannel.mockSenders.mockReturnValueOnce({
      connectSender: httpsClient,
      onConnectSender: extHost,
    });
    clientPort = mockedChannel.connect({ name: channelName });
    expect(clientPort).toMatchObject({ name: channelName, sender: extHost });
  });

  it('should ignore connections from invalid origins', async () => {
    const sessions = CRSessionManager.init(testName, mockHandler);
    expect(sessions.size).toBe(0);

    const channelName = nameConnection(testName, ChannelLabel.TRANSPORT);
    mockedChannel.mockSenders.mockReturnValueOnce({
      connectSender: httpClient,
      onConnectSender: undefined as never,
    });

    const clientPort = mockedChannel.connect({ name: channelName });
    await vi.waitFor(() => expect(mockedChannel.onConnect.dispatch).toHaveBeenCalled());

    expect(lastResult(mockedChannel.mockPorts).onConnectPort.onMessage.listeners.size).toBe(0);

    clientPort.postMessage({ requestId: '123', message: 'test' });
    expect(mockHandler).not.toHaveBeenCalled();
  });

  it('should handle unary requests, and generate a response', async () => {
    const testRequest = { requestId: '123', message: 'test-request' };
    const clientListener = vi.fn();

    const sessions = CRSessionManager.init(testName, mockHandler);
    expect(sessions.size).toBe(0);

    const testResponse = { requestId: '123', message: 'test-response' };
    mockHandler.mockResolvedValueOnce(testResponse.message);

    const channelName = nameConnection(testName, ChannelLabel.TRANSPORT);
    const clientPort = mockedChannel.connect({ name: channelName });
    clientPort.onMessage.addListener(clientListener);

    clientPort.postMessage(testRequest);

    await vi.waitFor(() => expect(clientListener).toHaveBeenCalled());
    expect(mockHandler).toHaveBeenCalledWith(testRequest.message, expect.any(AbortSignal));
    expect(clientListener).toHaveBeenLastCalledWith(testResponse, clientPort);
  });

  it('should handle requests that generate a response stream by announcing a new channel', async () => {
    const testRequest = { requestId: '123', message: 'test-request' };
    const clientListener = vi.fn();

    const sessions = CRSessionManager.init(testName, mockHandler);
    expect(sessions.size).toBe(0);

    mockHandler.mockResolvedValueOnce(new ReadableStream({ pull: cont => cont.close() }));
    const channelName = nameConnection(testName, ChannelLabel.TRANSPORT);
    const clientPort = mockedChannel.connect({ name: channelName });
    clientPort.onMessage.addListener(clientListener);

    expect(mockedChannel.onConnect.addListener).toHaveBeenCalledTimes(1);
    clientPort.postMessage(testRequest);
    await vi.waitFor(() => expect(mockedChannel.onConnect.addListener).toHaveBeenCalledTimes(2));

    expect(mockHandler).toHaveBeenLastCalledWith(testRequest.message, expect.any(AbortSignal));
    expect(clientListener).toHaveBeenLastCalledWith(
      expect.objectContaining({
        requestId: testRequest.requestId,
        channel: expect.stringMatching(`^${testName} STREAM `),
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

    CRSessionManager.init(testName, mockHandler);

    const channelName = nameConnection(testName, ChannelLabel.TRANSPORT);
    const clientPort = mockedChannel.connect({ name: channelName });
    clientPort.onMessage.addListener(clientListener);

    // make a request that triggers an error from the handler
    mockHandler.mockRejectedValueOnce(handlerError);
    clientPort.postMessage(testRequest);
    // wait for the serialized error response
    await vi.waitFor(() => expect(clientListener).toHaveBeenCalled());

    expect(mockHandler).toHaveBeenLastCalledWith(testRequest.message, expect.any(AbortSignal));
    expect(clientListener).toHaveBeenLastCalledWith(testResponse, clientPort);
  });

  it('should abort sessions on client disconnect', async () => {
    const sessions = CRSessionManager.init(testName, mockHandler);
    expect(sessions.size).toBe(0);

    const channelName = nameConnection(testName, ChannelLabel.TRANSPORT);
    const clientPort = mockedChannel.connect({ name: channelName });
    expect(sessions.size).toBe(1);
    const testSession = getOnlySession(sessions);

    clientPort.disconnect();
    await vi.waitFor(() =>
      expect(
        lastResult(mockedChannel.mockPorts).onConnectPort.onDisconnect.dispatch,
      ).toHaveBeenCalled(),
    );

    expect(testSession.signal.aborted).toBe(true);
  });

  it('should abort all sessions for specific origin when killOrigin is called', async () => {
    const testRequest = { requestId: '123', message: 'test' };

    const sessions = CRSessionManager.init(testName, mockHandler);
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

    expect(sessions.size).toBe(5);

    for (const session of sessions.values()) {
      expect(session.signal.aborted).toBe(false);
    }

    CRSessionManager.killOrigin(httpsClient.origin);

    for (const session of sessions.values()) {
      expect(session.signal.aborted).toBe(session.origin === httpsClient.origin);
    }

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
