/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  ConverseRequest,
  ConverseResponse,
  IntroduceRequest,
  IntroduceResponse,
  SayRequest,
  SayResponse,
} from '@buf/connectrpc_eliza.bufbuild_es/connectrpc/eliza/v1/eliza_pb.js';
import { ElizaService } from '@buf/connectrpc_eliza.connectrpc_es/connectrpc/eliza/v1/eliza_connect.js';
import { Any, createRegistry, type PlainMessage } from '@bufbuild/protobuf';
import type { Transport } from '@connectrpc/connect';
import { mockChannel, MockedChannel } from '@penumbra-zone/mock-chrome/runtime/connect';
import { CRSessionClient } from '@penumbra-zone/transport-chrome/session-client';
import {
  type ChannelTransportOptions,
  createChannelTransport,
} from '@penumbra-zone/transport-dom/create';
import type { TransportMessage } from '@penumbra-zone/transport-dom/messages';
import { beforeEach, describe, expect, it, Mock, onTestFinished, vi } from 'vitest';
import { ChannelLabel, nameConnection } from './channel-names.js';
import { lastResult, replaceUnhandledRejectionListener } from './util/test-utils.js';

import ReadableStream from '@penumbra-zone/transport-dom/ReadableStream.from';
import { PortStreamSink } from './stream.js';
import { TransportInitChannel } from './message.js';

Object.assign(CRSessionClient, {
  clearSingleton() {
    // @ts-expect-error -- manipulating private property
    CRSessionClient.singleton = undefined;
  },
});

// @ts-expect-error -- manipulating private property
// eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
const clearSingleton = (): void => CRSessionClient.clearSingleton();

const sayRequest: PlainMessage<SayRequest> = { sentence: 'Hello' };
const sayResponse: PlainMessage<SayResponse> = { sentence: 'world' };
const introduceRequest: PlainMessage<IntroduceRequest> = { name: 'Qud' };
const introduceResponses: PlainMessage<IntroduceResponse>[] = [
  { sentence: 'Yo' },
  { sentence: 'This' },
  { sentence: 'Streams' },
];
const converseRequests: PlainMessage<ConverseRequest>[] = [
  { sentence: 'Hello' },
  { sentence: 'world' },
];
const converseResponses: PlainMessage<ConverseResponse>[] = [
  { sentence: 'Goodbye' },
  { sentence: 'world' },
];
const defaultTimeoutMs = 200;

const typeRegistry = createRegistry(ElizaService);

