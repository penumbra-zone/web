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
import { beforeEach, describe, expect, it } from 'vitest';
import { type ChannelTransportOptions, createChannelTransport } from './create.js';
import type { TransportMessage, TransportStream } from './messages.js';

import ReadableStream from './ReadableStream.from.js';

const PRINT_TEST_TIMES = false;

const typeRegistry = createRegistry(ElizaService);

describe('message transport', () => {
  let port1: MessagePort;
  let port2: MessagePort;
  let transportOptions: ChannelTransportOptions;
  let transport: Transport;

  beforeEach(() => {
    ({ port1, port2 } = new MessageChannel());
    transportOptions = {
      getPort: () => Promise.resolve(port2),
      jsonOptions: { typeRegistry },
    };
    transport = createChannelTransport(transportOptions);
  });

  it('should send and receive unary messages', async () => {
    const input: PlainMessage<SayRequest> = { sentence: 'hello' };
    const response: PlainMessage<SayResponse> = { sentence: 'world' };

    const unaryRequest = transport.unary(
      ElizaService,
      ElizaService.methods.say,
      undefined,
      undefined,
      undefined,
      new SayRequest(input),
    );

    const otherEnd = new Promise<void>((resolve, reject) => {
      port1.onmessage = (event: MessageEvent<unknown>) => {
        try {
          const { requestId, message } = event.data as TransportMessage;

          expect(requestId).toBeTypeOf('string');
          expect(message).toMatchObject({
            ...input,
            '@type': 'type.googleapis.com/connectrpc.eliza.v1.SayRequest',
          });

          port1.postMessage({
            requestId,
            message: {
              ...response,
              '@type': 'type.googleapis.com/connectrpc.eliza.v1.SayResponse',
            },
          });

          resolve();
        } catch (e) {
          reject(e);
        }
      };
    });

    await expect(otherEnd).resolves.not.toThrow();
    await expect(unaryRequest.then(({ message }) => message)).resolves.toMatchObject(response);
  });

  it('should send and receive streaming requests', async () => {
    const input: PlainMessage<IntroduceRequest> = { name: 'Prax' };
    const responses: PlainMessage<IntroduceResponse>[] = [
      { sentence: 'Yo' },
      { sentence: 'This' },
      { sentence: 'Streams' },
    ];

    const streamRequest = transport.stream(
      ElizaService,
      ElizaService.methods.introduce,
      undefined,
      undefined,
      undefined,
      ReadableStream.from([new IntroduceRequest(input)]),
    );

    const otherEnd = new Promise<void>((resolve, reject) => {
      port1.onmessage = (event: MessageEvent<unknown>) => {
        try {
          const { requestId, message } = event.data as TransportMessage;

          expect(requestId).toBeTypeOf('string');
          expect(message).toMatchObject({
            name: 'Prax',
            '@type': 'type.googleapis.com/connectrpc.eliza.v1.IntroduceRequest',
          });

          const stream = ReadableStream.from(
            responses.map(r => Any.pack(new IntroduceResponse(r)).toJson({ typeRegistry })),
          );

          port1.postMessage({ requestId, stream }, [stream]);

          resolve();
        } catch (e) {
          reject(e);
        }
      };
    });

    await expect(otherEnd).resolves.not.toThrow();
    await expect(streamRequest).resolves.toMatchObject({ stream: true });
    await expect(
      streamRequest.then(({ message }) => Array.fromAsync(message)),
    ).resolves.toMatchObject(responses);
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
    const inputs: PlainMessage<IntroduceRequest>[] = [{ name: 'Ananke' }, { name: 'Harpalyke' }];

    const streamRequest = transport.stream(
      ElizaService,
      ElizaService.methods.introduce,
      undefined,
      undefined,
      undefined,
      ReadableStream.from(inputs.map(i => new IntroduceRequest(i))),
    );

    await expect(streamRequest).rejects.toThrow();
  });

  it('should handle bidirectional streaming requests', async () => {
    const { port1, port2 } = new MessageChannel();
    const transportOptions = {
      getPort: () => Promise.resolve(port2),
      jsonOptions: { typeRegistry },
    };

    const transport = createChannelTransport(transportOptions);

    const inputs: PlainMessage<ConverseRequest>[] = [
      { sentence: 'homomorphic?' },
      { sentence: 'gemini double text' },
    ];
    const responses: PlainMessage<ConverseResponse>[] = [
      { sentence: 'no' },
      { sentence: 'im bi' },
      { sentence: 'directional' },
    ];

    const streamRequest = transport.stream(
      ElizaService,
      ElizaService.methods.converse,
      undefined,
      undefined,
      undefined,
      ReadableStream.from(inputs),
    );

    const otherEnd = new Promise<void>((resolve, reject) => {
      port1.onmessage = async (event: MessageEvent<unknown>) => {
        try {
          const { requestId, stream: inputStream } = event.data as TransportStream;

          expect(requestId).toBeTypeOf('string');
          await expect(Array.fromAsync(inputStream)).resolves.toMatchObject(inputs);

          const responseStream = ReadableStream.from(
            responses.map(r => Any.pack(new ConverseResponse(r)).toJson({ typeRegistry })),
          );

          port1.postMessage({ requestId, stream: responseStream }, [responseStream]);

          resolve();
        } catch (e) {
          reject(e);
        }
      };
    });

    await expect(otherEnd).resolves.not.toThrow();
    await expect(streamRequest).resolves.toMatchObject({ stream: true });
    await expect(
      streamRequest.then(({ message }) => Array.fromAsync(message)),
    ).resolves.toMatchObject(responses);
  });
});

