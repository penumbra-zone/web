import { NextRequest, NextResponse } from 'next/server';
import { ChainRegistryClient } from '@penumbra-labs/registry';
import {
  SimulateTradeRequest,
  SimulateTradeResponse,
} from '@penumbra-zone/protobuf/penumbra/core/component/dex/v1/dex_pb';
import { Value } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { Amount } from '@penumbra-zone/protobuf/penumbra/core/num/v1/num_pb';
import { RouteBookResponseJson } from '@/shared/api/server/book/types.ts';
import { processSimulation } from '@/shared/api/server/book/helpers.ts';
import { serializeResponse } from '@/shared/api/server/book/serialization.ts';
import { SimulationService } from '@penumbra-zone/protobuf';
import { Client } from '@connectrpc/connect';
import { createClient } from '@/shared/utils/protos/utils.ts';
import { toBaseUnit } from '@penumbra-zone/types/lo-hi';
import { BigNumber } from 'bignumber.js';
import { getDisplayDenomExponent } from '@penumbra-zone/getters/metadata';

export const SIMULATION_UNITS = 5000; // Simulate with 5k units instead of infinite
export const TRACE_LIMIT_DEFAULT = 8;

export type RouteBookApiResponse = RouteBookResponseJson | { error: string };

export async function GET(req: NextRequest): Promise<NextResponse<RouteBookApiResponse>> {
  const grpcEndpoint = process.env['PENUMBRA_GRPC_ENDPOINT'];
  const chainId = process.env['PENUMBRA_CHAIN_ID'];
  if (!grpcEndpoint || !chainId) {
    return NextResponse.json(
      { error: 'PENUMBRA_GRPC_ENDPOINT or PENUMBRA_CHAIN_ID is not set' },
      { status: 500 },
    );
  }

  const { searchParams } = new URL(req.url);
  const baseAssetSymbol = searchParams.get('baseAsset');
  const quoteAssetSymbol = searchParams.get('quoteAsset');
  const traceParam = searchParams.get('traceLimit');
  const limit = traceParam ? Number(traceParam) : TRACE_LIMIT_DEFAULT;
  if (!baseAssetSymbol || !quoteAssetSymbol) {
    return NextResponse.json(
      { error: 'Missing required baseAsset or quoteAsset' },
      { status: 400 },
    );
  }

  const registryClient = new ChainRegistryClient();
  const registry = await registryClient.remote.get(chainId);

  // TODO: Add getMetadataBySymbol() helper to registry npm package
  const allAssets = registry.getAllAssets();
  const baseAssetMetadata = allAssets.find(
    a => a.symbol.toLowerCase() === baseAssetSymbol.toLowerCase(),
  );
  const quoteAssetMetadata = allAssets.find(
    a => a.symbol.toLowerCase() === quoteAssetSymbol.toLowerCase(),
  );
  if (!baseAssetMetadata || !quoteAssetMetadata) {
    return NextResponse.json(
      { error: `Base asset or quoteAsset metadata not found in registry` },
      { status: 400 },
    );
  }

  // Calculate the proper amount based on the asset's decimals
  // For example, USDC has 6 decimals, so 10000 USDC = 10000 * 10^6 base units
  const baseAssetExponent = getDisplayDenomExponent(baseAssetMetadata);
  const quoteAssetExponent = getDisplayDenomExponent(quoteAssetMetadata);

  const baseAssetAmount = toBaseUnit(BigNumber(SIMULATION_UNITS), baseAssetExponent);
  const quoteAssetAmount = toBaseUnit(BigNumber(SIMULATION_UNITS), quoteAssetExponent);

  // We use the simulate trade queries with a reasonable amount of input
  // to discover liquidity at various price points. The RPC will return
  // a stack of traces that will let us represent the amount of inventory
  // available at every relevant price point.
  //
  // To do this, we simulate two trades in opposite directions.
  const buySideRequest = new SimulateTradeRequest({
    input: new Value({
      // We sell the base asset, to discover traces of the buy side (quote asset).
      assetId: baseAssetMetadata.penumbraAssetId,
      amount: baseAssetAmount,
    }),
    output: quoteAssetMetadata.penumbraAssetId,
  });

  const sellSideRequest = new SimulateTradeRequest({
    input: new Value({
      // We simulate a buy of the base asset, to discover traces of the sell side.
      assetId: quoteAssetMetadata.penumbraAssetId,
      amount: quoteAssetAmount,
    }),
    output: baseAssetMetadata.penumbraAssetId,
  });

  const client = createClient(grpcEndpoint, SimulationService);
  const [buyRes, sellRes] = await Promise.all([
    simulateTrade(client, buySideRequest),
    simulateTrade(client, sellSideRequest),
  ]);
  const buyMulti = processSimulation({ res: buyRes, registry, limit, quote_to_base: false });
  const sellMulti = processSimulation({ res: sellRes, registry, limit, quote_to_base: true });

  const response = {
    singleHops: {
      buy: buyMulti.filter(t => t.hops.length === 2),
      sell: sellMulti.filter(t => t.hops.length === 2),
    },
    multiHops: { buy: buyMulti, sell: sellMulti },
  };
  return NextResponse.json(serializeResponse(response));
}

const simulateTrade = async (
  client: Client<typeof SimulationService>,
  req: SimulateTradeRequest,
) => {
  try {
    return await client.simulateTrade(req);
  } catch (e) {
    // If the error contains 'there are no orders to fulfill this swap', there are no orders to fulfill the trade,
    // so just return an empty array
    if (e instanceof Error && e.message.includes('there are no orders to fulfill this swap')) {
      return new SimulateTradeResponse({});
    }

    throw new Error(`Error retrieving route book: ${String(e)}`);
  }
};
