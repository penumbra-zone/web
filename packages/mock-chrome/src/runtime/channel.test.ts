import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mockChannel, MockedChannel } from './channel.mock.js';

describe('mockChannel', () => {
  let mockedChannel: MockedChannel;
  let testName: string = undefined as never;

  const extMessageListener = vi.fn<[unknown, chrome.runtime.Port], void>();
  const onConnectListener = vi.fn<[chrome.runtime.Port], void>(port =>
    port.onMessage.addListener(extMessageListener),
  );

  beforeEach(({ expect }) => {
    vi.clearAllMocks();

    expect(expect.getState().currentTestName).toBeDefined();
    testName = expect.getState().currentTestName!.split(' ').join('_');
    expect(testName).toBeDefined();

    mockedChannel = mockChannel();
    mockedChannel.onConnect.addListener(onConnectListener);
  });

  it('executes its configurable fixtures', () => {
    const clientPort = mockedChannel.connect({ name: testName });

    expect(clientPort).toBeDefined();
    expect(onConnectListener).toHaveBeenCalledOnce();
    expect(onConnectListener).toHaveBeenCalledWith(expect.objectContaining({ name: testName }));
    expect(mockedChannel.mockSenders).toHaveBeenCalledOnce();
    expect(mockedChannel.mockPorts).toHaveBeenCalledOnce();
  });

  it('transmits simple messages', () => {
    const extMessageListener = vi.fn<[unknown, chrome.runtime.Port], void>();

    onConnectListener.mockImplementationOnce(port => {
      port.onMessage.addListener(extMessageListener);
    });

    const clientPort = mockedChannel.connect({ name: testName });
    const extPort = onConnectListener.mock.lastCall?.[0];

    expect(extPort?.name).toBe(testName);

    const randomString = crypto.randomUUID();
    clientPort.postMessage(randomString);
    expect(extMessageListener).toHaveBeenCalledWith(randomString, extPort);
  });

  it('transmits JSON items', () => {
    const extMessageListener = vi.fn<[unknown, chrome.runtime.Port], void>();

    onConnectListener.mockImplementationOnce(port => {
      port.onMessage.addListener(extMessageListener);
    });

    const clientPort = mockedChannel.connect({ name: testName });
    const extPort = onConnectListener.mock.lastCall?.[0];

    expect(extPort?.name).toBe(testName);

    const complexMessage = {
      first_name: 'John',
      last_name: 'Smith',
      is_alive: true,
      age: 27,
      address: {
        street_address: '21 2nd Street',
        city: 'New York',
        state: 'NY',
        postal_code: '10021-3100',
      },
      phone_numbers: [
        { type: 'home', number: '212 555-1234' },
        { type: 'office', number: '646 555-4567' },
      ],
      children: ['Catherine', 'Thomas', 'Trevor'],
      spouse: null,
    };

    clientPort.postMessage(complexMessage);
    expect(extMessageListener).toHaveBeenCalledWith(complexMessage, extPort);
  });

  it('degrades non-JSONifiable items', () => {
    onConnectListener.mockImplementationOnce(port => {
      port.onMessage.addListener(extMessageListener);
    });

    const clientPort = mockedChannel.connect({ name: testName });
    const extPort = onConnectListener.mock.lastCall?.[0];

    expect(extPort?.name).toBe(testName);

    // doesn't transmit functions
    const functionMessage = {
      test: 'functionMessage',
      data: (...no: unknown[]) => console.log(no, 'yes'),
    };

    clientPort.postMessage(functionMessage);

    expect(extMessageListener).toHaveBeenCalledWith({ test: 'functionMessage' }, extPort);

    extMessageListener.mockClear();

    // doesn't transmit streams
    const streamMessage = { test: 'streamMessage', data: new ReadableStream() };

    clientPort.postMessage(streamMessage);

    expect(extMessageListener).toHaveBeenLastCalledWith(
      { test: 'streamMessage', data: {} },
      extPort,
    );

    extMessageListener.mockClear();

    // doesn't transmit byte fields
    const byteMessage = {
      test: 'byteMessage',
      data: new Uint8Array([0, 1, 2, 4, 8, 16, 32, 64, 128]),
    };

    clientPort.postMessage(byteMessage);

    expect(extMessageListener).toHaveBeenLastCalledWith(
      { test: 'byteMessage', data: { 0: 0, 1: 1, 2: 2, 3: 4, 4: 8, 5: 16, 6: 32, 7: 64, 8: 128 } },
      extPort,
    );

    extMessageListener.mockClear();

    // doesn't transmit errors
    const errorMessage = { test: 'errorMessage', data: new Error('test error') };

    clientPort.postMessage(errorMessage);

    expect(extMessageListener).toHaveBeenLastCalledWith(
      { test: 'errorMessage', data: {} },
      extPort,
    );

    extMessageListener.mockClear();

    const bigintMessage = { test: 'bigintMessage', data: BigInt(1234567890) };

    expect(() => clientPort.postMessage(bigintMessage)).toThrowError(
      /**
       * @todo difference between vitest and chrome. in chrome, this is actually:
       * ```
       * Uncaught TypeError: Error in invocation of runtime.sendMessage(optional string extensionId, any message, optional object options, optional function callback): Could not serialize message.
       * ```
       */
      TypeError('Do not know how to serialize a BigInt'),
    );

    expect(extMessageListener).not.toHaveBeenCalled();
  });

  it('disconnects properly', () => {
    const extDisconnectListener = vi.fn<[chrome.runtime.Port], void>();
    onConnectListener.mockImplementationOnce(port => {
      port.onMessage.addListener(extMessageListener);
      port.onDisconnect.addListener(extDisconnectListener);
    });

    const clientPort = mockedChannel.connect({ name: testName });

    const clientDisconnectListener = vi.fn<[], void>();
    clientPort.onDisconnect.addListener(clientDisconnectListener);
    const clientMessageListener = vi.fn<[unknown], void>();
    clientPort.onMessage.addListener(clientMessageListener);

    const extPort = onConnectListener.mock.lastCall![0];

    expect(extDisconnectListener).not.toHaveBeenCalled();
    expect(clientDisconnectListener).not.toHaveBeenCalled();

    extPort.postMessage("it's working");
    expect(clientMessageListener).toHaveBeenCalledWith("it's working", clientPort);

    clientPort.disconnect();

    expect(extDisconnectListener).toHaveBeenCalledWith(extPort);
    // disconnect event does not fire on the side which called disconnect
    expect(clientDisconnectListener).not.toHaveBeenCalled();

    expect(() => clientPort.postMessage("won't make it")).toThrow(
      'Attempting to use a disconnected port object',
    );

    expect(extMessageListener).not.toHaveBeenCalled();

    clientMessageListener.mockClear();

    expect(() => extPort.postMessage("won't make it")).toThrow(
      'Attempting to use a disconnected port object',
    );

    expect(clientMessageListener).not.toHaveBeenCalled();
  });
});
