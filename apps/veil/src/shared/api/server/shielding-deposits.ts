'use server';

import { pindexerDb } from '@/shared/database/client';
import { serialize, Serialized } from '@/shared/utils/serializer';
import { AssetId, Metadata } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { ChainRegistryClient } from '@penumbra-labs/registry';

export interface ShieldingDeposit {
  id: number;
  height: number;
  amount: string;
  assetId: AssetId;
  foreignAddr: string;
  kind: string;
}

export interface ShieldingDepositWithMeta extends ShieldingDeposit {
  metadata: Metadata | undefined;
}

/**
 * Server function to fetch recent shielding deposits (inbound IBC transfers)
 * from the pindexer database with proper asset metadata resolution
 */
export async function fetchShieldingDeposits(
  limit = 100,
): Promise<Serialized<ShieldingDepositWithMeta[]>> {
  const chainId = process.env['PENUMBRA_CHAIN_ID'];
  if (!chainId) {
    throw new Error('PENUMBRA_CHAIN_ID is not set');
  }

  const registryClient = new ChainRegistryClient();
  const registry = await registryClient.remote.get(chainId);

  // Query the pindexer database for recent inbound IBC transfers
  const rows = await pindexerDb
    .selectFrom('ibc_transfer')
    .select(['id', 'height', 'amount', 'asset', 'foreign_addr', 'kind'])
    .where('kind', '=', 'inbound')
    .orderBy('height', 'desc')
    .limit(Math.min(limit, 100))
    .execute();

  // Process rows and enrich with metadata
  const deposits: ShieldingDepositWithMeta[] = rows.map(row => {
    // Create AssetId from the binary asset field
    const assetId = new AssetId({ inner: Uint8Array.from(row.asset) });

    // Get metadata from registry
    const metadata = registry.tryGetMetadata(assetId);

    return {
      id: row.id,
      height: Number(row.height),
      amount: row.amount,
      assetId,
      foreignAddr: row.foreign_addr,
      kind: row.kind,
      metadata,
    };
  });

  return serialize(deposits);
}
