import { describe, expect, it } from 'vitest';

import { createChannelTransport } from './create';
import { ElizaService } from '@buf/connectrpc_eliza.connectrpc_es/connectrpc/eliza/v1/eliza_connect';
import {
  IntroduceRequest,
  SayRequest,
  SayResponse,
} from '@buf/connectrpc_eliza.bufbuild_es/connectrpc/eliza/v1/eliza_pb';
import { createRegistry } from '@bufbuild/protobuf';
import { TransportMessage } from './messages';

import ReadableStream from '@penumbra-zone/polyfills/src/ReadableStream.from';
import Array from '@penumbra-zone/polyfills/src/Array.fromAsync';

const typeRegistry = createRegistry(ElizaService);

describe('createChannelClient', () => {
  it('should return a transport', () => {
    const { port2 } = new MessageChannel();

    const transportOptions = {
      getPort: () => Promise.resolve(port2),
      defaultTimeoutMs: 5000,
      jsonOptions: { typeRegistry },
    };

    const transport = createChannelTransport(transportOptions);

    expect(transport).toBeDefined();
  });

  it('should send and receive unary messages', async () => {
    const { port1, port2 } = new MessageChannel();

    const transportOptions = {
      getPort: () => Promise.resolve(port2),
      defaultTimeoutMs: 5000,
      jsonOptions: { typeRegistry },
    };

    const transport = createChannelTransport(transportOptions);

    const input = new SayRequest({ sentence: 'hello' });

    const unaryRequest = transport.unary(
      ElizaService,
      ElizaService.methods.say,
      undefined,
      undefined,
      undefined,
      input,
    );

    const otherEnd = new Promise<true>((resolve, reject) => {
      port1.onmessage = (event: MessageEvent<unknown>) => {
        try {
          const { requestId, message } = event.data as TransportMessage;

          expect(requestId).toBeTypeOf('string');
          expect(message).toMatchObject({
            sentence: 'hello',
            '@type': 'type.googleapis.com/connectrpc.eliza.v1.SayRequest',
          });

          port1.postMessage({
            requestId,
            message: {
              sentence: 'world',
              '@type': 'type.googleapis.com/connectrpc.eliza.v1.SayResponse',
            },
          });

          resolve(true);
        } catch (e) {
          // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
          reject(e);
        }
      };
    });

    await expect(otherEnd).resolves.toBe(true);

    await expect(unaryRequest).resolves.toBeTruthy();
    const { message: unaryResponse } = await unaryRequest;
    expect(new SayResponse({ sentence: 'world' }).equals(unaryResponse)).toBeTruthy();
  });

  it('should send and receive streaming requests', async () => {
    const { port1, port2 } = new MessageChannel();
    const transportOptions = {
      getPort: () => Promise.resolve(port2),
      defaultTimeoutMs: 5000,
      jsonOptions: { typeRegistry },
    };

    const transport = createChannelTransport(transportOptions);

    const input = new IntroduceRequest({ name: 'Prax' });

    const streamRequest = transport.stream(
      ElizaService,
      ElizaService.methods.introduce,
      undefined,
      undefined,
      undefined,
      ReadableStream.from([input]),
    );

    const otherEnd = new Promise<true>((resolve, reject) => {
      port1.onmessage = (event: MessageEvent<unknown>) => {
        try {
          const { requestId, message } = event.data as TransportMessage;

          expect(requestId).toBeTypeOf('string');
          expect(message).toMatchObject({
            name: 'Prax',
            '@type': 'type.googleapis.com/connectrpc.eliza.v1.IntroduceRequest',
          });

          const stream = ReadableStream.from([
            {
              sentence: 'Yo',
              '@type': 'type.googleapis.com/connectrpc.eliza.v1.IntroduceResponse',
            },
            {
              sentence: 'This',
              '@type': 'type.googleapis.com/connectrpc.eliza.v1.IntroduceResponse',
            },
            {
              sentence: 'Streams',
              '@type': 'type.googleapis.com/connectrpc.eliza.v1.IntroduceResponse',
            },
          ]);

          port1.postMessage(
            {
              requestId,
              stream,
            },
            [stream],
          );

          resolve(true);
        } catch (e) {
          // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
          reject(e);
        }
      };
    });

    await expect(otherEnd).resolves.toBe(true);

    await expect(streamRequest).resolves.toMatchObject({ stream: true });
    const { message: streamResponse } = await streamRequest;

    const res = Array.fromAsync(streamResponse);
    await expect(res).resolves.toBeTruthy();
  });
});
