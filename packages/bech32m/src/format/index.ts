import { Inner } from './inner.js';
import { StringLength } from './strings.js';
import { ByteLength } from './bytes.js';
import { Prefix, Prefixes } from './prefix.js';

type PenumbraBech32mSpec = Required<{
  readonly [p in Prefix]: {
    readonly prefix: (typeof Prefixes)[p];
    readonly stringLength: (typeof StringLength)[p];
    readonly byteLength: (typeof ByteLength)[p];
    readonly innerName: (typeof Inner)[p];
  };
}>;

export default {
  passet: {
    prefix: Prefixes.passet,
    stringLength: StringLength.passet,
    byteLength: ByteLength.passet,
    innerName: Inner.passet,
  },
  pauctid: {
    prefix: Prefixes.pauctid,
    stringLength: StringLength.pauctid,
    byteLength: ByteLength.pauctid,
    innerName: Inner.pauctid,
  },
  penumbra: {
    prefix: Prefixes.penumbra,
    stringLength: StringLength.penumbra,
    byteLength: ByteLength.penumbra,
    innerName: Inner.penumbra,
  },
  penumbrafullviewingkey: {
    prefix: Prefixes.penumbrafullviewingkey,
    stringLength: StringLength.penumbrafullviewingkey,
    byteLength: ByteLength.penumbrafullviewingkey,
    innerName: Inner.penumbrafullviewingkey,
  },
  penumbragovern: {
    prefix: Prefixes.penumbragovern,
    stringLength: StringLength.penumbragovern,
    byteLength: ByteLength.penumbragovern,
    innerName: Inner.penumbragovern,
  },
  penumbraspendkey: {
    prefix: Prefixes.penumbraspendkey,
    stringLength: StringLength.penumbraspendkey,
    byteLength: ByteLength.penumbraspendkey,
    innerName: Inner.penumbraspendkey,
  },
  penumbravalid: {
    prefix: Prefixes.penumbravalid,
    stringLength: StringLength.penumbravalid,
    byteLength: ByteLength.penumbravalid,
    innerName: Inner.penumbravalid,
  },
  penumbrawalletid: {
    prefix: Prefixes.penumbrawalletid,
    stringLength: StringLength.penumbrawalletid,
    byteLength: ByteLength.penumbrawalletid,
    innerName: Inner.penumbrawalletid,
  },
  plpid: {
    prefix: Prefixes.plpid,
    stringLength: StringLength.plpid,
    byteLength: ByteLength.plpid,
    innerName: Inner.plpid,
  },
  penumbracompat1: {
    prefix: Prefixes.penumbracompat1,
    stringLength: StringLength.penumbracompat1,
    byteLength: ByteLength.penumbracompat1,
    innerName: Inner.penumbracompat1,
  },
  tpenumbra: {
    prefix: Prefixes.tpenumbra,
    stringLength: StringLength.tpenumbra,
    byteLength: ByteLength.tpenumbra,
    innerName: Inner.tpenumbra,
  },
} as const satisfies PenumbraBech32mSpec;