describe('message transport', () => {
  let domPort: MessagePort;
  let transportOptions: ChannelTransportOptions;
  let transport: Transport;

  const defaultTimeoutMs = 10000;

  const extOnMessage: Mock<[unknown, chrome.runtime.Port], void> = vi.fn();
  const extOnDisconnect: Mock<[chrome.runtime.Port], void> = vi.fn();
  const extOnConnect = vi.fn((p: chrome.runtime.Port): void => {
    p.onDisconnect.addListener(extOnDisconnect);
    p.onMessage.addListener(extOnMessage);
  });

  let mockedChannel: MockedChannel;
  let mockedChannel2: MockedChannel;

  beforeEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();

    clearSingleton();

    mockedChannel = mockChannel();
    mockedChannel2 = mockChannel();
    mockedChannel.onConnect.addListener(extOnConnect);

    vi.stubGlobal('chrome', {
      runtime: {
        connect: mockedChannel.connect,
        onConnect: mockedChannel2.onConnect,
      },
    });

    domPort = CRSessionClient.init('test');

    transportOptions = {
      getPort: () => Promise.resolve(domPort),
      jsonOptions: { typeRegistry },
      defaultTimeoutMs,
    };
    transport = createChannelTransport(transportOptions);
  });

  it('should send and receive unary request/response', async () => {
    const unaryRequestResponse = transport.unary(
      ElizaService,
      ElizaService.methods.say,
      undefined,
      undefined,
      undefined,
      new SayRequest(sayRequest),
    );

    extOnMessage.mockImplementation((m, p) => {
      const { requestId, message } = m as TransportMessage;
      expect(requestId).toBeTypeOf('string');
      expect(message).toMatchObject({
        ...sayRequest,
        '@type': 'type.googleapis.com/connectrpc.eliza.v1.SayRequest',
      });

      p.postMessage({
        requestId,
        message: {
          ...sayResponse,
          '@type': 'type.googleapis.com/connectrpc.eliza.v1.SayResponse',
        },
      });
    });

    await vi.waitFor(() => expect(extOnMessage).toHaveBeenCalled());

    await expect(unaryRequestResponse).resolves.toMatchObject({ message: sayResponse });
  });

  it('should send and receive server-streaming request/response', async () => {
    const streamChannel = nameConnection('test', ChannelLabel.STREAM);
    const streamListener = vi.fn((sub: chrome.runtime.Port) => {
      if (sub.name === streamChannel) {
        mockedChannel.onConnect.removeListener(streamListener);
        const stream = new ReadableStream({
          start(cont) {
            for (const chunk of introduceResponses) {
              cont.enqueue(Any.pack(new IntroduceResponse(chunk)).toJson({ typeRegistry }));
            }
            cont.close();
          },
        });

        void stream
          .pipeTo(new WritableStream(new PortStreamSink(sub)))
          .finally(() => sub.disconnect());
      }
    });

    extOnMessage.mockImplementation((m, p) => {
      const { requestId } = m as TransportMessage;

      mockedChannel.onConnect.addListener(streamListener);
      p.postMessage({ requestId, channel: streamChannel });
    });

    const streamRequestResponse = transport.stream(
      ElizaService,
      ElizaService.methods.introduce,
      undefined,
      undefined,
      undefined,
      ReadableStream.from([new IntroduceRequest(introduceRequest)]),
    );

    await vi.waitFor(() => {
      expect(mockedChannel.connect).toHaveBeenCalledTimes(2);
      expect(mockedChannel.connect).toHaveBeenLastCalledWith({ name: streamChannel });
    });
    const streamPort = lastResult(mockedChannel.connect);
    expect(streamListener).toHaveBeenCalled();
    expect(streamPort.onMessage.dispatch).toHaveBeenCalled();

    const response = await streamRequestResponse;
    console.log('response.message', response.message);

    for await (const chunk of response.message) {
      console.log('chunk', chunk);
    }
  });

  it('should send and receive bidi-streaming request/response', async () => {
    const responseChannelName = nameConnection('test', ChannelLabel.STREAM);
    const responseOnConnectListener = vi.fn((sub: chrome.runtime.Port) => {
      if (sub.name === responseChannelName) {
        mockedChannel.onConnect.removeListener(responseOnConnectListener);
        const stream = new ReadableStream({
          start(cont) {
            for (const chunk of converseResponses) {
              cont.enqueue(Any.pack(new ConverseResponse(chunk)).toJson({ typeRegistry }));
            }
            cont.close();
          },
        });

        void stream
          .pipeTo(new WritableStream(new PortStreamSink(sub)))
          .finally(() => sub.disconnect());
      }
    });

    const streamRequestCollected = new Array<unknown>();

    extOnMessage.mockImplementation((m, p) => {
      console.log('bidi onMessage', m);
      const { requestId, channel } = m as TransportInitChannel;

      const requestChannel = mockedChannel2.connect({ name: channel });
      requestChannel.onMessage.addListener(m => {
        console.log('bidi request chunk', m);
        streamRequestCollected.push(m);
      });

      mockedChannel.onConnect.addListener(responseOnConnectListener);
      p.postMessage({ requestId, channel: responseChannelName });
    });

    const bidiRequestResponse = transport.stream(
      ElizaService,
      ElizaService.methods.converse,
      undefined,
      undefined,
      undefined,
      ReadableStream.from(converseRequests.map(r => new ConverseRequest(r))),
    );

    await vi.waitFor(() =>
      expect(extOnMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          channel: expect.stringContaining('STREAM'),
        }),
        expect.anything(),
      ),
    );
    expect(mockedChannel.connect).toHaveBeenCalledTimes(2);
    expect(mockedChannel.connect).toHaveBeenLastCalledWith({ name: responseChannelName });

    const streamPort = lastResult(mockedChannel.connect);
    expect(responseOnConnectListener).toHaveBeenCalled();
    expect(streamPort.onMessage.dispatch).toHaveBeenCalled();

    const expectedResponses = converseResponses[Symbol.iterator]();
    for await (const chunk of (await bidiRequestResponse).message) {
      expect(chunk).toMatchObject(expectedResponses.next().value);
    }

    expect(streamRequestCollected).toMatchObject([
      ...converseRequests.map(value => ({ value })),
      { done: true },
    ]);
  });
});

