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
import {
  createChannelTransport,
  type ChannelTransportOptions,
} from '@penumbra-zone/transport-dom/create';
import {
  isTransportAbort,
  isTransportMessage,
  type TransportMessage,
} from '@penumbra-zone/transport-dom/messages';
import { mockChannel, MockedChannel } from '@repo/mock-chrome/runtime/connect';
import { beforeEach, describe, expect, it, Mock, onTestFinished, vi } from 'vitest';
import { ChannelLabel, nameConnection } from './channel-names.js';
import { isTransportInitChannel } from './message.js';
import { CRSessionClient } from './session-client.js';
import { PortStreamSink } from './stream.js';
import { lastResult } from './util/test/last-result.js';
import {
  replaceUncaughtExceptionListener,
  replaceUnhandledRejectionListener,
} from './util/test/unhandled.js';

import ReadableStream from '@penumbra-zone/transport-dom/ReadableStream.from';

Object.assign(CRSessionClient, {
  clearSingleton() {
    // @ts-expect-error -- manipulating private property
    CRSessionClient.singleton = undefined;
  },
});

// @ts-expect-error -- manipulating private property
// eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
const clearSingleton = (): void => CRSessionClient.clearSingleton();

const typeRegistry = createRegistry(ElizaService);

const sayRequest: PlainMessage<SayRequest> = { sentence: 'hello' };
const sayResponse: PlainMessage<SayResponse> = { sentence: 'world' };

const introduceRequest: PlainMessage<IntroduceRequest> = { name: 'Sue' };
const introduceResponse: PlainMessage<IntroduceResponse>[] = [
  { sentence: 'Son, this world is rough' },
  { sentence: "And if a man's gonna make it, he's gotta be tough" },
  { sentence: "And I knew I wouldn't be there to help you along" },
];

const converseRequest: PlainMessage<ConverseRequest>[] = [
  { sentence: 'You oughta thank me, before I die' },
  { sentence: 'For the gravel in your guts and the spit in your eye' },
  { sentence: "Because I'm the son-of-a-bitch that named you Sue" },
];
const converseResponse: PlainMessage<ConverseResponse>[] = [
  { sentence: 'I got all choked up and I threw down my gun' },
  { sentence: 'And I called him my pa, and he called me his son' },
  { sentence: 'And I came away with a different point of view' },
];

