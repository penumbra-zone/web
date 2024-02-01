import { typeRegistry } from './registry';
import { JsonReadOptions, JsonWriteOptions } from '@bufbuild/protobuf';

export const jsonOptions: Required<JsonReadOptions> & Partial<JsonWriteOptions> = {
  typeRegistry,

  // read options
  ignoreUnknownFields: true,

  // write options
  emitDefaultValues: false,
};
