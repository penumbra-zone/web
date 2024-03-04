/*
 * This file contains simple utilities for creating and parsing chrome runtime
 * channel names containing transport metadata.  Channel names identify the
 * purpose of channels involved in transport.
 *
 * Any script with access to the chrome runtime may initiate a connection with
 * any arbitrary name. Some scripts with access to the browser runtime may be
 * able to access any channel they can identify by name.
 *
 * Content scripts and extension pages
 * - create names to establish clients
 * - create names to initiate client-streaming requests
 * - accept names to receive server-streaming responses
 *
 * Content scripts should only act on connection names appearing via an
 * established connection to the extension.
 *
 * The background connection manager
 * - parses names to accept client connections
 * - parses names to handle client-streaming requests
 * - creates names to satisfy server-streaming responses
 *
 */

// TODO: check delimiter for label substring?
export enum ChannelLabel {
  TRANSPORT = 'TRANSPORT',
  STREAM = 'STREAM',
}

const delimiter = ' ';

const isChannelLabel = (label: string): label is ChannelLabel => label in ChannelLabel;

// types package indicates `${string}-${string}-${string}-${string}-${string}`
const reUUIDv4 = /^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/i;
type UUID = ReturnType<typeof crypto.randomUUID>;
const isUUID = (uuid: string): uuid is UUID => reUUIDv4.test(uuid);

/**
 * Utility for generating channel names.
 *
 * @param label type/purpose of connection
 */
export const nameConnection = (prefix: string, label: ChannelLabel) => {
  if (prefix.includes(delimiter)) throw TypeError(`Prefix cannot contain delimiter "${delimiter}"`);
  return `${prefix}${delimiter}${label}${delimiter}${crypto.randomUUID()}`;
};

export const parseConnectionName = (prefix: string, name: string) => {
  if (prefix.includes(delimiter)) throw TypeError(`Prefix cannot contain delimiter "${delimiter}"`);
  const segments = name.split(delimiter);
  if (segments.length !== 3) return undefined;

  const [parsedPrefix, label, uuid] = segments as [string, string, string];
  if (parsedPrefix !== prefix || !isChannelLabel(label) || !isUUID(uuid)) return undefined;

  return {
    label,
    uuid,
  };
};