describe('session client with transport-dom', () => {
  let domPort: MessagePort;
  let transportOptions: ChannelTransportOptions;
  let transport: Transport;
  const defaultTimeoutMs = 300;

  const extOnMessage: Mock<[unknown, chrome.runtime.Port], void> = vi.fn();
  const extOnDisconnect: Mock<[chrome.runtime.Port], void> = vi.fn();
  const extOnConnect = vi.fn((p: chrome.runtime.Port): void => {
    p.onDisconnect.addListener(extOnDisconnect);
    p.onMessage.addListener(extOnMessage);
  });

  let mockedChannel: MockedChannel;
  let mockedChannel2: MockedChannel;

  let testName: string;

  beforeEach(() => {
    testName = (expect.getState().currentTestName ?? 'no test name').split(' ').join('_');
    expect(testName).toBeDefined();

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

  describe('message transport', () => {
    it('should send and receive unary messages', async () => {
      const unaryRequest = transport.unary(
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

      await expect(unaryRequest).resolves.toMatchObject({ message: sayResponse });
    });

    it('should receive streaming responses', async () => {
      const streamChannel = nameConnection('test', ChannelLabel.STREAM);
      extOnConnect.mockImplementationOnce((sub: chrome.runtime.Port) => {
        if (sub.name === streamChannel) {
          void (async () => {
            const stream = new ReadableStream({
              start(cont) {
                for (const chunk of introduceResponse) {
                  cont.enqueue(Any.pack(new IntroduceResponse(chunk)).toJson({ typeRegistry }));
                }
                cont.close();
              },
            });

            await stream.pipeTo(new WritableStream(new PortStreamSink(sub)));
          })();
        }
      });
      extOnMessage.mockImplementation((m, p) => {
        if (isTransportMessage(m)) {
          const { requestId } = m;
          p.postMessage({ requestId, channel: streamChannel });
        } else {
          expect.unreachable();
        }
      });
      const streamRequest = transport.stream(
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
      expect(streamPort.onMessage.dispatch).toHaveBeenCalled();

      const response = await streamRequest;
      console.log('response.message', response.message);

      for await (const chunk of response.message) {
        console.log('chunk', chunk);
      }
    });

    it('should handle bidirectional streaming requests', async () => {
      const responseChannelName = nameConnection('test', ChannelLabel.STREAM);
      const responseOnConnectListener = vi.fn((sub: chrome.runtime.Port) => {
        if (sub.name === responseChannelName) {
          void (async () => {
            mockedChannel.onConnect.removeListener(responseOnConnectListener);
            const stream = new ReadableStream({
              start(cont) {
                for (const chunk of converseResponse) {
                  cont.enqueue(Any.pack(new ConverseResponse(chunk)).toJson({ typeRegistry }));
                }
                cont.close();
              },
            });

            await expect(
              stream.pipeTo(new WritableStream(new PortStreamSink(sub))),
            ).resolves.not.toThrow();
          })();
        }
      });

      const streamRequestCollected = new Array<unknown>();

      extOnMessage.mockImplementation((m, p) => {
        if (isTransportInitChannel(m)) {
          const { requestId, channel } = m;

          const requestChannel = mockedChannel2.connect({ name: channel });
          requestChannel.onMessage.addListener(m => {
            console.log('bidi request chunk', m);
            streamRequestCollected.push(m);
          });

          mockedChannel.onConnect.addListener(responseOnConnectListener);
          p.postMessage({ requestId, channel: responseChannelName });
        } else {
          expect.unreachable();
        }
      });

      const bidiRequestResponse = transport.stream(
        ElizaService,
        ElizaService.methods.converse,
        undefined,
        undefined,
        undefined,
        ReadableStream.from(converseRequest.map(r => new ConverseRequest(r))),
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

      const expectedResponses = converseResponse[Symbol.iterator]();
      for await (const chunk of (await bidiRequestResponse).message) {
        expect(chunk).toMatchObject(expectedResponses.next().value);
      }

      expect(streamRequestCollected).toMatchObject([
        ...converseRequest.map(value => ({ value })),
        { done: true },
      ]);
    });
  });

  describe('transport timeouts', () => {
    it('should time out unary requests', async () => {
      let timeout: ReturnType<typeof setTimeout> | undefined = undefined;

      const unaryRequest = transport.unary(
        ElizaService,
        ElizaService.methods.say,
        undefined,
        undefined,
        undefined,
        new SayRequest(sayRequest),
      );

      extOnMessage.mockImplementation((m, p) => {
        if (isTransportMessage(m)) {
          const { requestId, message } = m;

          expect(requestId).toBeTypeOf('string');
          expect(message).toMatchObject({
            ...sayRequest,
            '@type': 'type.googleapis.com/connectrpc.eliza.v1.SayRequest',
          });

          timeout = setTimeout(() => {
            p.postMessage({
              requestId,
              message: {
                ...sayResponse,
                '@type': 'type.googleapis.com/connectrpc.eliza.v1.SayResponse',
              },
            });
          }, defaultTimeoutMs * 2);
        }
      });

      await expect(unaryRequest).rejects.toThrow('[deadline_exceeded]');
      await vi.waitFor(() => expect(extOnMessage).toHaveBeenCalled());
      clearTimeout(timeout);
    });

    it('should time out unary requests at a specified custom time', async () => {
      let timeout: ReturnType<typeof setTimeout> | undefined = undefined;

      const customTimeoutMs = defaultTimeoutMs / 4;

      extOnMessage.mockImplementation((m, p) => {
        if (isTransportMessage(m)) {
          const { requestId, message } = m;

          expect(requestId).toBeTypeOf('string');
          expect(message).toMatchObject({
            ...sayRequest,
            '@type': 'type.googleapis.com/connectrpc.eliza.v1.SayRequest',
          });

          timeout = setTimeout(() => {
            p.postMessage({
              requestId,
              message: {
                ...sayResponse,
                '@type': 'type.googleapis.com/connectrpc.eliza.v1.SayResponse',
              },
            });
          }, defaultTimeoutMs / 2);
        }
      });

      const unaryRequest = transport.unary(
        ElizaService,
        ElizaService.methods.say,
        undefined,
        customTimeoutMs,
        undefined,
        new SayRequest(sayRequest),
      );

      await expect(unaryRequest).rejects.toThrow('[deadline_exceeded]');
      await vi.waitFor(() => expect(extOnMessage).toHaveBeenCalled());
      clearTimeout(timeout);
    });

    it('should time out streaming requests', async () => {
      const streamRequest = transport.stream(
        ElizaService,
        ElizaService.methods.introduce,
        undefined,
        undefined,
        undefined,
        ReadableStream.from([new IntroduceRequest(introduceRequest)]),
      );

      extOnMessage.mockImplementation(m => {
        if (isTransportMessage(m)) {
          const { requestId, message } = m;

          expect(requestId).toBeTypeOf('string');
          expect(message).toMatchObject({
            ...introduceRequest,
            '@type': 'type.googleapis.com/connectrpc.eliza.v1.IntroduceRequest',
          });
        } else {
          expect.unreachable();
        }
      });

      await expect(streamRequest).rejects.toThrow('[deadline_exceeded]');
      await vi.waitFor(() => expect(extOnMessage).toHaveBeenCalled());
    });

    it('should not time out streaming responses that are already streaming', async () => {
      const streamChannel = nameConnection('test', ChannelLabel.STREAM);

      extOnConnect.mockImplementationOnce((sub: chrome.runtime.Port) => {
        console.log('extOnConnect', streamChannel);
        if (sub.name === streamChannel) {
          void (async () => {
            const stream = new ReadableStream({
              start(cont) {
                void (async () => {
                  for (const chunk of introduceResponse) {
                    cont.enqueue(Any.pack(new IntroduceResponse(chunk)).toJson({ typeRegistry }));
                    await new Promise(resolve => void setTimeout(resolve, defaultTimeoutMs / 2));
                  }
                  cont.close();
                })();
              },
            });

            await stream.pipeTo(new WritableStream(new PortStreamSink(sub)));
          })();
        }
      });

      extOnMessage.mockImplementation((m, p) => {
        const { requestId } = m as TransportMessage;
        p.postMessage({ requestId, channel: streamChannel });
      });

      const streamRequest = transport.stream(
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

      const result = await streamRequest;
      const messages = await Array.fromAsync(result.message);

      expect(messages).toMatchObject(introduceResponse);
    });
  });

  describe('transport aborts', () => {
    it('should cancel requests aborted for no reason', async () => {
      const ac = new AbortController();

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
      await expect(unaryRequest).rejects.toThrow('[canceled]');

      await vi.waitFor(() => {
        expect(extOnMessage).toHaveBeenLastCalledWith(
          expect.objectContaining({
            requestId: expect.any(String),
            abort: true,
          }),
          expect.anything(),
        );
      });
    });

    describe("doesn't emit abort events", () => {
      it.fails('can cancel streams before init, but does not emit an abort', async () => {
        const { uncaughtExceptionListener, restoreUncaughtExceptionListener } =
          replaceUncaughtExceptionListener(vi.fn());
        onTestFinished(restoreUncaughtExceptionListener);

        const ac = new AbortController();
        const signalAdd = vi.spyOn(ac.signal, 'addEventListener');

        extOnMessage.mockImplementation(m => {
          if (!isTransportMessage(m)) {
            expect.unreachable();
          }
        });

        const streamRequest = transport.stream(
          ElizaService,
          ElizaService.methods.introduce,
          ac.signal,
          undefined,
          undefined,
          ReadableStream.from([new IntroduceRequest(introduceRequest)]),
        );

        await vi.waitFor(() => expect(extOnMessage).toHaveBeenCalled());

        ac.abort('a bad reason');

        await expect(streamRequest).rejects.toThrow('a bad reason');

        expect(signalAdd).not.toHaveBeenCalled();
        expect(uncaughtExceptionListener).not.toHaveBeenCalled();
      });

      it.fails('can cancel streams already in progress, but does not emit an abort', async () => {
        const { uncaughtExceptionListener, restoreUncaughtExceptionListener } =
          replaceUncaughtExceptionListener(vi.fn());
        onTestFinished(restoreUncaughtExceptionListener);
        const { unhandledRejectionListener, restoreUnhandledRejectionListener } =
          replaceUnhandledRejectionListener(vi.fn());
        onTestFinished(restoreUnhandledRejectionListener);

        const ac = new AbortController();
        const streamChannel = nameConnection('test', ChannelLabel.STREAM);

        extOnConnect.mockImplementationOnce((sub: chrome.runtime.Port) => {
          if (sub.name === streamChannel) {
            void (async () => {
              const stream = new ReadableStream({
                async start(cont) {
                  for (const r of introduceResponse) {
                    await new Promise(resolve => void setTimeout(resolve, defaultTimeoutMs / 3));
                    cont.enqueue(Any.pack(new IntroduceResponse(r)).toJson({ typeRegistry }));
                  }
                  cont.close();
                },
              });

              await stream.pipeTo(new WritableStream(new PortStreamSink(sub)));
            })();
          }
        });

        extOnMessage.mockImplementation((m, p) => {
          if (isTransportMessage(m)) {
            const { requestId } = m;
            p.postMessage({ requestId, channel: streamChannel });
          } else {
            expect.unreachable();
          }
        });

        const streamRequest = transport.stream(
          ElizaService,
          ElizaService.methods.introduce,
          ac.signal,
          undefined,
          undefined,
          ReadableStream.from([new IntroduceRequest(introduceRequest)]),
        );

        await vi.waitFor(() => {
          expect(mockedChannel.connect).toHaveBeenCalledWith({ name: streamChannel });
        });
        await expect(streamRequest).resolves.not.toThrow();

        ac.abort('a good reason');

        // the local request aborts when trying to read from the stream
        await expect(streamRequest.then(({ message }) => Array.fromAsync(message))).rejects.toThrow(
          'a good reason',
        );

        // Allow time for any abort messages to be sent
        await new Promise(resolve => void setTimeout(resolve, 50));

        expect(uncaughtExceptionListener).not.toHaveBeenCalled();
        expect(unhandledRejectionListener).not.toHaveBeenCalled();
      });
    });

    describe('emits abort events', () => {
      it('can cancel streams before init, and emits an abort', async () => {
        const { uncaughtExceptionListener, restoreUncaughtExceptionListener } =
          replaceUncaughtExceptionListener(vi.fn());
        onTestFinished(restoreUncaughtExceptionListener);

        const ac = new AbortController();

        extOnMessage.mockImplementation(m => {
          if (isTransportMessage(m)) {
            expect(m).toMatchObject({
              requestId: expect.any(String),
              message: introduceRequest,
            });
          } else if (isTransportAbort(m)) {
            expect(m).toMatchObject({
              requestId: expect.any(String),
              abort: true,
            });
          } else {
            expect.unreachable();
          }
        });

        const streamRequest = transport.stream(
          ElizaService,
          ElizaService.methods.introduce,
          ac.signal,
          undefined,
          undefined,
          ReadableStream.from([new IntroduceRequest(introduceRequest)]),
        );

        await vi.waitFor(() => expect(extOnMessage).toHaveBeenCalledOnce());

        ac.abort('a bad reason');
        await expect(streamRequest).rejects.toThrow('a bad reason');

        await vi.waitFor(() => expect(extOnMessage).toHaveBeenCalledTimes(2));

        await vi.waitFor(() =>
          expect(extOnMessage).toHaveBeenCalledWith(
            expect.objectContaining({
              requestId: expect.any(String),
              abort: true,
            }),
            expect.anything(),
          ),
        );

        expect(uncaughtExceptionListener).not.toHaveBeenCalled();
      });

      it('can cancel streams already in progress, and emits an abort', async () => {
        const { uncaughtExceptionListener, restoreUncaughtExceptionListener } =
          replaceUncaughtExceptionListener(vi.fn());
        onTestFinished(restoreUncaughtExceptionListener);

        const streamChannel = nameConnection('test', ChannelLabel.STREAM);
        const ac = new AbortController();

        extOnConnect.mockImplementationOnce((sub: chrome.runtime.Port) => {
          if (sub.name === streamChannel) {
            void (async () => {
              const stream = new ReadableStream({
                async start(cont) {
                  for (const chunk of introduceResponse) {
                    cont.enqueue(Any.pack(new IntroduceResponse(chunk)).toJson({ typeRegistry }));
                    await new Promise(resolve => void setTimeout(resolve, defaultTimeoutMs / 3));
                  }
                  cont.close();
                },
              });

              await expect(
                stream.pipeTo(new WritableStream(new PortStreamSink(sub))),
              ).rejects.toThrow();
            })();
          }
        });

        extOnMessage.mockImplementation((m, p) => {
          if (isTransportAbort(m)) {
            expect(m).toMatchObject({
              requestId: expect.any(String),
              abort: true,
            });
          } else if (isTransportMessage(m)) {
            p.postMessage({ requestId: m.requestId, channel: streamChannel });
          } else {
            expect.unreachable();
          }
        });

        const streamRequest = transport.stream(
          ElizaService,
          ElizaService.methods.introduce,
          ac.signal,
          undefined,
          undefined,
          ReadableStream.from([new IntroduceRequest(introduceRequest)]),
        );

        await vi.waitFor(() => expect(extOnMessage).toHaveBeenCalled());
        await vi.waitFor(() =>
          expect(mockedChannel.connect).toHaveBeenCalledWith({ name: streamChannel }),
        );

        const { message } = await streamRequest;
        ac.abort('a bad reason');
        await expect(Array.fromAsync(message)).rejects.toThrow('a bad reason');

        await vi.waitFor(() => {
          expect(extOnMessage).toHaveBeenCalledTimes(2);
          expect(extOnMessage).toHaveBeenCalledWith(
            expect.objectContaining({ abort: true }),
            expect.anything(),
          );
        });

        expect(uncaughtExceptionListener).not.toHaveBeenCalled();
      });
    });
  });

  describe('transport headers', () => {
    let header: Headers;

    beforeEach(() => {
      header = new Headers();
      header.set('x-test', testName);
    });

    it('should send headers', async () => {
      const { uncaughtExceptionListener, restoreUncaughtExceptionListener } =
        replaceUncaughtExceptionListener(vi.fn());
      onTestFinished(restoreUncaughtExceptionListener);

      extOnMessage.mockImplementation((m, p) => {
        if (isTransportMessage(m)) {
          const { requestId, message, header } = m;
          expect(requestId).toBeTypeOf('string');
          expect(message).toMatchObject({
            ...sayRequest,
            '@type': 'type.googleapis.com/connectrpc.eliza.v1.SayRequest',
          });

          expect(header).toBeDefined();
          expect(new Headers(header).get('x-test')).toBe(testName);

          p.postMessage({
            requestId,
            header: { anotherMusic: 'in a different kitchen' },
            message: {
              ...sayResponse,
              '@type': 'type.googleapis.com/connectrpc.eliza.v1.SayResponse',
            },
          });
        } else {
          expect.unreachable();
        }
      });

      const unaryRequest = transport.unary(
        ElizaService,
        ElizaService.methods.say,
        undefined,
        undefined,
        header,
        new SayRequest(sayRequest),
      );

      await vi.waitFor(() => expect(extOnMessage).toHaveBeenCalled());
      const response = await unaryRequest;
      expect(response.message).toMatchObject(sayResponse);
      expect(response.header.get('anotherMusic')).toBe('in a different kitchen');

      expect(uncaughtExceptionListener).not.toHaveBeenCalled();
    });

    it('should send timeout headers', async () => {
      const { uncaughtExceptionListener, restoreUncaughtExceptionListener } =
        replaceUncaughtExceptionListener(vi.fn());
      onTestFinished(restoreUncaughtExceptionListener);

      extOnMessage.mockImplementation((m, p) => {
        const { requestId, message, header } = m as TransportMessage & { header?: HeadersInit };
        expect(requestId).toBeTypeOf('string');
        expect(message).toMatchObject({
          ...sayRequest,
          '@type': 'type.googleapis.com/connectrpc.eliza.v1.SayRequest',
        });

        expect(header).toBeDefined();
        const headers = new Headers(header);
        expect(headers.get('headerTimeout')).toBe('200');

        p.postMessage({
          requestId,
          message: {
            ...sayResponse,
            '@type': 'type.googleapis.com/connectrpc.eliza.v1.SayResponse',
          },
        });
      });

      const unaryRequest = transport.unary(
        ElizaService,
        ElizaService.methods.say,
        undefined,
        200,
        undefined,
        new SayRequest(sayRequest),
      );

      await vi.waitFor(() => expect(extOnMessage).toHaveBeenCalled());

      const response = await unaryRequest;
      expect(response.message).toMatchObject(sayResponse);

      expect(uncaughtExceptionListener).not.toHaveBeenCalled();
    });

    it('should send collected headers', async () => {
      const { uncaughtExceptionListener, restoreUncaughtExceptionListener } =
        replaceUncaughtExceptionListener(vi.fn());
      onTestFinished(restoreUncaughtExceptionListener);

      extOnMessage.mockImplementation((m, p) => {
        if (isTransportMessage(m)) {
          const { requestId, message, header } = m;
          expect(requestId).toBeTypeOf('string');
          expect(message).toMatchObject({
            ...sayRequest,
            '@type': 'type.googleapis.com/connectrpc.eliza.v1.SayRequest',
          });

          expect(header).toBeDefined();
          const headers = new Headers(header);
          expect(headers.get('headerTimeout')).toBe('200');
          expect(headers.get('x-test')).toBe(testName);

          p.postMessage({
            requestId,
            message: {
              ...sayResponse,
              '@type': 'type.googleapis.com/connectrpc.eliza.v1.SayResponse',
            },
          });
        } else {
          expect.unreachable();
        }
      });

      const unaryRequest = transport.unary(
        ElizaService,
        ElizaService.methods.say,
        undefined,
        200,
        header,
        new SayRequest(sayRequest),
      );

      await vi.waitFor(() => expect(extOnMessage).toHaveBeenCalled());
      await expect(unaryRequest).resolves.toMatchObject({ message: sayResponse });

      expect(uncaughtExceptionListener).not.toHaveBeenCalled();
    });
  });
});
