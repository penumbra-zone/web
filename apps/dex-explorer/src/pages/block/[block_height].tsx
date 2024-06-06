import Layout from "@/components/layout";
import { useRouter } from "next/router";
import { Box, Link, Text, VStack } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { BlockDetailedSummaryData } from "@/utils/types/block";
import { BlockInfo, LiquidityPositionEvent } from "@/utils/indexer/types/lps";
import { SwapExecutionWithBlockHeight } from "@/utils/protos/types/DexQueryServiceClientInterface";
import { LoadingSpinner } from "@/components/util/loadingSpinner";
import { testnetConstants } from "@/constants/configConstants";


export default function Block() {

    const router = useRouter();
    const { block_height } = router.query as { block_height: string };

    const [isLoading, setIsLoading] = useState(true);
    const [blockHeight, setBlockHeight] = useState(-1);
    const [blockData, setBlockData] = useState<BlockDetailedSummaryData>();
    const [error, setError] = useState<string | undefined>(undefined);

    // Get detailed block data
    useEffect(() => {
        setIsLoading(true)
        if (block_height && blockHeight <= 0) {
            const height: number = parseInt(block_height)
            const blockInfoPromise : Promise<BlockInfo[]> = fetch(`/api/blocks/${height}/${height + 1}`).then((res) => res.json());
            const liquidityPositionOpenClosePromise: Promise<LiquidityPositionEvent[]> = fetch(`/api/lp/block/${height}/${height + 1}`).then((res) => res.json());
            const liquidityPositionOtherExecutions: Promise<LiquidityPositionEvent[]> = fetch(`/api/lp/block/${height}`).then((res) => res.json());
            const arbsPromise: Promise<SwapExecutionWithBlockHeight[]> = fetch(`/api/arbs/${height}/${height + 1}`).then((res) => res.json());
            const swapsPromise: Promise<SwapExecutionWithBlockHeight[]> = fetch(`/api/swaps/${height}/${height + 1}`).then((res) => res.json());

            Promise.all([blockInfoPromise, liquidityPositionOpenClosePromise, liquidityPositionOtherExecutions, arbsPromise, swapsPromise])
              .then(([blockInfoResponse, liquidityPositionOpenCloseResponse, liquidityPositionOtherResponse, arbsResponse, swapsResponse]) => {
                const blockInfoList: BlockInfo[] = blockInfoResponse as BlockInfo[];
                const positionData: LiquidityPositionEvent[] = liquidityPositionOpenCloseResponse as LiquidityPositionEvent[];
                const otherPositionData: LiquidityPositionEvent[] = liquidityPositionOtherResponse as LiquidityPositionEvent[];
                const arbData: SwapExecutionWithBlockHeight[] = arbsResponse as SwapExecutionWithBlockHeight[];
                const swapData: SwapExecutionWithBlockHeight[] = swapsResponse as SwapExecutionWithBlockHeight[];

                if (blockInfoList.length === 0) {
                    setError(`No data for block ${block_height} found`);
                    setIsLoading(false)
                    console.log(`No data for block ${block_height} found`);
                    return;
                }
                console.log("Fetching data for block...");

                const detailedBlockSummaryData : BlockDetailedSummaryData = {
                    openPositionEvents: [],
                    closePositionEvents: [],
                    withdrawPositionEvents: [],
                    otherPositionEvents: [],
                    swapExecutions: [],
                    arbExecutions: [],
                    createdAt: blockInfoList[0]['created_at']
                };
                positionData.forEach((positionOpenCloseEvent: LiquidityPositionEvent) => {
                    if (positionOpenCloseEvent['type'].includes('PositionOpen')) {
                        detailedBlockSummaryData['openPositionEvents'].push(positionOpenCloseEvent)
                    } else if (positionOpenCloseEvent['type'].includes('PositionClose')) {
                        detailedBlockSummaryData['closePositionEvents'].push(positionOpenCloseEvent)
                    } else if (positionOpenCloseEvent['type'].includes('PositionWithdraw')) {
                        detailedBlockSummaryData['withdrawPositionEvents'].push(positionOpenCloseEvent)
                    }
                });
                otherPositionData.forEach((positionEvent: LiquidityPositionEvent) => {
                    detailedBlockSummaryData['otherPositionEvents'].push(positionEvent)
                });
                arbData.forEach((arb: SwapExecutionWithBlockHeight) => {
                    detailedBlockSummaryData['arbExecutions'].push(arb.swapExecution);
                });
                swapData.forEach((swap: SwapExecutionWithBlockHeight) => {
                    detailedBlockSummaryData['swapExecutions'].push(swap.swapExecution);
                });
                setBlockData(detailedBlockSummaryData)
                setBlockHeight(height);
              })
              .catch((error) => {
                console.error("Error fetching block summary data:", error);
              })
              .finally(() => {
                setIsLoading(false);
              });
        } else {
            setIsLoading(false)
        }
    }, [block_height, blockHeight])

    return (
      <Layout pageTitle={`Block - ${blockHeight}`}>
        {isLoading ? (
          <LoadingSpinner />
        ) : error ? (
          <Box
            position="relative"
            display="flex"
            flexDirection="column"
            width="100%"
            height="100%"
            paddingTop="20%"
            justifyContent={"center"}
            alignItems={"center"}
          >
            <Text>{error}</Text>
          </Box>
        ) : (
          <>
            <VStack paddingTop={"5em"}>
              <Text
                fontWeight={"bold"}
                width={"100%"}
                fontSize={"1.5em"}
                textAlign={"center"}
              >
                {"Block " + blockHeight}
              </Text>
              <Text>
                <a
                  href={testnetConstants.cuiloaUrl + "/block/" + blockHeight}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    textDecoration: "underline",
                    color: "var(--charcoal-tertiary-bright)",
                    display: "flex",
                    fontSize: "small",
                    fontFamily: "monospace",
                  }}
                >
                  See more block specific details in Cuiloa
                </a>
              </Text>
            </VStack>
          </>
        )}
      </Layout>
    );

}