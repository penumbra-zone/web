import { getDisplayDenomExponent } from '@penumbra-zone/getters/metadata';
import { Metadata } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';

export function convertPriceToDisplay(price: number, start: Metadata, end: Metadata): number {
  return price * 10 ** (getDisplayDenomExponent(start) - getDisplayDenomExponent(end));
}
