import { JsonValue } from '@bufbuild/protobuf';
import { ConnectError } from '@connectrpc/connect';
import { errorToJson } from '@connectrpc/connect/protocol-connect';
import {
  mockChannel,
  MockedChannel,
  MockedPort,
  mockSendersDefault,
} from '@penumbra-zone/mock-chrome/runtime/connect';
import { ChannelHandlerFn } from '@penumbra-zone/transport-dom/adapter';
import { beforeEach, describe, expect, it, MockedFunction, vi } from 'vitest';
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

describe('CRSessionManager', () => {
  let testName: string;
  let mockedChannel: MockedChannel;
  const mockHandler: MockedFunction<ChannelHandlerFn> = vi.fn(
    async (
      req: JsonValue | ReadableStream<JsonValue>,
    ): Promise<JsonValue | ReadableStream<JsonValue>> => {
      console.log('mockHandler called', req);
      const res = 'test';
      return await Promise.resolve(res as JsonValue | ReadableStream<JsonValue>);
    },
  );
  const mockSenders = vi.fn((i?: chrome.runtime.ConnectInfo) => {
    console.log('mockSenders called', i);
    return mockSendersDefault(i);
  });

  beforeEach(({ expect }) => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();

    clearSingleton();

    testName = (expect.getState().currentTestName ?? 'no test name').split(' ').join('_');
    expect(testName).toBeDefined();

    mockedChannel = mockChannel({ mockSenders });

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

    const extHost = {
      id: 'test-extension-id',
      origin: 'chrome-extension://test-extension-id',
    };

    // Test extension origin

    const extClient = {
      id: 'test-extension-id',
      origin: 'chrome-extension://test-extension-id',
      url: 'chrome-extension://test-extension-id/index.html',
    };

    const localhostClient = {
      origin: 'http://localhost:8080',
    };

    const httpsClient = {
      origin: 'https://example.com',
      url: 'https://example.com/index.html',
      tab: {
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
      },
    };

    let channelName = nameConnection(testName, ChannelLabel.TRANSPORT);
    mockSenders.mockReturnValueOnce({ connectSender: extClient, onConnectSender: extHost });
    clientPort = mockedChannel.connect({ name: channelName });
    expect(clientPort).toMatchObject({ name: channelName, sender: extHost });

    channelName = nameConnection(testName, ChannelLabel.TRANSPORT);
    mockSenders.mockReturnValueOnce({ connectSender: localhostClient, onConnectSender: extHost });
    clientPort = mockedChannel.connect({ name: channelName });
    expect(clientPort).toMatchObject({ name: channelName, sender: extHost });

    channelName = nameConnection(testName, ChannelLabel.TRANSPORT);
    mockSenders.mockReturnValueOnce({ connectSender: httpsClient, onConnectSender: extHost });
    clientPort = mockedChannel.connect({ name: channelName });
    expect(clientPort).toMatchObject({ name: channelName, sender: extHost });
  });

  it('should handle unary requests', () => {
    CRSessionManager.init(testName, mockHandler);
    const responseData = { requestId: '123', message: 'test-response' };
    mockHandler.mockResolvedValueOnce(responseData);

    const channelName = nameConnection(testName, ChannelLabel.TRANSPORT);
    const clientPort = mockedChannel.connect({ name: channelName });

    const message = {
      requestId: '123',
      message: 'test-request',
    };

    clientPort.postMessage(message);

    expect(mockHandler).toHaveBeenCalledWith(message.message, expect.any(AbortSignal));
  });

  it('should handle errors in requests', async () => {
    const clientListener = vi.fn(m => console.log('clientListener', m));

    const handlerError = new Error('Handler error');
    const message = 'hello';
    const requestId = '123';

    CRSessionManager.init(testName, mockHandler);
    mockHandler.mockRejectedValueOnce(handlerError);

    const channelName = nameConnection(testName, ChannelLabel.TRANSPORT);
    const clientPort = mockedChannel.connect({ name: channelName });
    clientPort.onMessage.addListener(clientListener);

    clientPort.postMessage({ requestId, message });

    await vi.waitFor(() => expect(mockHandler).toHaveBeenCalled());
    await vi.waitFor(() => expect(clientListener).toHaveBeenCalled());

    expect(mockHandler).toHaveBeenLastCalledWith(message, expect.any(AbortSignal));
    expect(clientListener).toHaveBeenLastCalledWith(
      {
        requestId: '123',
        error: errorToJson(ConnectError.from(handlerError), undefined),
      },
      clientPort,
    );
  });

  it.todo('should clean up sessions on disconnect', async () => {
    const sessions = CRSessionManager.init(testName, mockHandler);

    const disconnectListener = vi.fn();
    mockedChannel.onConnect.addListener(p => p.onDisconnect.addListener(disconnectListener));

    const channelName = nameConnection(testName, ChannelLabel.TRANSPORT);
    const clientPort = mockedChannel.connect({ name: channelName });

    expect(sessions.size).toBe(1);
    expect(sessions.size).toBe(1);
    clientPort.disconnect();

    await vi.waitFor(() => expect(disconnectListener).toHaveBeenCalled());
    expect(sessions.size).toBe(0);
  });

  it.todo('should kill all sessions for an origin', () => {
    const sessions = CRSessionManager.init(testName, mockHandler);
    const origin = 'https://example.com';

    // Create multiple sessions for the same origin
    for (let i = 0; i < 3; i++) {
      const channelName = nameConnection(testName, ChannelLabel.TRANSPORT);
      mockedChannel.connect({ name: channelName });
    }

    expect(sessions.size).toBe(3);
    CRSessionManager.killOrigin(origin);
  });
});
