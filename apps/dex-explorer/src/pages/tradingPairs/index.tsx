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
import { SwapExecution } from "@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/dex/v1/dex_pb";
import { LoadingSpinner } from "../../components/util/loadingSpinner";
import { Token, tokenConfigMapOnSymbol } from "@/constants/tokenConstants";
import { base64ToUint8Array } from "@/utils/math/base64";
import { joinLoHi, splitLoHi } from "@/utils/math/hiLo";
import DepthChart from "@/components/charts/depthChart";

// TODO: Better parameter check

// ! Important note: 'sell' side here refers to selling asset1 for asset2, so its really DEMAND for buying asset 1, anc vice versa for 'buy' side
export default function TradingPairs() {
  const [isLoading, setIsLoading] = useState(true);
  const [isChartLoading, setIsChartLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();
  const searchParams = useSearchParams();

  const token1Symbol =
    searchParams.get("baseToken")?.toLocaleLowerCase() || "unknown";
  const token2Symbol =
    searchParams.get("quoteToken")?.toLocaleLowerCase() || "unknown";

  const [asset1Token, setAsset1Token] = useState<Token | undefined>();
  const [asset2Token, setAsset2Token] = useState<Token | undefined>();
  const [singleHop, setSingleHop] = useState<boolean>(false);

  useEffect(() => {
    if (searchParams.get("singleHop") !== null) {
      setSingleHop(true);
    }
  }, [searchParams]);

  // Sell Side
  const [
    simulatedSingleHopAsset1SellData,
    setSimulatedSingleHopAsset1SellData,
  ] = useState<SwapExecution | undefined>(undefined);
  const [simulatedMultiHopAsset1SellData, setSimulatedMultiHopAsset1SellData] =
    useState<SwapExecution | undefined>(undefined);

  // Buy Side
  const [simulatedSingleHopAsset1BuyData, setSimulatedSingleHopAsset1BuyData] =
    useState<SwapExecution | undefined>(undefined);
  const [simulatedMultiHopAsset1BuyData, setSimulatedMultiHopAsset1BuyData] =
    useState<SwapExecution | undefined>(undefined);

  // Depth chart data points, x is price, y is liquidity

  // Sell Side
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

  // Buy Side
  const [
    depthChartMultiHopAsset1BuyPoints,
    setDepthChartMultiHopAsset1BuyPoints,
  ] = useState<
    {
      x: number;
      y: number;
    }[]
  >([]);
  const [
    depthChartSingleHopAsset1BuyPoints,
    setDepthChartSingleHopAsset1BuyPoints,
  ] = useState<{ x: number; y: number }[]>([]);

  // ! Note this needs to be kind of extreme for now due to limited 'real' liquidity
  // TODO: Maybe make this configurable, for now it will only show 50% of depth chart past best sell/buy prices
  const bestPriceDeviationPercent = 75; // 75%, 
  // TODO: ^ Override to 100% to show all liquidity

  // Sell Side
  const [bestAsset1SellPriceMultiHop, setBestAsset1SellPriceMultiHop] =
    useState<number | undefined>(undefined);
  const [bestAsset1SellPriceSingleHop, setBestAsset1SellPriceSingleHop] =
    useState<number | undefined>(undefined);

  // Buy Side
  const [bestAsset1BuyPriceMultiHop, setBestAsset1BuyPriceMultiHop] = useState<
    number | undefined
  >(undefined);
  const [bestAsset1BuyPriceSingleHop, setBestAsset1BuyPriceSingleHop] =
    useState<number | undefined>(undefined);

  // TODO: Decide how to set this more intelligently/dynamically
  const unitsToSimulateSelling = 1000000; // 1M units
  const unitsToSimulateBuying = 1000000; // 1M units

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

    const simSellMultiHopPromise = fetch(
      `/api/simulations/${asset1Token.symbol}/${asset2Token.symbol}/${unitsToSimulateSelling}`
    ).then((res) => res.json());
    const simSellSingleHopPromise = fetch(
      `/api/simulations/${asset1Token.symbol}/${asset2Token.symbol}/${unitsToSimulateSelling}/singleHop`
    ).then((res) => res.json());
    const simBuyMultiHopPromise = fetch(
      `/api/simulations/${asset2Token.symbol}/${asset1Token.symbol}/${unitsToSimulateBuying}`
    ).then((res) => res.json());
    const simBuySingleHopPromise = fetch(
      `/api/simulations/${asset2Token.symbol}/${asset1Token.symbol}/${unitsToSimulateBuying}/singleHop`
    ).then((res) => res.json());

    Promise.all([
      simSellMultiHopPromise,
      simSellSingleHopPromise,
      simBuyMultiHopPromise,
      simBuySingleHopPromise,
    ])
      .then(
        ([
          simQueryMultiHopAsset1SellResponse,
          simQuerySingleHopAsset1SellResponse,
          simQueryMultiHopAsset1BuyResponse,
          simQuerySingleHopAsset1BuyResponse,
        ]) => {
          if (
            !simQueryMultiHopAsset1SellResponse ||
            simQueryMultiHopAsset1SellResponse.error ||
            !simQuerySingleHopAsset1SellResponse ||
            simQuerySingleHopAsset1SellResponse.error ||
            !simQueryMultiHopAsset1BuyResponse ||
            simQueryMultiHopAsset1BuyResponse.error ||
            !simQuerySingleHopAsset1BuyResponse ||
            simQuerySingleHopAsset1BuyResponse.error
          ) {
            console.error("Error querying simulated trades");
            setError("Error querying simulated trades");
          }

          setSimulatedMultiHopAsset1SellData(
            simQueryMultiHopAsset1SellResponse as SwapExecution
          );
          setSimulatedSingleHopAsset1SellData(
            simQuerySingleHopAsset1SellResponse as SwapExecution
          );
          setSimulatedMultiHopAsset1BuyData(
            simQueryMultiHopAsset1BuyResponse as SwapExecution
          );
          setSimulatedSingleHopAsset1BuyData(
            simQuerySingleHopAsset1BuyResponse as SwapExecution
          );
          console.log(
            "simQueryMultiHopAsset1SellResponse",
            simQueryMultiHopAsset1SellResponse
          );
          console.log(
            "simQuerySingleHopAsset1SellResponse",
            simQuerySingleHopAsset1SellResponse
          );
          console.log(
            "simQueryMultiHopAsset1BuyResponse",
            simQueryMultiHopAsset1BuyResponse
          );
          console.log(
            "simQuerySingleHopAsset1BuyResponse",
            simQuerySingleHopAsset1BuyResponse
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
    setIsChartLoading(true);

    if (
      !simulatedMultiHopAsset1SellData ||
      !simulatedSingleHopAsset1SellData ||
      !asset1Token ||
      !asset2Token ||
      !simulatedMultiHopAsset1BuyData ||
      !simulatedSingleHopAsset1BuyData
    ) {
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
        Number(
          joinLoHi(BigInt(input!.amount!.lo!), BigInt(input!.amount!.hi))
        ) / Number(10 ** asset1Token.decimals);
      const outputValue =
        Number(
          joinLoHi(BigInt(output!.amount!.lo), BigInt(output!.amount!.hi))
        ) / Number(BigInt(10 ** asset2Token.decimals));

      const price: number = outputValue / inputValue;

      // First trace will have best price, so set only on first iteration
      if (trace === simulatedMultiHopAsset1SellData!.traces[0]) {
        console.log("Best Asset1 Sell Price for multi hop", price);
        setBestAsset1SellPriceMultiHop(Number(price));
        bestAsset1SellPriceMultiHop = price;
      }

      // If price is within % of best price, add to depth chart, else ignore
      if (
        price >=
        bestAsset1SellPriceMultiHop! * (1 - bestPriceDeviationPercent / 100)
      ) {
        depthChartMultiHopAsset1SellPoints.push({
          x: Number(price),
          y: Number(inputValue),
        });
      } else {
        /*
        console.log(
          `Price not within ${bestPriceDeviationPercent}% of best price, ignoring`,
          price
        );
        */

        // break the loop
        return;
      }
    });

    // Similar logic for single hop
    simulatedSingleHopAsset1SellData!.traces.forEach((trace) => {
      // First item is the input, last item is the output
      const input = trace.value.at(0);
      const output = trace.value.at(1); // If this isnt 1 then something is wrong

      const inputValue =
        Number(
          joinLoHi(BigInt(input!.amount!.lo!), BigInt(input!.amount!.hi))
        ) / Number(10 ** asset1Token.decimals);
      const outputValue =
        Number(
          joinLoHi(BigInt(output!.amount!.lo), BigInt(output!.amount!.hi))
        ) / Number(BigInt(10 ** asset2Token.decimals));

      const price: number = outputValue / inputValue;

      // First trace will have best price, so set only on first iteration
      if (trace === simulatedSingleHopAsset1SellData!.traces[0]) {
        console.log("Best Asset1 Sell Price for single hop", price);
        setBestAsset1SellPriceSingleHop(Number(price));
        bestAsset1SellPriceSingleHop = price;
      }

      // If price is within % of best price, add to depth chart, else ignore
      if (
        price >=
        bestAsset1SellPriceSingleHop! * (1 - bestPriceDeviationPercent / 100)
      ) {
        depthChartSingleHopAsset1SellPoints.push({
          x: Number(price),
          y: Number(inputValue),
        });
      } else {
        /*
        console.log(
          `Price not within ${bestPriceDeviationPercent}% of best price, ignoring`,
          price
        );*/

        // break the loop
        return;
      }
    });

    // Do it all again for the buy side :)
    //! Maybe theres a way to refactor this to be more concise
    let bestAsset1BuyPriceMultiHop: number | undefined;
    let bestAsset1BuyPriceSingleHop: number | undefined;

    // Clear depth chart data
    setDepthChartMultiHopAsset1BuyPoints([]);
    setDepthChartSingleHopAsset1BuyPoints([]);

    // Set single and multi hop depth chart data
    simulatedMultiHopAsset1BuyData!.traces.forEach((trace) => {
      // First item is the input, last item is the output
      const input = trace.value.at(0);
      const output = trace.value.at(trace.value.length - 1);

      const inputValue =
        Number(
          joinLoHi(BigInt(input!.amount!.lo!), BigInt(input!.amount!.hi))
        ) / Number(10 ** asset2Token.decimals);
      const outputValue =
        Number(
          joinLoHi(BigInt(output!.amount!.lo), BigInt(output!.amount!.hi))
        ) / Number(BigInt(10 ** asset1Token.decimals));

      // ! Important to note that the price is inverted here, so we do input/output instead of output/input
      const price: number = inputValue / outputValue;

      // First trace will have best price, so set only on first iteration
      if (trace === simulatedMultiHopAsset1BuyData!.traces[0]) {
        console.log("Best Asset1 Buy Price for multi hop", price);
        setBestAsset1BuyPriceMultiHop(Number(price));
        bestAsset1BuyPriceMultiHop = price;
      }

      // If price is within % of best price, add to depth chart, else ignore
      if (
        price <=
        bestAsset1BuyPriceMultiHop! * (1 + bestPriceDeviationPercent / 100)
      ) {
        depthChartMultiHopAsset1BuyPoints.push({
          x: Number(price),
          y: Number(outputValue),
        });
      } else {
        /*
        console.log(
          `Price not within ${bestPriceDeviationPercent}% of best price, ignoring`,
          price
        );
        */

        // break the loop
        return;
      }
    });

    // Similar logic for single hop
    simulatedSingleHopAsset1BuyData!.traces.forEach((trace) => {
      // First item is the input, last item is the output
      const input = trace.value.at(0);
      const output = trace.value.at(1); // If this isnt 1 then something is wrong

      const inputValue =
        Number(
          joinLoHi(BigInt(input!.amount!.lo!), BigInt(input!.amount!.hi))
        ) / Number(10 ** asset2Token.decimals);
      const outputValue =
        Number(
          joinLoHi(BigInt(output!.amount!.lo), BigInt(output!.amount!.hi))
        ) / Number(BigInt(10 ** asset1Token.decimals));

      // ! Important to note that the price is inverted here, so we do input/output instead of output/input
      const price: number = inputValue / outputValue;

      // First trace will have best price, so set only on first iteration
      if (trace === simulatedSingleHopAsset1BuyData!.traces[0]) {
        console.log("Best Asset1 Buy Price for single hop", price);
        setBestAsset1BuyPriceSingleHop(Number(price));
        bestAsset1BuyPriceSingleHop = price;
      }

      // If price is within % of best price, add to depth chart, else ignore
      if (
        price <=
        bestAsset1BuyPriceSingleHop! * (1 + bestPriceDeviationPercent / 100)
      ) {
        depthChartSingleHopAsset1BuyPoints.push({
          x: Number(price),
          y: Number(outputValue),
        });
      } else {
        /*
        console.log(
          `Price not within ${bestPriceDeviationPercent}% of best price, ignoring`,
          price
        );*/

        // break the loop
        return;
      }
    });

    // Set all of the stateful data
    // ! First update depth and sell charts to show CUMULTAIVE liquidity (y) of all points before them
    for (let i = 1; i < depthChartMultiHopAsset1SellPoints.length; i++) {
      depthChartMultiHopAsset1SellPoints[i].y +=
        depthChartMultiHopAsset1SellPoints[i - 1].y;
    }
    for (let i = 1; i < depthChartSingleHopAsset1SellPoints.length; i++) {
      depthChartSingleHopAsset1SellPoints[i].y +=
        depthChartSingleHopAsset1SellPoints[i - 1].y;
    }
    for (let i = 1; i < depthChartMultiHopAsset1BuyPoints.length; i++) {
      depthChartMultiHopAsset1BuyPoints[i].y +=
        depthChartMultiHopAsset1BuyPoints[i - 1].y;
    }
    for (let i = 1; i < depthChartSingleHopAsset1BuyPoints.length; i++) {
      depthChartSingleHopAsset1BuyPoints[i].y +=
        depthChartSingleHopAsset1BuyPoints[i - 1].y;
    }

    setDepthChartMultiHopAsset1SellPoints(depthChartMultiHopAsset1SellPoints);
    setDepthChartSingleHopAsset1SellPoints(depthChartSingleHopAsset1SellPoints);
    setDepthChartMultiHopAsset1BuyPoints(depthChartMultiHopAsset1BuyPoints);
    setDepthChartSingleHopAsset1BuyPoints(depthChartSingleHopAsset1BuyPoints);

    // print to debug
    console.log(
      "depthChartMultiHopAsset1SellPoints",
      depthChartMultiHopAsset1SellPoints
    );
    console.log(
      "depthChartSingleHopAsset1SellPoints",
      depthChartSingleHopAsset1SellPoints
    );

    console.log(
      "depthChartMultiHopAsset1BuyPoints",
      depthChartMultiHopAsset1BuyPoints
    );
    console.log(
      "depthChartSingleHopAsset1BuyPoints",
      depthChartSingleHopAsset1BuyPoints
    );

    // TODO: these should really be &&s but theres no real market so sometimes they can be 0 (we should also handle this edgecase gracefully)
    if (
      depthChartMultiHopAsset1SellPoints.length > 0 ||
      depthChartSingleHopAsset1SellPoints.length > 0 ||
      depthChartMultiHopAsset1BuyPoints.length > 0 ||
      depthChartSingleHopAsset1BuyPoints.length > 0
    ) {
      setIsChartLoading(false);
    }
  }, [
    simulatedMultiHopAsset1SellData,
    simulatedSingleHopAsset1SellData,
    simulatedMultiHopAsset1BuyData,
    simulatedSingleHopAsset1BuyData,
    asset1Token,
    asset2Token,
  ]);

  return (
    <Layout pageTitle={`Trading View`}>
      {isLoading || isChartLoading ? (
        <Center height="100vh">
          <LoadingSpinner />
        </Center>
      ) : !isChartLoading ? (
        <Center height="100vh">
          <Box className="neon-box" padding={"3em"}>
            <VStack>
              <>
                <Text
                  fontFamily="monospace"
                  paddingBottom={"0em"}
                  fontSize={"md"}
                >{`${asset1Token!.symbol} / ${asset2Token!.symbol}`}</Text>
                {/*
                <Text
                  fontSize={"sm"}
                  fontFamily="monospace"
                  paddingBottom={"1em"}
                >
                  Liquidity
                </Text>
      */}
                {/* Note the reversal of names here since buy and sell side is inverted at this stage (i.e. sell side == buy demand side) */}
                <DepthChart
                  buySideData={depthChartMultiHopAsset1SellPoints}
                  sellSideData={depthChartMultiHopAsset1BuyPoints}
                  buySideSingleHopData={depthChartSingleHopAsset1SellPoints}
                  sellSideSingleHopData={depthChartSingleHopAsset1BuyPoints}
                  asset1Token={asset1Token!}
                  asset2Token={asset2Token!}
                />
              </>
            </VStack>
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
