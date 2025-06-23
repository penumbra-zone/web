import { pindexerDb } from '@/shared/database/client';
import { AssetId } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';

export async function indexingAsset(): Promise<AssetId> {
  const { quote_asset_id } = await pindexerDb
    .selectFrom('dex_ex_metadata')
    .select('quote_asset_id')
    .executeTakeFirstOrThrow();
  return new AssetId({ inner: quote_asset_id });
}
