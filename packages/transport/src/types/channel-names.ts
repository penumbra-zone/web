/*
 * This file contains utilities for creating and parsing channel names
 * containing connection metadata.  These names are intended to identify
 * inter-document channels and sub-channels in restricted contexts, namely the
 * browser runtime.
 *
 * These names should be considered both untrusted and sensitive.  Any script
 * with access to the browser runtime may initiate a connection with any
 * arbitrary name. Some scripts with access to the browser runtime may be able
 * to access any channel they can identify by name.
 *
 * The name format is space-delimited:
 *  <Label>             <now + rand>      <window.origin>     <typeName>
 * "ContentScriptClient 58233.09815084995 https://example.com connectrpc.eliza.v1.ElizaService"
 *
 * Content scripts create these names to establish clients to runtime services,
 * and to initiate client-streaming requests.  All content script behavior
 * should be considered untrusted.
 *
 * Content scripts only parse these names to accept server-streaming responses.
 * They can't perform validation, so should only act on stream names appearing
 * via an established service connection, satisfying a specific request expected
 * to generate a server-streaming response.  The content script's handler should
 * not convey the stream name to any other scope.
 *
 * The background connection manager parses and validates these names to accept
 * client connections and client-streaming requests; and creates these names
 * only to initate server-streaming responses.
 *
 * These names, and browser runtime connections in general, should not be used
 * or handled anywhere else.
 */

export enum ChannelClientLabel {
  ContentScript = 'ContentScript',
  Extension = 'Extension',
}

export enum ChannelSubLabel {
  ClientStream = 'ClientStream',
  ServerStream = 'ServerStream',
}

export type ChannelLabel = ChannelClientLabel | ChannelSubLabel;

export type ChannelOriginUrl = string;

export function isChannelLabel(label: string): label is ChannelLabel {
  return (
    Object.values(ChannelClientLabel).includes(label as ChannelClientLabel) ||
    Object.values(ChannelSubLabel).includes(label as ChannelSubLabel)
  );
}

const isOriginUrl = (url: string): url is ChannelOriginUrl => {
  try {
    return Boolean(new URL(url));
  } catch (err) {
    return false;
  }
};

// types package indicates `${string}-${string}-${string}-${string}-${string}`
const isUUID = (uuid: string): uuid is ReturnType<typeof crypto.randomUUID> =>
  /^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/i.test(uuid);

export interface ChannelConfig {
  label: ChannelLabel;
  uuid: ReturnType<typeof crypto.randomUUID>;
  origin: string;
  typeName: string | undefined;
}

export type ChannelConfigString<CF> = CF extends ChannelConfig
  ? `${CF['label']} ${CF['uuid']} ${CF['origin']} ${CF['typeName']}`
  : never;

/**
 * Utility for generating informative channel names.
 *
 * @param label type/purpose of connection
 * @param typeName if necessary, type name of the requested service
 * @returns a formatted string with attached fields
 */
export const nameChannel = (
  label: ChannelLabel,
  typeName?: string,
): [ChannelConfigString<typeof completeConf>, typeof completeConf] => {
  const completeConf = {
    label,
    uuid: crypto.randomUUID(),
    origin: globalThis.origin,
    typeName,
  } as ChannelConfig;
  const confString: ChannelConfigString<typeof completeConf> =
    `${completeConf.label} ${completeConf.uuid} ${completeConf.origin} ${completeConf.typeName}`;
  return [confString, completeConf];
};

/**
 * Utility for parsing informative channel names.  Names are provided by
 * untrusted scripts, so don't act on this information without validating it.
 *
 * @param name any string, hopefully a connection name in the format above
 * @returns parsed ChannelConfig, or undefined if parsing failed
 */
export const parseConnectionName = <N extends string, CC>(
  name: N extends ChannelConfigString<infer CC extends ChannelConfig ? CC : never>
    ? ChannelConfigString<CC>
    : string,
): CC | undefined => {
  const [label, uuid, channelOrigin, typeName] = name.split(' ');
  if (!isUUID(uuid!) || !isChannelLabel(label!) || !isOriginUrl(channelOrigin!)) return undefined;
  return {
    label,
    uuid,
    origin: channelOrigin,
    typeName,
  } as CC;
};