describe('transport options abort and timeout', () => {
  let port1: MessagePort;
  let port2: MessagePort;
  let transportOptions: ChannelTransportOptions;
  const defaultTimeoutMs = 200;
  let transport: Transport;

  beforeEach(() => {
    performance.clearMarks();
    ({ port1, port2 } = new MessageChannel());
    transportOptions = {
      getPort: () => Promise.resolve(port2),
      jsonOptions: { typeRegistry },
      defaultTimeoutMs,
    };
  });

  it('should time out unary requests', async () => {
    transport = createChannelTransport(transportOptions);

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

    const otherEnd = new Promise<void>((resolve, reject) => {
      port1.onmessage = (event: MessageEvent<unknown>) => {
        try {
          const { requestId, message } = event.data as TransportMessage;

          expect(requestId).toBeTypeOf('string');
          expect(message).toMatchObject({
            ...input,
            '@type': 'type.googleapis.com/connectrpc.eliza.v1.SayRequest',
          });

          setTimeout(() => {
            port1.postMessage({
              requestId,
              message: {
                ...response,
                '@type': 'type.googleapis.com/connectrpc.eliza.v1.SayResponse',
              },
            });
            resolve();
          }, defaultTimeoutMs * 2);
        } catch (e) {
          reject(e);
        }
      };
    });

    await expect(unaryRequest).rejects.toThrow('[deadline_exceeded]');
    await expect(otherEnd).resolves.not.toThrow();
  });

  it('should time out unary requests at a specified custom time', async () => {
    transport = createChannelTransport(transportOptions);
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

    const otherEnd = new Promise<void>((resolve, reject) => {
      port1.onmessage = (event: MessageEvent<unknown>) => {
        try {
          const { requestId, message } = event.data as TransportMessage;

          expect(requestId).toBeTypeOf('string');
          expect(message).toMatchObject({
            ...input,
            '@type': 'type.googleapis.com/connectrpc.eliza.v1.SayRequest',
          });

          setTimeout(() => {
            port1.postMessage({
              requestId,
              message: {
                ...response,
                '@type': 'type.googleapis.com/connectrpc.eliza.v1.SayResponse',
              },
            });
            resolve();
          }, defaultTimeoutMs / 2);
        } catch (e) {
          reject(e);
        }
      };
    });

    await expect(unaryRequest).rejects.toThrow('[deadline_exceeded]');
    await expect(otherEnd).resolves.not.toThrow();
  });

  it('should time out streaming requests', async () => {
    transport = createChannelTransport(transportOptions);

    const input: PlainMessage<IntroduceRequest> = { name: 'hello' };
    const responses: PlainMessage<IntroduceResponse>[] = [
      { sentence: 'this wont send before timeout' },
    ];

    const streamRequest = transport.stream(
      ElizaService,
      ElizaService.methods.introduce,
      undefined,
      undefined,
      undefined,
      ReadableStream.from([new IntroduceRequest(input)]),
    );

    const otherEnd = new Promise<void>((resolve, reject) => {
      port1.onmessage = (event: MessageEvent<unknown>) => {
        try {
          const { requestId, message } = event.data as TransportMessage;

          expect(requestId).toBeTypeOf('string');
          expect(message).toMatchObject({
            ...input,
            '@type': 'type.googleapis.com/connectrpc.eliza.v1.IntroduceRequest',
          });

          const stream = ReadableStream.from(
            responses.map(r => Any.pack(new IntroduceResponse(r)).toJson({ typeRegistry })),
          );

          setTimeout(() => {
            port1.postMessage({ requestId, stream }, [stream]);
            resolve();
          }, defaultTimeoutMs * 2);
        } catch (e) {
          reject(e);
        }
      };
    });

    await expect(streamRequest).rejects.toThrow('[deadline_exceeded]');
    await expect(otherEnd).resolves.not.toThrow();
  });

  it('should not time out streaming responses that are already streaming', async () => {
    transport = createChannelTransport(transportOptions);

    const input: PlainMessage<IntroduceRequest> = { name: 'hello' };
    const responses: PlainMessage<IntroduceResponse>[] = [
      { sentence: 'thiswillarrivebeforetimeout!!!' },
      { sentence: 'and so will this,' },
      { sentence: 'but this one is right on the edge' },
      { sentence: '.....and this will arrive waaaaaay after timeout' },
    ];

    const streamRequest = transport.stream(
      ElizaService,
      ElizaService.methods.introduce,
      undefined,
      undefined,
      undefined,
      ReadableStream.from([new IntroduceRequest(input)]),
    );

    const streamDone = Promise.withResolvers<void>();

    const otherEnd = new Promise<void>((resolve, reject) => {
      port1.onmessage = (event: MessageEvent<unknown>) => {
        try {
          const { requestId, message } = event.data as TransportMessage;

          expect(requestId).toBeTypeOf('string');
          expect(message).toMatchObject({
            ...input,
            '@type': 'type.googleapis.com/connectrpc.eliza.v1.IntroduceRequest',
          });

          const stream = ReadableStream.from(
            (async function* (
              streamFinished: PromiseWithResolvers<void>['resolve'],
              streamFailed: PromiseWithResolvers<void>['reject'],
            ) {
              performance.mark('stream');
              try {
                for (const [i, r] of responses.entries()) {
                  await new Promise(resolve => setTimeout(resolve, defaultTimeoutMs / 3));
                  performance.measure(`chunk ${i}`, 'stream');
                  yield Any.pack(new IntroduceResponse(r)).toJson({ typeRegistry });
                }
                streamFinished();
              } catch (e) {
                streamFailed(e);
              }
              performance.measure('end', 'stream');
            })(streamDone.resolve, streamDone.reject),
          );

          port1.postMessage({ requestId, stream }, [stream]);
          resolve();
        } catch (e) {
          reject(e);
        }
      };
    });

    await expect(otherEnd).resolves.not.toThrow();
    await expect(
      streamRequest.then(({ message }) => Array.fromAsync(message)),
    ).resolves.not.toThrow();
    await expect(streamDone.promise).resolves.not.toThrow();
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (PRINT_TEST_TIMES) {
      console.log('measure', [
        { defaultTimeoutMs },
        ...performance
          .getEntriesByType('measure')
          .map(({ name, duration }) => ({ name, duration })),
      ]);
    }
  });
});
