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
import { joinLoHi, splitLoHi } from "@/utils/math/hiLo";
import { set } from "zod";

export default function TradingPairs() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();
  const searchParams = useSearchParams();

  const token1Symbol =
    searchParams.get("tokenIn")?.toLocaleLowerCase() || "unknown";
  const token2Symbol =
    searchParams.get("tokenOut")?.toLocaleLowerCase() || "unknown";

  const [asset1Token, setAsset1Token] = useState<Token | undefined>();
  const [asset2Token, setAsset2Token] = useState<Token | undefined>();

  const [
    simulatedSingleHopAsset1SellData,
    setSimulatedSingleHopAsset1SellData,
  ] = useState<SwapExecution | undefined>(undefined);
  const [simulatedMultiHopAsset1SellData, setSimulatedMultiHopAsset1SellData] =
    useState<SwapExecution | undefined>(undefined);

  // Depth chart data points, x is price, y is liquidity
  const [
    depthChartMultiHopAsset1SellPoints,
    setDepthChartMultiHopAsset1SellPoints,
  ] = useState<
    {
      x: number;
      y: number;
    }[]
  >([]);
  const [
    depthChartSingleHopAsset1SellPoints,
    setDepthChartSingleHopAsset1SellPoints,
  ] = useState<{ x: number; y: number }[]>([]);

  // ! Note this needs to be kind of extreme for now due to limited 'real' liquidity
  // TODO: Maybe make this configurable, for now it will only show 30% of depth chart past best sell/buy prices
  const bestPriceDeviationPercent = 30; // 30%,
  const [bestAsset1SellPriceMultiHop, setBestAsset1SellPriceMultiHop] =
    useState<number | undefined>(undefined);
  const [bestAsset1SellPriceSingleHop, setBestAsset1SellPriceSingleHop] =
    useState<number | undefined>(undefined);

  // TODO: Decide how to set this more intelligently/dynamically
  const unitsToSimulateSelling = 10000; // 1 million units

  useEffect(() => {
    setIsLoading(true);

    // Get token 1 & 2
    const asset1Token = tokenConfigMapOnSymbol[token1Symbol];
    const asset2Token = tokenConfigMapOnSymbol[token2Symbol];

    if (!asset1Token || !asset2Token) {
      setIsLoading(false);
      return;
    }
    setAsset1Token(asset1Token);
    setAsset2Token(asset2Token);

    const sim_querier = new SimulationQuerier({
      grpcEndpoint: testnetConstants.grpcEndpoint,
    });

    const amt = splitLoHi(
      BigInt(unitsToSimulateSelling * 10 ** asset1Token.decimals)
    );

    const simRequestMultiHop = new SimulateTradeRequest({
      input: {
        assetId: {
          inner: base64ToUint8Array(asset1Token.inner),
        },
        amount: {
          lo: amt.lo,
          hi: amt.hi,
        },
      },
      output: {
        inner: base64ToUint8Array(asset2Token.inner),
      },
    });

    // Same as above but set routing
    const simRequestSingleHop = new SimulateTradeRequest({
      input: {
        assetId: {
          inner: base64ToUint8Array(asset1Token.inner),
        },
        amount: {
          lo: amt.lo,
          hi: amt.hi,
        },
      },
      output: {
        inner: base64ToUint8Array(asset2Token.inner),
      },
      routing: {
        setting: {
          case: "singleHop",
          value: SimulateTradeRequest_Routing_SingleHop,
        },
      },
    });

    const simQueryMultiHopAsset1SellResponse =
      sim_querier.simulateTrade(simRequestMultiHop);
    const simQuerySingleHopAsset1SellResponse =
      sim_querier.simulateTrade(simRequestSingleHop);

    Promise.all([
      simQueryMultiHopAsset1SellResponse,
      simQuerySingleHopAsset1SellResponse,
    ])
      .then(
        ([
          simQueryMultiHopAsset1SellResponse,
          simQuerySingleHopAsset1SellResponse,
        ]) => {
          setSimulatedMultiHopAsset1SellData(
            simQueryMultiHopAsset1SellResponse
          );
          setSimulatedSingleHopAsset1SellData(
            simQuerySingleHopAsset1SellResponse
          );
          console.log(
            "simQueryMultiHopAsset1SellResponse",
            simQueryMultiHopAsset1SellResponse
          );
          console.log(
            "simQuerySingleHopAsset1SellResponse",
            simQuerySingleHopAsset1SellResponse
          );
        }
      )
      .catch((error) => {
        console.error("Error querying simulated trades", error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [token1Symbol, token2Symbol]);

  useEffect(() => {
    setIsLoading(true);

    if (!simulatedMultiHopAsset1SellData || !simulatedSingleHopAsset1SellData || !asset1Token || !asset2Token) {
      return;
    }
    let bestAsset1SellPriceMultiHop: number | undefined;
    let bestAsset1SellPriceSingleHop: number | undefined;


    // Clear depth chart data
    setDepthChartMultiHopAsset1SellPoints([]);
    setDepthChartSingleHopAsset1SellPoints([]);

    // Set single and multi hop depth chart data
    simulatedMultiHopAsset1SellData!.traces.forEach((trace) => {
      // First item is the input, last item is the output
      const input = trace.value.at(0);
      const output = trace.value.at(trace.value.length - 1);

      const inputValue =
        Number(joinLoHi(input!.amount!.lo!, input!.amount!.hi)) /
        Number(10 ** asset1Token.decimals);
      const outputValue =
        Number(joinLoHi(output!.amount!.lo, output!.amount!.hi)) /
        Number(BigInt(10 ** asset2Token.decimals));

      const price: number = outputValue / inputValue;

      // First trace will have best price, so set only on first iteration
      if (trace === simulatedMultiHopAsset1SellData!.traces[0]) {
        console.log("Best Asset1 Sell Price for multi hop", price);
        setBestAsset1SellPriceMultiHop(Number(price));
        bestAsset1SellPriceMultiHop = price;
      }

      // If price is within % of best price, add to depth chart, else ignore
      if (
        price <=
        bestAsset1SellPriceMultiHop! * (1 - bestPriceDeviationPercent / 100)
      ) {
        depthChartMultiHopAsset1SellPoints.push({
          x: Number(price),
          y: Number(inputValue),
        });
      } else {
        /*
        console.log(
          `Price not within ${bestPriceDeviationPercent}% of worst price, ignoring`,
          price
        );
        */
        
        // break the loop
        return
      }
    });

    // Similar logic for single hop
    simulatedSingleHopAsset1SellData!.traces.forEach((trace) => {
      // First item is the input, last item is the output
      const input = trace.value.at(0);
      const output = trace.value.at(1); // If this isnt 1 then something is wrong

      const inputValue =
        Number(joinLoHi(input!.amount!.lo!, input!.amount!.hi)) /
        Number(10 ** asset1Token.decimals);
      const outputValue =
        Number(joinLoHi(output!.amount!.lo, output!.amount!.hi)) /
        Number(BigInt(10 ** asset2Token.decimals));

      const price: number = outputValue / inputValue;

      // First trace will have best price, so set only on first iteration
      if (trace === simulatedSingleHopAsset1SellData!.traces[0]) {
        console.log("Best Asset1 Sell Price for single hop", price);
        setBestAsset1SellPriceSingleHop(Number(price));
        bestAsset1SellPriceSingleHop = price;
      }

      // If price is within % of best price, add to depth chart, else ignore
      if (
        price <=
        bestAsset1SellPriceSingleHop! * (1 - bestPriceDeviationPercent / 100)
      ) {
        depthChartSingleHopAsset1SellPoints.push({
          x: Number(price),
          y: Number(inputValue),
        });
      } else {
        /*
        console.log(
          `Price not within ${bestPriceDeviationPercent}% of worst price, ignoring`,
          price
        );*/

        // break the loop
        return
      }
    });

    // print to debug
    console.log(
      "depthChartMultiHopAsset1SellPoints",
      depthChartMultiHopAsset1SellPoints
    );
    console.log(
      "depthChartSingleHopAsset1SellPoints",
      depthChartSingleHopAsset1SellPoints
    );
    setIsLoading(false);
  }, [simulatedMultiHopAsset1SellData, simulatedSingleHopAsset1SellData, asset1Token, asset2Token]);

  return (
    <Layout pageTitle={`${token1Symbol}/${token2Symbol}`}>
      {isLoading ? (
        <Center height="100vh">
          <LoadingSpinner />
        </Center>
      ) : simulatedMultiHopAsset1SellData &&
        simulatedSingleHopAsset1SellData ? (
        <Center height="100vh">
          <Box className="neon-box" padding={"3em"}>
            {/* Liqudity Price Graph */}
          </Box>
        </Center>
      ) : (!isLoading && token1Symbol !== "unknown") ||
        token2Symbol !== "unknown" ? (
        <Center height="100vh">
          <Text>{`Token parameters invalid`}</Text>
        </Center>
      ) : null}
    </Layout>
  );
}
