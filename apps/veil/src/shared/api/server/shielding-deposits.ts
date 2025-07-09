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
  timestamp: number;
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

  // Query the pindexer database for recent inbound IBC transfers with timestamps
  const rows = await pindexerDb
    .selectFrom('ibc_transfer')
    .innerJoin('block_details', 'ibc_transfer.height', 'block_details.height')
    .select([
      'ibc_transfer.id',
      'ibc_transfer.height',
      'ibc_transfer.amount',
      'ibc_transfer.asset',
      'ibc_transfer.foreign_addr',
      'ibc_transfer.kind',
      'block_details.timestamp',
    ])
    .where('ibc_transfer.kind', '=', 'inbound')
    .orderBy('ibc_transfer.height', 'desc')
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
      timestamp: row.timestamp.getTime(),
      metadata,
    };
  });

  return serialize(deposits);
}
