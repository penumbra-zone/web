import { describe, expect, test } from 'vitest';
import { JsonToMessage, MessageToJson } from './stream';
import { createRegistry, Message, proto3 } from '@bufbuild/protobuf';

import ReadableStream from '@penumbra-zone/polyfills/ReadableStream.from';

import { ElizaService } from '@buf/connectrpc_eliza.connectrpc_es/connectrpc/eliza/v1/eliza_connect';
import { SayRequest } from '@buf/connectrpc_eliza.bufbuild_es/connectrpc/eliza/v1/eliza_pb';

const typeRegistry = createRegistry(ElizaService);

describe('Stream Transformers', () => {
  describe('JsonToMessage', () => {
    test('transforms JSON value to Appropriate Message', async () => {
      const jsonOptions = { typeRegistry, ignoreUnknownFields: true };
      const jsonToMessage = new JsonToMessage(jsonOptions);

      const sayReqs = [
        new SayRequest({ sentence: "Let's see" }),
        new SayRequest({ sentence: 'Well, nevertheless...' }),
        new SayRequest({ sentence: 'Goodbye Cool World' }),
      ];

      const jsonReqs = [
        { '@type': 'connectrpc.eliza.v1.SayRequest', sentence: "Let's see" },
        { '@type': 'connectrpc.eliza.v1.SayRequest', sentence: 'Well, nevertheless...' },
        { '@type': 'connectrpc.eliza.v1.SayRequest', sentence: 'Goodbye Cool World' },
      ];

      const sayStream = ReadableStream.from(jsonReqs).pipeThrough(jsonToMessage);

      const reader = sayStream.getReader();

      expect(await reader.read()).toEqual({ value: sayReqs[0], done: false });
      expect(await reader.read()).toEqual({ value: sayReqs[1], done: false });
      expect(await reader.read()).toEqual({ value: sayReqs[2], done: false });
      expect(await reader.read()).toEqual({ value: undefined, done: true });
    });

    test('throws on invalid message', async () => {
      const jsonOptions = { typeRegistry, ignoreUnknownFields: true };
      const jsonToMessage = new JsonToMessage(jsonOptions);

      const invalidJson = { '@type': 'connectrpc.eliza.v1.SayRequest', sentence: 42 };

      const invalidStream = ReadableStream.from([invalidJson]).pipeThrough(jsonToMessage);

      const reader = invalidStream.getReader();

      await expect(reader.read()).rejects.toThrowError(
        'cannot decode field connectrpc.eliza.v1.SayRequest.sentence from JSON: 42',
      );
    });

    test('throws on unknown type', async () => {
      const jsonOptions = { typeRegistry, ignoreUnknownFields: true };
      const jsonToMessage = new JsonToMessage(jsonOptions);

      const unknownJson = { '@type': 'connectrpc.eliza.v1.Unknown', sentence: 'Hello' };

      const unknownStream = ReadableStream.from([unknownJson]).pipeThrough(jsonToMessage);

      const reader = unknownStream.getReader();

      await expect(reader.read()).rejects.toThrowError(
        'cannot decode message google.protobuf.Any from JSON: connectrpc.eliza.v1.Unknown is not in the type registry',
      );
    });

    test('throws on unknown field', async () => {
      const jsonOptions = { typeRegistry, ignoreUnknownFields: false };
      const jsonToMessage = new JsonToMessage(jsonOptions);

      const extraJson = {
        '@type': 'connectrpc.eliza.v1.SayRequest',
        sentence: 'Hello',
        extra: 42,
      };

      const unknownStream = ReadableStream.from([extraJson]).pipeThrough(jsonToMessage);

      const reader = unknownStream.getReader();

      await expect(reader.read()).rejects.toThrowError(
        'cannot decode message connectrpc.eliza.v1.SayRequest from JSON: key "extra" is unknown',
      );
    });

    test('ignores unknown field', async () => {
      const jsonOptions = { typeRegistry, ignoreUnknownFields: true };
      const jsonToMessage = new JsonToMessage(jsonOptions);

      const extraJson = {
        '@type': 'connectrpc.eliza.v1.SayRequest',
        sentence: 'Hello',
        extra: 42,
      };

      const unknownStream = ReadableStream.from([extraJson]).pipeThrough(jsonToMessage);

      const reader = unknownStream.getReader();

      await expect(reader.read()).resolves.toEqual({
        value: new SayRequest({ sentence: 'Hello' }),
        done: false,
      });
      await expect(reader.read()).resolves.toEqual({ value: undefined, done: true });
    });
  });

  describe('MessageToJson', () => {
    test('transforms Message to JSON value', async () => {
      const jsonOptions = { typeRegistry };
      const messageToJson = new MessageToJson(jsonOptions);

      const sayReqs = [
        new SayRequest({ sentence: "Let's see" }),
        new SayRequest({ sentence: 'Well, nevertheless...' }),
        new SayRequest({ sentence: 'Goodbye Cool World' }),
      ];

      const jsonReqs2 = [
        { '@type': 'type.googleapis.com/connectrpc.eliza.v1.SayRequest', sentence: "Let's see" },
        {
          '@type': 'type.googleapis.com/connectrpc.eliza.v1.SayRequest',
          sentence: 'Well, nevertheless...',
        },
        {
          '@type': 'type.googleapis.com/connectrpc.eliza.v1.SayRequest',
          sentence: 'Goodbye Cool World',
        },
      ];

      const sayStream = ReadableStream.from(sayReqs).pipeThrough(messageToJson);

      const reader = sayStream.getReader();

      expect(await reader.read()).toEqual({ value: jsonReqs2[0], done: false });
      expect(await reader.read()).toEqual({ value: jsonReqs2[1], done: false });
      expect(await reader.read()).toEqual({ value: jsonReqs2[2], done: false });
      expect(await reader.read()).toEqual({ value: undefined, done: true });
    });

    test('throws on unknown type', async () => {
      const jsonOptions = { typeRegistry };
      const messageToJson = new MessageToJson(jsonOptions);

      interface SomethingElse extends Message<SomethingElse> {
        something: string;
      }
      const SomethingElse = proto3.makeMessageType<SomethingElse>(
        'connectrpc.eliza.v1.SomethingElse',
        [
          {
            no: 1,
            name: 'something',
            kind: 'scalar',
            T: 9 /* ScalarType.STRING */,
          },
        ],
      );

      const unknownReq = new SomethingElse({ something: 'else' });

      const unknownStream = ReadableStream.from([unknownReq]).pipeThrough(messageToJson);

      const reader = unknownStream.getReader();

      await expect(reader.read()).rejects.toThrowError(
        'cannot encode message google.protobuf.Any to JSON: "type.googleapis.com/connectrpc.eliza.v1.SomethingElse" is not in the type registry',
      );
    });
  });
});
