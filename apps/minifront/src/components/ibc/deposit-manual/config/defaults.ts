import { GeneratedType, Registry } from '@cosmjs/proto-signing';
import { AminoTypes } from '@cosmjs/stargate';
import {
  cosmosAminoConverters,
  cosmosProtoRegistry,
  cosmwasmAminoConverters,
  cosmwasmProtoRegistry,
  ibcAminoConverters,
  ibcProtoRegistry,
  osmosisAminoConverters,
  osmosisProtoRegistry,
} from 'osmo-query';

const protoRegistry: readonly [string, GeneratedType][] = [
  ...cosmosProtoRegistry,
  ...cosmwasmProtoRegistry,
  ...ibcProtoRegistry,
  ...osmosisProtoRegistry,
];

const aminoConverters = {
  ...cosmosAminoConverters,
  ...cosmwasmAminoConverters,
  ...ibcAminoConverters,
  ...osmosisAminoConverters,
};

export const registry = new Registry(protoRegistry);
export const aminoTypes = new AminoTypes(aminoConverters);
