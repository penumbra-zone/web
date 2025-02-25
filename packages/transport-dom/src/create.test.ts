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
import { Code, ConnectError, type Transport } from '@connectrpc/connect';
import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import { createChannelTransport, type ChannelTransportOptions } from './create.js';
import {
  isTransportAbort,
  isTransportMessage,
  type TransportEvent,
  type TransportMessage,
  type TransportStream,
} from './messages.js';

import ReadableStream from './ReadableStream.from.js';

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

describe('channel transport', () => {
  let clientPort: MessagePort;
  let otherEndPort: MessagePort;
  let otherEnd: Mock<[MessageEvent<unknown>], void>;

  beforeEach(() => {
    performance.clearMarks();
    vi.restoreAllMocks();
    if ((otherEnd as unknown) && (clientPort as unknown) && (otherEndPort as unknown)) {
      otherEndPort.removeEventListener('message', otherEnd);
      clientPort.close();
      otherEndPort.close();
    }

    const newChannel = new MessageChannel();
    clientPort = newChannel.port1;
    otherEndPort = newChannel.port2;

    otherEnd = vi.fn();
    otherEndPort.addEventListener('message', otherEnd);
    otherEndPort.start();
  });

  describe('message transport', () => {
    let transportOptions: ChannelTransportOptions;
    let transport: Transport;

    beforeEach(() => {
      transportOptions = {
        getPort: () => Promise.resolve(clientPort),
        jsonOptions: { typeRegistry },
      };
      transport = createChannelTransport(transportOptions);
    });

    it('should send and receive unary messages', async () => {
      expect(otherEnd).not.toHaveBeenCalled();
      otherEnd.mockImplementation((ev: MessageEvent<unknown>) => {
        const { requestId } = ev.data as TransportMessage;
        otherEndPort.postMessage({
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
        undefined,
        undefined,
        new SayRequest(sayRequest),
      );

      await vi.waitFor(() => expect(otherEnd).toHaveBeenCalled());

      expect(otherEnd).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            requestId: expect.any(String) as string,
            message: {
              ...sayRequest,
              '@type': 'type.googleapis.com/connectrpc.eliza.v1.SayRequest',
            },
          }),
        }),
      );

      await expect(unaryRequest.then(({ message }) => message)).resolves.toMatchObject(sayResponse);
      expect(otherEnd).toHaveBeenCalledOnce();
    });

    it('should send and receive streaming requests', async () => {
      const introduceRequestStream = ReadableStream.from([new IntroduceRequest(introduceRequest)]);
      const introduceResponseStream = ReadableStream.from(
        introduceResponse.map(r => Any.pack(new IntroduceResponse(r)).toJson({ typeRegistry })),
      );
      expect(otherEnd).not.toHaveBeenCalled();
      otherEnd.mockImplementation((ev: MessageEvent<unknown>) => {
        const { requestId } = ev.data as TransportMessage;
        otherEndPort.postMessage({ requestId, stream: introduceResponseStream }, [
          introduceResponseStream,
        ]);
      });

      const streamRequest = transport.stream(
        ElizaService,
        ElizaService.methods.introduce,
        undefined,
        undefined,
        undefined,
        introduceRequestStream,
      );

      await vi.waitFor(() => expect(otherEnd).toHaveBeenCalled());

      expect(otherEnd).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            requestId: expect.any(String) as string,
            message: {
              ...introduceRequest,
              '@type': 'type.googleapis.com/connectrpc.eliza.v1.IntroduceRequest',
            },
          }),
        }),
      );

      await expect(streamRequest).resolves.toMatchObject({ stream: true });
      await expect(
        streamRequest.then(({ message }) => Array.fromAsync(message)),
      ).resolves.toMatchObject(introduceResponse);
      expect(otherEnd).toHaveBeenCalledOnce();
    });

    it('should require streaming requests to contain at least one message', async () => {
      const streamRequest = transport.stream(
        ElizaService,
        ElizaService.methods.introduce,
        undefined,
        undefined,
        undefined,
        (async function* () {})(),
      );

      await expect(streamRequest).rejects.toThrow();
    });

    it('should require server-streaming requests to contain only one message', async () => {
      const introduceRequestToo: PlainMessage<IntroduceRequest>[] = [
        { name: 'Sue' },
        { name: 'How do you do?' },
      ];

      const streamRequest = transport.stream(
        ElizaService,
        ElizaService.methods.introduce,
        undefined,
        undefined,
        undefined,
        ReadableStream.from(introduceRequestToo.map(i => new IntroduceRequest(i))),
      );

      await expect(streamRequest).rejects.toThrow();
    });

    it('should handle bidirectional streaming requests', async () => {
      let otherEndRequestStream: ReadableStream | undefined;
      otherEnd.mockImplementation(event => {
        const tev = event.data as TransportStream;
        otherEndRequestStream = tev.stream;
        const requestId = tev.requestId;

        const responseStream = ReadableStream.from(
          converseResponse.map(r => Any.pack(new ConverseResponse(r)).toJson({ typeRegistry })),
        );

        otherEndPort.postMessage({ requestId, stream: responseStream }, [responseStream]);
      });

      expect(otherEnd).not.toHaveBeenCalled();
      const streamRequest = transport.stream(
        ElizaService,
        ElizaService.methods.converse,
        undefined,
        undefined,
        undefined,
        ReadableStream.from(converseRequest),
      );
      await vi.waitFor(() => expect(otherEnd).toHaveBeenCalled());

      const otherEndFromAsync = await Array.fromAsync(otherEndRequestStream ?? []);
      expect(otherEndFromAsync).toMatchObject(converseRequest);

      await expect(streamRequest).resolves.toMatchObject({ stream: true });
      await expect(
        streamRequest.then(({ message }) => Array.fromAsync(message)),
      ).resolves.toMatchObject(converseResponse);
      expect(otherEnd).toHaveBeenCalledOnce();
    });
  });

  describe('timeouts', () => {
    let transportOptions: ChannelTransportOptions;
    let transport: Transport;
    const defaultTimeoutMs = 200;

    beforeEach(() => {
      transportOptions = {
        getPort: () => Promise.resolve(clientPort),
        jsonOptions: { typeRegistry },
        defaultTimeoutMs,
      };
      transport = createChannelTransport(transportOptions);
    });

    it('should not time out unary requests that are fast enough', async () => {
      otherEnd.mockImplementation((event: MessageEvent<unknown>) => {
        const { requestId } = event.data as TransportMessage;
        setTimeout(() => {
          otherEndPort.postMessage({
            requestId,
            message: {
              ...sayResponse,
              '@type': 'type.googleapis.com/connectrpc.eliza.v1.SayResponse',
            },
          });
        }, defaultTimeoutMs / 2);
      });

      const unaryRequest = transport.unary(
        ElizaService,
        ElizaService.methods.say,
        undefined,
        undefined,
        undefined,
        new SayRequest(sayRequest),
      );

      await expect(unaryRequest).resolves.toMatchObject({ message: sayResponse });
    });

    it('should time out unary requests', async () => {
      otherEnd.mockImplementation((event: MessageEvent<unknown>) => {
        const { requestId } = event.data as TransportMessage;
        setTimeout(() => {
          otherEndPort.postMessage({
            requestId,
            message: {
              ...sayResponse,
              '@type': 'type.googleapis.com/connectrpc.eliza.v1.SayResponse',
            },
          });
        }, defaultTimeoutMs * 2);
      });

      const unaryRequest = transport.unary(
        ElizaService,
        ElizaService.methods.say,
        undefined,
        undefined,
        undefined,
        new SayRequest(sayRequest),
      );

      await expect(unaryRequest).rejects.toThrow('[deadline_exceeded]');

      await vi.waitFor(() => {
        expect(otherEnd).toHaveBeenCalledWith(
          expect.objectContaining({
            data: expect.objectContaining({
              message: expect.objectContaining({
                ...sayRequest,
                '@type': 'type.googleapis.com/connectrpc.eliza.v1.SayRequest',
              }),
            }),
          }),
        );
      });
    });

    it('should time out unary requests at a specified custom time', async () => {
      otherEnd.mockImplementation((event: MessageEvent<unknown>) => {
        const { requestId } = event.data as TransportMessage;
        setTimeout(() => {
          otherEndPort.postMessage({
            requestId,
            message: {
              ...sayResponse,
              '@type': 'type.googleapis.com/connectrpc.eliza.v1.SayResponse',
            },
          });
        }, defaultTimeoutMs / 2);
      });

      const unaryRequest = transport.unary(
        ElizaService,
        ElizaService.methods.say,
        undefined,
        defaultTimeoutMs / 3,
        undefined,
        new SayRequest(sayRequest),
      );

      await expect(unaryRequest).rejects.toThrow('[deadline_exceeded]');
      expect(otherEnd).toHaveBeenCalledOnce();
    });

    it('should time out streaming requests', async () => {
      otherEnd.mockImplementation((event: MessageEvent<unknown>) => {
        const { requestId } = event.data as TransportMessage;
        const stream = ReadableStream.from(
          introduceResponse.map(r => Any.pack(new IntroduceResponse(r)).toJson({ typeRegistry })),
        );

        setTimeout(() => {
          otherEndPort.postMessage({ requestId, stream }, [stream]);
        }, defaultTimeoutMs * 2);
      });

      const streamRequest = transport.stream(
        ElizaService,
        ElizaService.methods.introduce,
        undefined,
        undefined,
        undefined,
        ReadableStream.from([new IntroduceRequest(introduceRequest)]),
      );

      await expect(streamRequest).rejects.toThrow('[deadline_exceeded]');
      expect(otherEnd).toHaveBeenCalledOnce();
    });

    it('should not time out streaming responses that are already streaming', async () => {
      otherEnd.mockImplementation((event: MessageEvent<unknown>) => {
        const { requestId } = event.data as TransportMessage;
        const stream = ReadableStream.from(
          (async function* () {
            for (const chunk of introduceResponse) {
              await new Promise(resolve => void setTimeout(resolve, defaultTimeoutMs / 2));
              yield Any.pack(new IntroduceResponse(chunk)).toJson({ typeRegistry });
            }
          })(),
        );
        otherEndPort.postMessage({ requestId, stream }, [stream]);
      });

      const streamRequest = transport.stream(
        ElizaService,
        ElizaService.methods.introduce,
        undefined,
        undefined,
        undefined,
        ReadableStream.from([new IntroduceRequest(introduceRequest)]),
      );

      await vi.waitFor(() => expect(otherEnd).toHaveBeenCalled());

      const result = await streamRequest;
      const messages = await Array.fromAsync(result.message);
      expect(messages).toMatchObject(introduceResponse);
    });

    it.fails('should time out streaming requests that stall', async () => {
      otherEnd.mockImplementation((event: MessageEvent<unknown>) => {
        const { requestId } = event.data as TransportMessage;
        const stream = ReadableStream.from(
          (async function* () {
            // first one quick
            yield Any.pack(new IntroduceResponse(introduceResponse[0])).toJson({ typeRegistry });
            // second slower
            await new Promise(resolve => void setTimeout(resolve, defaultTimeoutMs / 2));
            yield Any.pack(new IntroduceResponse(introduceResponse[1])).toJson({ typeRegistry });
            // then stall
            await new Promise(resolve => void setTimeout(resolve, defaultTimeoutMs * 2));
            yield Any.pack(new IntroduceResponse(introduceResponse[2])).toJson({ typeRegistry });
          })(),
        );
        otherEndPort.postMessage({ requestId, stream }, [stream]);
      });

      const streamRequest = transport.stream(
        ElizaService,
        ElizaService.methods.introduce,
        undefined,
        undefined,
        undefined,
        ReadableStream.from([new IntroduceRequest(introduceRequest)]),
      );

      await expect(streamRequest).resolves.toMatchObject({ stream: true });

      await expect(streamRequest.then(({ message }) => Array.fromAsync(message))).rejects.toThrow(
        '[deadline_exceeded]',
      );

      await vi.waitFor(() => expect(otherEnd).toHaveBeenCalledOnce());
    });
  });

  describe('transport aborts', () => {
    let transportOptions: ChannelTransportOptions;
    let transport: Transport;

    beforeEach(() => {
      transportOptions = {
        getPort: () => Promise.resolve(clientPort),
        jsonOptions: { typeRegistry },
      };
      transport = createChannelTransport(transportOptions);
    });

    it('should cancel requests aborted for no reason', async () => {
      const unaryRequest = transport.unary(
        ElizaService,
        ElizaService.methods.say,
        AbortSignal.abort(),
        undefined,
        undefined,
        new SayRequest(sayRequest),
      );

      await expect(unaryRequest).rejects.toThrow('[canceled]');
    });

    it('should propagate abort reason', async () => {
      const unaryRequest = transport.unary(
        ElizaService,
        ElizaService.methods.say,
        AbortSignal.abort(new TypeError('some reason')),
        undefined,
        undefined,
        new SayRequest(sayRequest),
      );

      await expect(unaryRequest).rejects.toThrow('[aborted] some reason');
    });

    it('should maintain specific error codes', async () => {
      const unaryRequest = transport.unary(
        ElizaService,
        ElizaService.methods.say,
        AbortSignal.abort(ConnectError.from('different reason', Code.DataLoss)),
        undefined,
        undefined,
        new SayRequest(sayRequest),
      );

      await expect(unaryRequest).rejects.toThrow('[data_loss] different reason');
    });

    describe("doesn't  emit abort events", () => {
      it('can cancel streams before they begin, but does not emit an abort event', async () => {
        expect(otherEnd).not.toHaveBeenCalled();

        const ac = new AbortController();

        const signalAdd = vi.spyOn(ac.signal, 'addEventListener');

        const streamRequest = transport.stream(
          ElizaService,
          ElizaService.methods.introduce,
          ac.signal,
          undefined,
          undefined,
          ReadableStream.from([new IntroduceRequest(introduceRequest)]),
        );

        await vi.waitFor(() => expect(otherEnd).toHaveBeenCalledOnce());

        ac.abort('a bad reason');

        // the local request aborts,
        await expect(streamRequest).rejects.toThrow('a bad reason');

        // but the remote session does not know
        expect(signalAdd).not.toHaveBeenCalled();
        expect(otherEnd).toHaveBeenCalledOnce();
      });

      it('can cancel streams already in progress, but does not emit an abort', async () => {
        const ac = new AbortController();

        const defaultTimeoutMs = 200;
        const responses: PlainMessage<IntroduceResponse>[] = [
          { sentence: 'something remarkably similar' },
          { sentence: 'something remarkably similar' },
          { sentence: 'something remarkably similar' },
          { sentence: 'something remarkably similar' },
          { sentence: 'something remarkably similar' },
        ];

        otherEnd.mockImplementation((event: MessageEvent<unknown>) => {
          const tev = event.data as TransportEvent;
          const { requestId } = tev;

          if (isTransportMessage(tev)) {
            expect(tev.message).toMatchObject(introduceRequest);
            const stream = ReadableStream.from(
              (async function* () {
                for (const r of responses) {
                  await new Promise(resolve => void setTimeout(resolve, defaultTimeoutMs / 3));
                  yield Any.pack(new IntroduceResponse(r)).toJson({ typeRegistry });
                }
              })(),
            );
            otherEndPort.postMessage({ requestId, stream }, [stream]);
          } else if (isTransportAbort(tev)) {
            expect(tev.abort).toBe(true);
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

        await vi.waitFor(() => expect(otherEnd).toHaveBeenCalledOnce());

        ac.abort('a good reason');

        // the stream is initialized
        await expect(streamRequest).resolves.not.toThrow();

        // and the local request aborts
        await expect(streamRequest.then(({ message }) => Array.fromAsync(message))).rejects.toThrow(
          'a good reason',
        );

        // but the remote session does not know
        expect(otherEnd).not.toHaveBeenCalledTimes(2);
      });
    });

    describe('emits abort events', () => {
      it.fails('can cancel streams before they begin, and emits an abort event', async () => {
        expect(otherEnd).not.toHaveBeenCalled();

        const ac = new AbortController();

        const signalAdd = vi.spyOn(ac.signal, 'addEventListener');

        const streamRequest = transport.stream(
          ElizaService,
          ElizaService.methods.introduce,
          ac.signal,
          undefined,
          undefined,
          ReadableStream.from([new IntroduceRequest(introduceRequest)]),
        );

        await vi.waitFor(() => expect(signalAdd).toHaveBeenCalledOnce());

        await vi.waitFor(() => {
          expect(otherEnd).toHaveBeenCalledOnce();
        });

        ac.abort('a bad reason');

        await expect(streamRequest).rejects.toThrow('a bad reason');

        await vi.waitFor(() => expect(otherEnd).toHaveBeenCalledTimes(2));
        expect(otherEnd).toHaveBeenCalledWith(
          expect.objectContaining({
            data: expect.objectContaining({
              abort: true,
            }),
          }),
        );
      });

      it.fails('can cancel streams already in progress, and emits an abort event', async () => {
        const defaultTimeoutMs = 200;
        const responses: PlainMessage<IntroduceResponse>[] = [
          { sentence: 'something remarkably similar' },
          { sentence: 'something remarkably similar' },
          { sentence: 'something remarkably similar' },
          { sentence: 'something remarkably similar' },
          { sentence: 'something remarkably similar' },
        ];

        otherEnd.mockImplementation((event: MessageEvent<unknown>) => {
          const tev = event.data as TransportEvent;
          const { requestId } = tev;

          if (isTransportMessage(tev)) {
            expect(tev.message).toMatchObject(introduceRequest);
            const stream = ReadableStream.from(
              (async function* () {
                for (const r of responses) {
                  await new Promise(resolve => void setTimeout(resolve, defaultTimeoutMs / 3));
                  yield Any.pack(new IntroduceResponse(r)).toJson({ typeRegistry });
                }
              })(),
            );
            otherEndPort.postMessage({ requestId, stream }, [stream]);
          } else if (isTransportAbort(tev)) {
            expect(tev.abort).toBe(true);
          }
        });

        const streamRequest = transport.stream(
          ElizaService,
          ElizaService.methods.introduce,
          AbortSignal.timeout(defaultTimeoutMs / 2),
          undefined,
          undefined,
          ReadableStream.from([new IntroduceRequest(introduceRequest)]),
        );

        await expect(streamRequest).resolves.not.toThrow();
        await expect(streamRequest.then(({ message }) => Array.fromAsync(message))).rejects.toThrow(
          'a bad reason',
        );
        await vi.waitFor(() => {
          expect(otherEnd).toHaveBeenCalledWith(
            expect.objectContaining({
              data: expect.objectContaining({
                abort: true,
              }),
            }),
          );
        });
      });
    });
  });

  describe('transport headers', () => {
    let transportOptions: ChannelTransportOptions;
    let transport: Transport;
    let header: Headers;

    beforeEach(() => {
      transportOptions = {
        getPort: () => Promise.resolve(clientPort),
        jsonOptions: { typeRegistry },
      };
      transport = createChannelTransport(transportOptions);

      header = new Headers();
      header.set('x-test', 'test');
    });

    it.fails('should send headers', async () => {
      expect(otherEnd).not.toHaveBeenCalled();

      otherEnd.mockImplementation((ev: MessageEvent<unknown>) => {
        const { requestId } = ev.data as TransportMessage;
        otherEndPort.postMessage({
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
        undefined,
        header,
        new SayRequest(sayRequest),
      );

      await expect(unaryRequest).resolves.toMatchObject({ message: sayResponse });

      const lastCallData = otherEnd.mock.lastCall?.[0].data as TransportMessage;
      expect(lastCallData).toHaveProperty('header');

      const calledHeaders = new Headers(lastCallData.header);

      expect(calledHeaders.get('x-test')).toBe('test');
    });

    it.fails('should send timeout headers', async () => {
      expect(otherEnd).not.toHaveBeenCalled();

      otherEnd.mockImplementation((ev: MessageEvent<unknown>) => {
        console.log('otherEnd', ev.data);
        const { requestId } = ev.data as TransportMessage;
        otherEndPort.postMessage({
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

      await expect(unaryRequest).resolves.toMatchObject({ message: sayResponse });

      const lastCallData = otherEnd.mock.lastCall?.[0].data as TransportMessage;

      expect(lastCallData).toHaveProperty('header');

      const calledHeaders = new Headers(lastCallData.header);

      expect(calledHeaders.get('headerTimeout')).toBe('200');
    });

    it.fails('should send collected headers', async () => {
      expect(otherEnd).not.toHaveBeenCalled();

      otherEnd.mockImplementation((ev: MessageEvent<unknown>) => {
        console.log('otherEnd', ev.data);
        const { requestId } = ev.data as TransportMessage;
        otherEndPort.postMessage({
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
        header,
        new SayRequest(sayRequest),
      );

      await expect(unaryRequest).resolves.toMatchObject({ message: sayResponse });

      const lastCallData = otherEnd.mock.lastCall?.[0].data as TransportMessage;

      expect(lastCallData).toHaveProperty('header');

      const calledHeaders = new Headers(lastCallData.header);

      expect(calledHeaders.get('headerTimeout')).toBe('200');
      expect(calledHeaders.get('x-test')).toBe('test');
    });
  });
});