describe('transport timeouts', () => {
  let domPort: MessagePort;
  let transportOptions: ChannelTransportOptions;
  let transport: Transport;

  const extOnMessage: Mock<[unknown, chrome.runtime.Port], void> = vi.fn();
  const extOnDisconnect: Mock<[chrome.runtime.Port], void> = vi.fn();
  const extOnConnect = vi.fn((p: chrome.runtime.Port): void => {
    p.onDisconnect.addListener(extOnDisconnect);
    p.onMessage.addListener(extOnMessage);
  });

  let mockedChannel: MockedChannel;

  beforeEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    performance.clearMarks();

    clearSingleton();

    mockedChannel = mockChannel();
    mockedChannel.onConnect.addListener(extOnConnect);

    vi.stubGlobal('chrome', { runtime: { connect: mockedChannel.connect } });

    domPort = CRSessionClient.init('test');

    transportOptions = {
      getPort: () => Promise.resolve(domPort),
      jsonOptions: { typeRegistry },
      defaultTimeoutMs,
    };
    transport = createChannelTransport(transportOptions);
  });

  it('should time out unary requests', async () => {
    const input = { sentence: 'hello' };
    const response = { sentence: '.........hello' };

    const unaryRequest = transport.unary(
      ElizaService,
      ElizaService.methods.say,
      undefined,
      undefined,
      undefined,
      new SayRequest(input),
    );

    extOnMessage.mockImplementation((m, p) => {
      const { requestId, message } = m as TransportMessage;

      expect(requestId).toBeTypeOf('string');
      expect(message).toMatchObject({
        ...input,
        '@type': 'type.googleapis.com/connectrpc.eliza.v1.SayRequest',
      });

      setTimeout(() => {
        p.postMessage({
          requestId,
          message: {
            ...response,
            '@type': 'type.googleapis.com/connectrpc.eliza.v1.SayResponse',
          },
        });
      }, defaultTimeoutMs * 2);
    });

    await expect(unaryRequest).rejects.toThrow('[deadline_exceeded]');
    await vi.waitFor(() => expect(extOnMessage).toHaveBeenCalled());
  });

  it('should time out unary requests at a specified custom time', async () => {
    const customTimeoutMs = 100;

    const input: PlainMessage<SayRequest> = { sentence: 'hello' };
    const response: PlainMessage<SayResponse> = { sentence: '.........hello' };

    const unaryRequest = transport.unary(
      ElizaService,
      ElizaService.methods.say,
      undefined,
      customTimeoutMs,
      undefined,
      new SayRequest(input),
    );

    extOnMessage.mockImplementation((m, p) => {
      const { requestId, message } = m as TransportMessage;

      expect(requestId).toBeTypeOf('string');
      expect(message).toMatchObject({
        ...input,
        '@type': 'type.googleapis.com/connectrpc.eliza.v1.SayRequest',
      });

      setTimeout(() => {
        p.postMessage({
          requestId,
          message: {
            ...response,
            '@type': 'type.googleapis.com/connectrpc.eliza.v1.SayResponse',
          },
        });
      }, defaultTimeoutMs / 2);
    });

    await expect(unaryRequest).rejects.toThrow('[deadline_exceeded]');
    await vi.waitFor(() => expect(extOnMessage).toHaveBeenCalled());
  });
});

describe('transport aborts', () => {
  let domPort: MessagePort;
  let transportOptions: ChannelTransportOptions;
  let transport: Transport;
  let ac: AbortController;

  const extOnMessage: Mock<[unknown, chrome.runtime.Port], void> = vi.fn();
  const extOnDisconnect: Mock<[chrome.runtime.Port], void> = vi.fn();
  const extOnConnect = vi.fn((p: chrome.runtime.Port): void => {
    p.onDisconnect.addListener(extOnDisconnect);
    p.onMessage.addListener(extOnMessage);
  });

  let mockedChannel: MockedChannel;

  beforeEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();

    clearSingleton();

    mockedChannel = mockChannel();
    mockedChannel.onConnect.addListener(extOnConnect);

    vi.stubGlobal('chrome', { runtime: { connect: mockedChannel.connect } });

    domPort = CRSessionClient.init('test');

    transportOptions = {
      getPort: () => Promise.resolve(domPort),
      jsonOptions: { typeRegistry },
      defaultTimeoutMs,
    };
    transport = createChannelTransport(transportOptions);
    ac = new AbortController();
  });

  it('should cancel unary requests with no reason at caller', async () => {
    const { unhandledRejectionListener, restoreUnhandledRejectionListener } =
      replaceUnhandledRejectionListener();
    onTestFinished(() => restoreUnhandledRejectionListener());

    expect(unhandledRejectionListener).not.toHaveBeenCalled();

    const unaryRequest = transport.unary(
      ElizaService,
      ElizaService.methods.say,
      ac.signal,
      undefined,
      undefined,
      new SayRequest(sayRequest),
    );

    await vi.waitFor(() => {
      expect(extOnMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          requestId: expect.any(String),
          message: expect.objectContaining(sayRequest),
        }),
        expect.anything(),
      );
    });

    ac.abort();

    await vi.waitFor(() => {
      expect(extOnMessage).toHaveBeenLastCalledWith(
        expect.objectContaining({
          requestId: expect.any(String),
          abort: true,
        }),
        expect.anything(),
      );
    });

    await expect(unaryRequest).rejects.toThrow('[canceled]');
  });

  it('should abort unary requests with reason at caller', async () => {
    const { unhandledRejectionListener, restoreUnhandledRejectionListener } =
      replaceUnhandledRejectionListener();
    onTestFinished(() => restoreUnhandledRejectionListener());

    expect(unhandledRejectionListener).not.toHaveBeenCalled();

    const unaryRequest = transport.unary(
      ElizaService,
      ElizaService.methods.say,
      ac.signal,
      undefined,
      undefined,
      new SayRequest(sayRequest),
    );

    await vi.waitFor(() => {
      expect(extOnMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          requestId: expect.any(String),
          message: expect.objectContaining(sayRequest),
        }),
        expect.anything(),
      );
    });

    ac.abort('some reason');

    await vi.waitFor(() => {
      expect(extOnMessage).toHaveBeenLastCalledWith(
        expect.objectContaining({
          requestId: expect.any(String),
          abort: true,
        }),
        expect.anything(),
      );
    });

    await expect(unaryRequest).rejects.toThrow('[aborted] some reason');
  });
});
