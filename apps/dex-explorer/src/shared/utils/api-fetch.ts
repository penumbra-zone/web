import { deserialize, Serialized } from './serializer';

/**
 * A wrapper around `fetch` to request data from local endpoints. Features:
 * 1. Composes the URL search params correctly, only provide an object
 * 2. Throws if the response contains an error object
 * 3. Deserializes the response object, if it contains protobuf messages
 */
export const apiFetch = async <RES extends object>(
  url: string,
  searchParams: Record<string, string> = {},
): Promise<RES> => {
  const urlParams = new URLSearchParams(searchParams).toString();
  const fetchRes = await fetch(`${url}${urlParams && `?${urlParams}`}`);

  const jsonRes = (await fetchRes.json()) as Serialized<RES | { error: string }>;

  if ('error' in jsonRes) {
    throw new Error(jsonRes.error);
  }

  if (Array.isArray(jsonRes)) {
    return jsonRes.map(deserialize) as RES;
  }

  return deserialize(jsonRes);
};
