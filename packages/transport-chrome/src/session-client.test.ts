/* eslint-disable @typescript-eslint/no-unsafe-assignment -- tests */
import { vi, describe, it, expect, beforeEach, Mock } from 'vitest';
import { CRSessionClient } from './session-client.js';
import { mockChannel, MockedChannel } from '@penumbra-zone/mock-chrome/runtime/connect';

const wait100 = () => new Promise(resolve => void setTimeout(resolve, 10));
const waitFirstCall = <M extends Mock>(mocky: M, cb: () => void) => {
  expect(mocky).not.toHaveBeenCalled();
  cb();
  return vi.waitFor(() => expect(mocky).toHaveBeenCalledOnce());
};

describe('CRSessionClient', () => {
  const prefix = 'vitestPrefix';

  let mockConnect: MockedChannel['connect'];
  let mockOnConnect: MockedChannel['onConnect'];
  let domPort: MessagePort | undefined;

  let mockedChannel: MockedChannel;

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

  let extensionMessageHandler: Mock<[unknown, chrome.runtime.Port], void>;
  let extensionDisconnectHandler: Mock<[chrome.runtime.Port], void>;
  let extensionConnectHandler: Mock<[chrome.runtime.Port], void>;

  let domMessageHandler: Mock<[MessageEvent<unknown>], void>;
  let domMessageErrorHandler: Mock<[MessageEvent<unknown>], void>;

  beforeEach(() => {
    vi.restoreAllMocks();

    domPort?.close();
    domPort = undefined;

    extensionMessageHandler = vi.fn();
    extensionDisconnectHandler = vi.fn();
    extensionConnectHandler = vi.fn((p: chrome.runtime.Port) => {
      p.onMessage.addListener(extensionMessageHandler);
      p.onDisconnect.addListener(extensionDisconnectHandler);
    });

    domMessageHandler = vi.fn(a => console.debug('domMessageHandler', a.data, a));
    domMessageErrorHandler = vi.fn(a => console.debug('domMessageErrorHandler', a.data, a));

    mockedChannel = mockChannel();
    mockConnect = mockedChannel.connect;
    mockOnConnect = mockedChannel.onConnect;
    mockOnConnect.addListener(extensionConnectHandler);

    vi.stubGlobal('chrome', {
      runtime: { connect: mockedChannel.connect },
    });
  });

  it('should return `MessagePort` on init, and connect the extension', () => {
    domPort = CRSessionClient.init(prefix);
    expect(domPort).toBeDefined();
    expect(mockConnect).toHaveBeenCalled();
    expect(extensionConnectHandler).toHaveBeenCalled();
  });

  it('should attach callbacks to the port and forward messages', async () => {
    const exampleMessage = { message: 'bad message', requestId: '123' };

    domPort = CRSessionClient.init(prefix);
    expect(domPort).toBeDefined();
    expect(mockConnect).toHaveBeenCalled();
    expect(extensionConnectHandler).toHaveBeenCalled();
    expect(extensionMessageHandler).not.toHaveBeenCalled();

    domPort.postMessage(exampleMessage);

    await wait100();

    expect(mockedChannel.mockSenders).toHaveBeenCalled();

    expect(mockedChannel.mockSenders).toHaveBeenLastCalledWith(
      expect.objectContaining({
        name: expect.stringContaining(prefix),
      }),
    );
    expect(extensionMessageHandler).toHaveBeenCalledWith(
      exampleMessage,
      expect.objectContaining({
        name: expect.stringContaining(prefix),
      }),
    );
  });

  it('should not forward messages if the port is disconnected', async () => {
    domPort = CRSessionClient.init(prefix);
    expect(extensionConnectHandler).toHaveBeenCalled();
    expect(extensionMessageHandler).not.toHaveBeenCalled();
    expect(extensionDisconnectHandler).not.toHaveBeenCalled();

    domPort.start();

    await waitFirstCall(extensionDisconnectHandler, () => {
      domPort?.postMessage(false);
      domPort?.close();
    });
    expect(extensionMessageHandler).not.toHaveBeenCalled();

    domPort.postMessage({ message: 'going nowhere', requestId: '123' });

    await wait100();

    expect(extensionMessageHandler).not.toHaveBeenCalled();
  });

  it('should respond with failures if the input is unrecognized', async () => {
    domPort = CRSessionClient.init(prefix);
    domPort.addEventListener('message', domMessageHandler);
    domPort.addEventListener('messageerror', domMessageErrorHandler);
    domPort.start();

    domPort.postMessage({ busted: true });
    domPort.postMessage({ busted: 2 });

    await wait100();

    expect(extensionMessageHandler).not.toHaveBeenCalled();
    expect(domMessageErrorHandler).not.toHaveBeenCalled();
    expect(domMessageHandler).toHaveBeenCalled();
  });

  it('should respond with failures if the input is malformed', async () => {
    const goodMessage = { requestId: '123', message: "this one's good" };
    const badMessage = { requestId: '456', messerg: "this one's bad" };

    domPort = CRSessionClient.init(prefix);
    domPort.addEventListener('message', domMessageHandler);
    domPort.addEventListener('messageerror', domMessageErrorHandler);
    domPort.start();

    domPort.postMessage(goodMessage);
    await wait100();

    expect(extensionMessageHandler).toHaveBeenCalledOnce();
    expect(extensionMessageHandler).toHaveBeenCalledWith(
      goodMessage,
      expect.objectContaining({
        name: expect.stringContaining(prefix),
      }),
    );

    await waitFirstCall(domMessageHandler, () => domPort?.postMessage(badMessage));

    expect(extensionMessageHandler).toHaveBeenCalledOnce(); // no new event on the extension side
    expect(domMessageHandler).toHaveBeenCalledOnce(); // but the message handler received an error
    expect(domMessageErrorHandler).not.toHaveBeenCalled(); // and the messageerror handler was not called
  });

  it('should respond with failures if the extension channel disconnects', async () => {
    domPort = CRSessionClient.init(prefix);

    expect(mockConnect).toHaveBeenCalled();
    expect(mockConnect).toHaveReturnedWith(
      expect.objectContaining({
        name: expect.stringContaining(prefix),
      }),
    );

    const extWorkerSender = getLastMockedSenders(mockedChannel).onConnectSender;
    const scPort = getLastMockedPorts(mockedChannel).connectPort;

    expect(scPort).toMatchObject({
      name: expect.stringContaining(prefix),
      sender: extWorkerSender,
    });

    const tabDisconnectDispatch = scPort.onDisconnect.dispatch;
    expect(tabDisconnectDispatch).toBeDefined();

    domPort.addEventListener('message', domMessageHandler);
    domPort.addEventListener('messageerror', domMessageErrorHandler);
    domPort.start();

    extensionMessageHandler.mockImplementationOnce((msg, port) => {
      console.log('single call', msg);
      port.disconnect();
    });

    await waitFirstCall(extensionMessageHandler, () =>
      domPort?.postMessage({ message: 'hello', requestId: '123' }),
    );

    expect(extensionMessageHandler).toHaveBeenCalledOnce();
    expect(extensionDisconnectHandler).toHaveBeenCalledOnce();
    expect(tabDisconnectDispatch).toHaveBeenCalledOnce();
    expect(domMessageErrorHandler).not.toHaveBeenCalled();

    // expect(domMessageHandler).toHaveBeenCalledWith(expect.any(MessageEvent));
    // expect(domMessageHandler).toHaveBeenCalledWith(expect.objectContaining({ data: false }));
    // TODO: why is the false missing?

    domPort.postMessage({ message: 'hello again', requestId: '456' });
    await new Promise(resolve => void setTimeout(resolve, 10));

    // nothing will happen
    expect(extensionMessageHandler).toHaveBeenCalledOnce();
    expect(extensionDisconnectHandler).toHaveBeenCalledOnce();
    expect(tabDisconnectDispatch).toHaveBeenCalledOnce();
    expect(domMessageHandler).toHaveBeenCalledOnce();
    expect(domMessageErrorHandler).not.toHaveBeenCalled();
  });

  it('should accept a streaming response', async () => {
    const exampleMessage = { message: 'unary message', requestId: '123' };
    const exampleChannelInit = { requestId: '123', channel: 'some-channel' };

    domPort = CRSessionClient.init(prefix);
    expect(domPort).toBeDefined();
    expect(mockConnect).toHaveBeenCalledOnce();
    expect(extensionConnectHandler).toHaveBeenCalledOnce();

    extensionMessageHandler.mockImplementationOnce((_, port) =>
      port.postMessage(exampleChannelInit),
    );

    await waitFirstCall(extensionMessageHandler, () => domPort?.postMessage(exampleMessage));

    expect(extensionMessageHandler).toHaveBeenCalledOnce();
    expect(extensionConnectHandler).toHaveBeenCalledTimes(2);
    expect(mockConnect).toHaveBeenCalledTimes(2);
    expect(mockConnect).toHaveBeenCalledWith(
      expect.objectContaining({
        name: expect.stringContaining(prefix),
      }),
    );
  });
});
