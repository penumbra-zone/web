/* eslint-disable @typescript-eslint/no-unsafe-assignment -- tests */
import { vi, describe, it, expect, beforeEach, Mock } from 'vitest';
import { mockChannel, MockedChannel } from '@penumbra-zone/mock-chrome/runtime/connect';
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

const wait100 = () => new Promise(resolve => void setTimeout(resolve, 10));

const getLastMockedSenders = (mockedChannel: MockedChannel) => {
  expect(mockedChannel.mockSenders).toHaveBeenCalled();
  const lastResult = mockedChannel.mockSenders.mock.results.at(-1);
  if (lastResult?.type === 'return') {
    return lastResult.value;
  }
  expect.unreachable();
};

const getLastMockedPorts = (mockedChannel: MockedChannel) => {
  expect(mockedChannel.mockPorts).toHaveBeenCalled();
  const lastResult = mockedChannel.mockPorts.mock.results.at(-1);
  if (lastResult?.type === 'return') {
    return lastResult.value;
  }
  expect.unreachable();
};

describe('CRSessionClient', () => {
  let testName: string = undefined as never;

  let mockedConnect: MockedChannel['connect'];
  let mockedOnConnect: MockedChannel['onConnect'];
  let domPort: MessagePort | undefined;

  let mockedChannel: MockedChannel;

  const extOnDisconnectListener = vi.fn((p: chrome.runtime.Port) =>
    console.log('extOnDisconnectListener', p.name),
  );
  const extOnMessageListener = vi.fn((msg: unknown, p: chrome.runtime.Port) =>
    console.log('extOnMessageListener', p.name, msg),
  );
  const extOnConnectListener = vi.fn((p: chrome.runtime.Port) => {
    console.log('extOnConnectListener', p.name);
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

    // console.log('beforeEach', 'CRSessionClient.singleton', Boolean(CRSessionClient.singleton));
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
    const exampleMessage = { message: 'example message', requestId: '123' };

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

  it('should not forward messages if the port is disconnected', async () => {
    domPort = CRSessionClient.init(testName);

    domPort.start();

    expect(extOnDisconnectListener).not.toHaveBeenCalled();
    domPort.postMessage(false);
    // domPort.close();
    await vi.waitFor(() => expect(extOnDisconnectListener).toHaveBeenCalledOnce());
    expect(extOnMessageListener).not.toHaveBeenCalled();

    domPort.postMessage({ message: 'going nowhere', requestId: '123' });

    /** @todo wait??  detect disconnect error? */

    expect(extOnMessageListener).not.toHaveBeenCalled();
  });

  it('should drop input silently if it is not an expected structure', async () => {
    const mockConsole = {
      debug: vi.fn(),
      warn: vi.fn(),
      log: vi.fn(),
    };
    vi.stubGlobal('console', mockConsole);

    const bustedMessage = { busted: true };

    domMessageHandler = vi.fn();
    domMessageErrorHandler = vi.fn();

    domPort = CRSessionClient.init(testName);
    domPort.addEventListener('message', domMessageHandler);
    domPort.addEventListener('messageerror', domMessageErrorHandler);
    domPort.start();

    domPort.postMessage(bustedMessage);
    await vi.waitFor(() =>
      expect(mockConsole.warn).toHaveBeenCalledWith('Unknown item from client', bustedMessage),
    );

    expect(extOnMessageListener).not.toHaveBeenCalled();
    expect(domMessageErrorHandler).not.toHaveBeenCalled();
    expect(domMessageHandler).not.toHaveBeenCalled();
  });

  it.fails('should respond with failures if the input is not an expected type', async () => {
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

  it.fails('should respond with failures if the input is malformed', async () => {
    const goodMessage = { requestId: '123', message: "this one's good" };
    const badMessage = { requestId: '456', messerg: "this one's bad" };

    domMessageHandler = vi.fn();
    domMessageErrorHandler = vi.fn();
    domPort = CRSessionClient.init(testName);
    domPort.addEventListener('message', domMessageHandler);
    domPort.addEventListener('messageerror', domMessageErrorHandler);
    domPort.start();

    domPort.postMessage(goodMessage);
    await wait100();

    expect(extOnMessageListener).toHaveBeenCalledOnce();
    expect(extOnMessageListener).toHaveBeenCalledWith(
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

  it.skip('should respond with failures if the extension channel disconnects', async () => {
    domPort = CRSessionClient.init(testName);

    expect(mockedConnect).toHaveBeenCalled();
    expect(mockedConnect).toHaveReturnedWith(
      expect.objectContaining({
        name: expect.stringContaining(testName),
      }),
    );

    const extWorkerSender = getLastMockedSenders(mockedChannel).onConnectSender;
    const scPort = getLastMockedPorts(mockedChannel).connectPort;

    expect(scPort).toMatchObject({
      name: expect.stringContaining(testName),
      sender: extWorkerSender,
    });

    const tabDisconnectDispatch = scPort.onDisconnect.dispatch;
    expect(tabDisconnectDispatch).toBeDefined();

    domMessageHandler = vi.fn();
    domMessageErrorHandler = vi.fn();
    domPort.addEventListener('message', domMessageHandler);
    domPort.addEventListener('messageerror', domMessageErrorHandler);
    domPort.start();

    extOnMessageListener.mockImplementationOnce((msg, port) => {
      console.log('single call', msg);
      port.disconnect();
    });

    domPort.postMessage({ message: 'hello', requestId: '123' });
    await vi.waitFor(() => expect(extOnMessageListener).toHaveBeenCalled());

    expect(extOnMessageListener).toHaveBeenCalledOnce();
    expect(extOnDisconnectListener).toHaveBeenCalledOnce();
    expect(tabDisconnectDispatch).toHaveBeenCalledOnce();
    expect(domMessageErrorHandler).not.toHaveBeenCalled();

    // expect(domMessageHandler).toHaveBeenCalledWith(expect.any(MessageEvent));
    // expect(domMessageHandler).toHaveBeenCalledWith(expect.objectContaining({ data: false }));
    // TODO: why is the false missing?

    domPort.postMessage({ message: 'hello again', requestId: '456' });
    await new Promise(resolve => void setTimeout(resolve, 10));

    // nothing will happen
    expect(extOnMessageListener).toHaveBeenCalledOnce();
    expect(extOnDisconnectListener).toHaveBeenCalledOnce();
    expect(tabDisconnectDispatch).toHaveBeenCalledOnce();
    expect(domMessageHandler).toHaveBeenCalledOnce();
    expect(domMessageErrorHandler).not.toHaveBeenCalled();
  });

  it.skip('should accept a streaming response', async () => {
    const exampleMessage = { message: 'unary message', requestId: '123' };
    const exampleChannelInit = { requestId: '123', channel: 'some-channel' };

    domPort = CRSessionClient.init(testName);
    expect(domPort).toBeDefined();
    expect(mockedConnect).toHaveBeenCalledOnce();
    expect(extOnConnectListener).toHaveBeenCalledOnce();

    extOnMessageListener.mockImplementationOnce((_, port) => port.postMessage(exampleChannelInit));

    domPort.postMessage(exampleMessage);
    await vi.waitFor(() => expect(extOnMessageListener).toHaveBeenCalled());

    expect(extOnMessageListener).toHaveBeenCalledOnce();
    expect(extOnConnectListener).toHaveBeenCalledTimes(2);
    expect(mockedConnect).toHaveBeenCalledTimes(2);
    expect(mockedConnect).toHaveBeenCalledWith(
      expect.objectContaining({
        name: expect.stringContaining(testName),
      }),
    );
  });
});
