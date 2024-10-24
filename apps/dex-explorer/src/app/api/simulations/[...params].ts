import { NextRequest, NextResponse } from 'next/server';
import { SimulationQuerier } from '@/shared/old-utils/protos/services/dex/simulated-trades';
import { base64ToUint8Array } from '@/shared/old-utils/math/base64';
import {
  SimulateTradeRequest,
  SimulateTradeRequest_Routing_SingleHop,
} from '@penumbra-zone/protobuf/penumbra/core/component/dex/v1/dex_pb';
import { splitLoHi } from '@/shared/old-utils/math/hiLo';
import { fetchAllTokenAssets } from '@/shared/old-utils/token/tokenFetch';

interface Params {
  params: string[];
}

export async function GET(_req: NextRequest, context: { params: Promise<Params> }) {
  const grpcEndpoint = process.env['PENUMBRA_GRPC_ENDPOINT'];
  const chainId = process.env['PENUMBRA_CHAIN_ID'];
  if (!grpcEndpoint || !chainId) {
    throw new Error('PENUMBRA_GRPC_ENDPOINT or PENUMBRA_CHAIN_ID is not set');
  }

  const params = (await context.params).params;
  const token1 = params[0] ?? null;
  const token2 = params[1] ?? null;
  const amountIn = params[2] ?? null;
  const singleHop = params[3] ?? null;

  let isSingleHop = false;

  try {
    if (!token1 || !token2 || !amountIn) {
      return NextResponse.json({ error: 'Invalid query parameters' }, { status: 400 });
    }

    if (String(singleHop).toLocaleLowerCase() === 'singlehop') {
      isSingleHop = true;
    }

    // Get token 1 & 2
    const tokenAssets = fetchAllTokenAssets(chainId);
    const asset1Token = tokenAssets.find(
      x => x.display.toLocaleLowerCase() === token1.toLocaleLowerCase(),
    );
    const asset2Token = tokenAssets.find(
      x => x.display.toLocaleLowerCase() === token2.toLocaleLowerCase(),
    );

    if (!asset1Token || !asset2Token) {
      return NextResponse.json(
        { error: 'Could not find requested token in registry' },
        { status: 400 },
      );
    }
    const sim_querier = new SimulationQuerier({
      grpcEndpoint: grpcEndpoint,
    });

    const amtIn = splitLoHi(BigInt(Number(amountIn) * 10 ** asset1Token.decimals));

    let simRequest = new SimulateTradeRequest({});
    if (!isSingleHop) {
      simRequest = new SimulateTradeRequest({
        input: {
          assetId: {
            inner: base64ToUint8Array(asset1Token.inner),
          },
          amount: {
            lo: amtIn.lo,
            hi: amtIn.hi,
          },
        },
        output: {
          inner: base64ToUint8Array(asset2Token.inner),
        },
      });
    } else {
      simRequest = new SimulateTradeRequest({
        input: {
          assetId: {
            inner: base64ToUint8Array(asset1Token.inner),
          },
          amount: {
            lo: amtIn.lo,
            hi: amtIn.hi,
          },
        },
        output: {
          inner: base64ToUint8Array(asset2Token.inner),
        },
        routing: {
          setting: {
            case: 'singleHop',
            value: SimulateTradeRequest_Routing_SingleHop,
          },
        },
      });
    }

    const data = await sim_querier.simulateTrade(simRequest);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error simulation trade grpc data:', error);
    // If the error contains 'there are no orders to fulfill this swap', there are no orders to fulfill the trade, so just return an empty array
    if (error instanceof Error) {
      const errorMessage = error.message;

      // If the error message contains 'there are no orders to fulfill this swap', return an empty array
      if (errorMessage.includes('there are no orders to fulfill this swap')) {
        return NextResponse.json({ traces: [] });
      }
    }

    return NextResponse.json(
      { error: `Error simualtion trade grpc data: ${error as string}` },
      { status: 500 },
    );
  }
}
