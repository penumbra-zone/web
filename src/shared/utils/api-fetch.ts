import { deserialize, Serialized } from './serializer';
import { JsonValue } from '@bufbuild/protobuf';

const parseResponse = async <RES extends object>(response: Response) => {
  const jsonRes = (await response.json()) as Serialized<RES | { error: string }>;

  if ('error' in jsonRes) {
    throw new Error(jsonRes.error);
  }

  if (Array.isArray(jsonRes)) {
    return jsonRes.map(deserialize) as RES;
  }

  return deserialize(jsonRes);
};

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

  return parseResponse<RES>(fetchRes);
};

/**
 * Same as `apiFetch`, but does a POST request with the second param as JSON body.
 */
export const apiPostFetch = async <RES extends object>(
  url: string,
  body: JsonValue = {},
): Promise<RES> => {
  const fetchRes = await fetch(url, {
    method: 'POST',
    body: JSON.stringify(body),
  });

  return parseResponse<RES>(fetchRes);
};
