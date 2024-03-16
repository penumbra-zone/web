// pages/tradingPairs/index.tsx

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import Layout from "../../components/layout";
import {
  VStack,
  Text,
  Spinner,
  Center,
  Box,
  HStack,
  Input,
  Button,
} from "@chakra-ui/react";
import { useSearchParams } from "next/navigation";
import { testnetConstants } from "@/constants/configConstants";
import { SimulationQuerier } from "@/utils/protos/services/dex/simulated-trades";
import {
  SimulateTradeRequest,
  SimulateTradeRequest_Routing_SingleHop,
  SimulateTradeResponse,
  SwapExecution,
} from "@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/dex/v1/dex_pb";
import { LoadingSpinner } from "../../components/util/loadingSpinner";
import { Token, tokenConfigMapOnSymbol } from "@/constants/tokenConstants";
import { base64ToUint8Array } from "@/utils/math/base64";
import { splitLoHi } from "@/utils/math/hiLo";

export default function TradingPairs() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();
  const searchParams = useSearchParams();

  const tokenInSymbol = searchParams.get("tokenIn")?.toLocaleLowerCase() || "unknown";
  const tokenOutSymbol = searchParams.get("tokenOut")?.toLocaleLowerCase() || "unknown";

  const [simulatedSingleHopData, setSimulatedSingleHopData] = useState<
    SwapExecution | undefined
  >(undefined);
  const [simulatedMultiHopData, setSimulatedMultiHopData] = useState<
    SwapExecution | undefined
  >(undefined);

  // TODO: Decide how to set this more intelligently/dynamically
  const unitsToSimulateSelling = 1000000; // 1 million units

  useEffect(() => {
    setIsLoading(true);

    // Get token 1 & 2
    const assetInToken = tokenConfigMapOnSymbol[tokenInSymbol];
    const assetOutToken = tokenConfigMapOnSymbol[tokenOutSymbol];

    if (!assetInToken || !assetOutToken) {
      setIsLoading(false);
      return;
    }

    const sim_querier = new SimulationQuerier({
      grpcEndpoint: testnetConstants.grpcEndpoint,
    });

    const amt = splitLoHi(
      BigInt(unitsToSimulateSelling * 10 ** assetInToken.decimals)
    );

    const simRequestMultiHop = new SimulateTradeRequest({
      input: {
        assetId: {
          inner: base64ToUint8Array(assetInToken.inner),
        },
        amount: {
          lo: amt.lo,
          hi: amt.hi,
        },
      },
      output: {
        inner: base64ToUint8Array(assetOutToken.inner),
      },
    });

    // Same as above but set routing
    const simRequestSingleHop = new SimulateTradeRequest({
      input: {
        assetId: {
          inner: base64ToUint8Array(assetInToken.inner),
        },
        amount: {
          lo: amt.lo,
          hi: amt.hi,
        },
      },
      output: {
        inner: base64ToUint8Array(assetOutToken.inner),
      },
      routing: {
        setting: {
          case: "singleHop",
          value: SimulateTradeRequest_Routing_SingleHop,
        },
      },
    });

    const simQueryMultiHopResponse =
      sim_querier.simulateTrade(simRequestMultiHop);
    const simQuerySingleHopResponse =
      sim_querier.simulateTrade(simRequestSingleHop);

    Promise.all([simQueryMultiHopResponse, simQuerySingleHopResponse])
      .then(([simQueryMultiHopResponse, simQuerySingleHopResponse]) => {
        setSimulatedMultiHopData(simQueryMultiHopResponse);
        setSimulatedSingleHopData(simQuerySingleHopResponse);
        console.log("simQueryMultiHopResponse", simQueryMultiHopResponse);
        console.log("simQuerySingleHopResponse", simQuerySingleHopResponse);
      })
      .catch((error) => {
        console.error("Error querying simulated trades", error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [tokenInSymbol, tokenOutSymbol]);

  return (
    <Layout pageTitle={`${tokenInSymbol}/${tokenOutSymbol}`}>
      {isLoading ? (
        <Center height="100vh">
          <LoadingSpinner />
        </Center>
      ) : simulatedMultiHopData && simulatedSingleHopData ? (
        <Center height="100vh">
          <Text>{`${tokenInSymbol} ${tokenOutSymbol}`}</Text>
        </Center>
      ) : !isLoading &&
        tokenInSymbol !== "unknown" ||
        tokenOutSymbol !== "unknown" ? (
        <Center height="100vh">
          <Text>{`Token parameters invalid`}</Text>
        </Center>
      ) : null}
    </Layout>
  );
}
