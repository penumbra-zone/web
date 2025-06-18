// scripts/find-working-ibc-rpcs.ts
// Collect working RPC endpoints for Cosmos chains that Penumbra has IBC connections with
//
// Usage:
//   bun run scripts/find-working-ibc-rpcs.ts --chain-id=<penumbra-chain-id>
//   bun run scripts/find-working-ibc-rpcs.ts   # defaults to penumbra-1
//
// The script will create `working-ibc-rpcs.json` in the current directory.

import { writeFile } from 'fs/promises';
import { setTimeout as delay } from 'timers/promises';
import { argv, exit } from 'process';
import { StargateClient } from '@cosmjs/stargate';
import { ChainRegistryClient } from '@penumbra-labs/registry';
import chainsData from 'chain-registry';

interface ChainEntry {
  chain_id?: string;
  chain_name: string;
  apis?: {
    rpc?: { address: string }[];
  };
}

type ResultMap = Record<string, string[]>;

const TIMEOUT_MS = 1_000;
const RETRIES = 1;

// Raw GitHub URL template for penumbra registry JSON files
const PENUMBRA_REGISTRY_RAW = (chainId: string) =>
  `https://raw.githubusercontent.com/prax-wallet/registry/main/input/chains/${chainId}.json`;

function parseArgs(): { chainId: string } {
  let chainIdArg: string | undefined;
  for (const arg of argv.slice(2)) {
    if (arg.startsWith('--chain-id=')) {
      chainIdArg = arg.split('=')[1];
    }
  }
  const chainIdEnv = process.env['CHAIN_ID'];
  const chainId = chainIdArg ?? chainIdEnv ?? 'penumbra-1';
  return { chainId };
}

async function isEndpointAlive(endpoint: string): Promise<boolean> {
  for (let attempt = 0; attempt <= RETRIES; attempt += 1) {
    try {
      const clientPromise = StargateClient.connect(endpoint);
      const timeoutPromise = delay(TIMEOUT_MS).then(() => {
        throw new Error('Timeout');
      });
      const client = await Promise.race([clientPromise, timeoutPromise]);
      await client.getChainId();
      return true;
    } catch (_) {
      if (attempt === RETRIES) {
        return false;
      }
    }
  }
  return false;
}

async function main(): Promise<void> {
  const { chainId } = parseArgs();
  console.debug(`Fetching Penumbra registry for chain-id: ${chainId}`);
  let registry: unknown;

  try {
    if (chainId === 'penumbra-1') {
      const url = PENUMBRA_REGISTRY_RAW(chainId);
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      registry = await res.json();
    } else {
      const registryClient = new ChainRegistryClient();
      registry = await registryClient.remote.get(chainId);
    }
  } catch (err) {
    console.error(`Failed to fetch registry for ${chainId}:`, err as Error);
    exit(1);
  }

  const ibcConnections =
    (registry as { ibcConnections?: { chain_name: string }[] } | undefined)?.ibcConnections ?? [];
  console.debug('IBC Connections:', ibcConnections);

  if (!Array.isArray(ibcConnections) || ibcConnections.length === 0) {
    console.error('No IBC connections found in registry');
    exit(1);
  }

  // Gather the exact counter-party chain IDs we are interested in.
  const targetChainIds = new Set<string>();

  for (const conn of ibcConnections) {
    const cid = (conn as { chainId?: string }).chainId;
    if (cid) {
      targetChainIds.add(cid.toLowerCase());
    }
  }

  console.debug('Target chain IDs:', Array.from(targetChainIds));
  console.debug(`Will test RPCs for ${targetChainIds.size} chain(s)`);

  const endpointChecks: { chain: string; address: string }[] = [];

  for (const chain of chainsData.chains as ChainEntry[]) {
    const chainIdEntry = chain.chain_id?.toLowerCase();

    if (!chainIdEntry || !targetChainIds.has(chainIdEntry)) {
      continue;
    }

    console.debug('Matched chain:', chainIdEntry, '|', chain.chain_name);

    const rpcApis = chain.apis?.rpc ?? [];
    console.debug('RPC APIs:', rpcApis);
    for (const { address } of rpcApis) {
      if (!address) {
        console.debug('Skipping entry with missing address');
        continue;
      }

      if (!address.startsWith('http')) {
        console.debug('Skipping non-HTTP address:', address);
        continue;
      }

      endpointChecks.push({ chain: chain.chain_name, address });
    }
  }

  console.debug('Endpoint checks to perform:', endpointChecks);
  console.debug(`Testing ${endpointChecks.length} RPC endpoints in parallel…`);

  const checkResults = await Promise.all(
    endpointChecks.map(async ({ chain, address }) => {
      const ok = await isEndpointAlive(address);
      console.debug(`Endpoint ${address} for chain ${chain} is ${ok ? 'alive' : 'not alive'}`);
      return { chain, address, ok } as const;
    }),
  );

  const results: ResultMap = {};

  for (const { chain, address, ok } of checkResults) {
    if (!ok) {
      console.debug(`Skipping non-working endpoint for chain ${chain}: ${address}`);
      continue;
    }
    (results[chain] ??= []).push(address);
  }

  // Logging summary
  for (const chain of Object.keys(results).sort()) {
    console.debug(`✅ ${chain}: ${(results[chain] ?? []).length} working endpoint(s)`);
  }

  await writeFile('working-ibc-rpcs.json', JSON.stringify(results, null, 2));
  console.debug('Saved results to working-ibc-rpcs.json');
}

await main();
