// copied from pages/trades.tsx
/* eslint-disable -- disabling this file as this was created before our strict rules */

import {
  Text,
  Box,
  FormLabel,
  NumberInput,
  FormControl,
  NumberInputField,
} from "@chakra-ui/react";
import { LoadingSpinner } from "@/old/components/util/loadingSpinner";
import { useEffect, useRef, useState } from "react";
import { BlockSummary } from "@/old/components/executionHistory/blockSummary";
import { BlockInfo, LiquidityPositionEvent } from "@/old/utils/indexer/types/lps";
import { SwapExecutionWithBlockHeight } from "@/old/utils/protos/types/DexQueryServiceClientInterface";
import { BlockInfoMap, BlockSummaryData, BlockSummaryMap } from "@/old/utils/types/block";

export default function Blocks() {
  // Go back hardcoded N blocks
  const NUMBER_BLOCKS_IN_TIMELINE = 50;

  const [isBlockRangeLoading, setIsBlockRangeLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  const [startingBlockHeight, setStartingBlockHeight] = useState(-1); // negative number meaning not set yet
  const [endingBlockHeight, setEndingBlockHeight] = useState(-1); // negative number meaning not set yet
  const [blockInfo, setBlockInfo] = useState<BlockInfoMap>({});
  const [blockData, setBlockData] = useState<BlockSummaryMap>({});
  const [userRequestedBlockEndHeight, setUserRequestedBlockEndHeight] =
    useState(-1);

  const currentStatusRef = useRef<HTMLDivElement>(null);
  const originalStatusRef = useRef<HTMLDivElement>(null);
  const [, setLineHeight] = useState(0);
  const [, setLineTop] = useState(0);
  const [error, setError] = useState<string | undefined>(undefined);

  // Get starting block number
  useEffect(() => {
    setIsBlockRangeLoading(true);
    if (endingBlockHeight <= 0 || startingBlockHeight <= 0) {
      let blockInfoPromise: Promise<BlockInfo[]>;
      if (userRequestedBlockEndHeight >= 1) {
        const startHeight = Math.max(
          userRequestedBlockEndHeight - NUMBER_BLOCKS_IN_TIMELINE + 1,
          1,
        ); // Lowest block_height is 1
        blockInfoPromise = fetch(
          `/api/blocks/${startHeight}/${userRequestedBlockEndHeight + 1}`,
        ).then((res) => res.json()) as Promise<BlockInfo[]>;
      } else {
        blockInfoPromise = fetch(
          `/api/blocks/${NUMBER_BLOCKS_IN_TIMELINE}`,
        ).then((res) => res.json()) as Promise<BlockInfo[]>;
      }
      Promise.all([blockInfoPromise])
        .then(([blockInfoResponse]) => {
          const blockInfoList: BlockInfo[] = blockInfoResponse;
          const blockInfoMap: BlockInfoMap = {};
          blockInfoList.forEach((blockInfo: BlockInfo) => {
            // console.log(blockInfo)
            blockInfoMap[blockInfo.height] = blockInfo;
          });

          if (blockInfoList.length === 0) {
            setIsLoading(false);
            setError(`No blocks found before: ${userRequestedBlockEndHeight}`);

            // eslint-disable-next-line no-console -- logging for debugging
            console.log("No blocks found");
            return;
          } else {
            setEndingBlockHeight((blockInfoList[0] as BlockInfo).height);
            setStartingBlockHeight(
              (blockInfoList[NUMBER_BLOCKS_IN_TIMELINE - 1] as BlockInfo).height,
            );
            setBlockInfo(blockInfoMap);
            setError(undefined);
          }
        })
        .catch((error) => {
          console.error("Error fetching most recent blocks:", error);
        })
        .finally(() => {
          setIsBlockRangeLoading(false);
        });
    }
  }, [userRequestedBlockEndHeight, endingBlockHeight, startingBlockHeight]);

  // Load block dex data from grpc/indexer
  useEffect(() => {
    if (error !== undefined) {
      return;
    }
    console.log("Loading block data");
    setIsLoading(true);
    if (blockInfo && endingBlockHeight >= 1 && startingBlockHeight >= 1) {
      const liquidityPositionOpenClosePromise = fetch(
        `/api/lp/block/${startingBlockHeight}/${endingBlockHeight + 1}`,
      ).then((res) => res.json());
      const arbsPromise = fetch(
        `/api/arbs/${startingBlockHeight}/${endingBlockHeight + 1}`,
      ).then((res) => res.json());
      const swapsPromise = fetch(
        `/api/swaps/${startingBlockHeight}/${endingBlockHeight + 1}`,
      ).then((res) => res.json());

      Promise.all([
        liquidityPositionOpenClosePromise,
        arbsPromise,
        swapsPromise,
      ])
        .then(
          ([
            liquidityPositionOpenCloseResponse,
            arbsResponse,
            swapsResponse,
          ]) => {
            const positionData: LiquidityPositionEvent[] =
              liquidityPositionOpenCloseResponse as LiquidityPositionEvent[];
            const arbData: SwapExecutionWithBlockHeight[] =
              arbsResponse as SwapExecutionWithBlockHeight[];
            const swapData: SwapExecutionWithBlockHeight[] =
              swapsResponse as SwapExecutionWithBlockHeight[];

            // Initialize blocks
            const blockSummaryMap: BlockSummaryMap = {};
            let i: number;
            for (i = startingBlockHeight; i <= endingBlockHeight; i++) {
              blockSummaryMap[i] = {
                openPositionEvents: [],
                closePositionEvents: [],
                withdrawPositionEvents: [],
                swapExecutions: [],
                arbExecutions: [],
                createdAt: (blockInfo[i] as BlockInfo).created_at,
              };
            }

            positionData.forEach(
              (positionOpenCloseEvent: LiquidityPositionEvent) => {
                const blockSummary = blockSummaryMap[positionOpenCloseEvent.block_height] as BlockSummaryData;
                if (positionOpenCloseEvent.type.includes("PositionOpen")) {
                  blockSummary.openPositionEvents.push(positionOpenCloseEvent);
                } else if (
                  positionOpenCloseEvent.type.includes("PositionClose")
                ) {
                  blockSummary.closePositionEvents.push(positionOpenCloseEvent);
                } else if (
                  positionOpenCloseEvent.type.includes("PositionWithdraw")
                ) {
                  blockSummary.withdrawPositionEvents.push(positionOpenCloseEvent);
                }
              },
            );

            arbData.forEach((arb: SwapExecutionWithBlockHeight) => {
              const blockSummary = blockSummaryMap[arb.blockHeight] as BlockSummaryData;
              blockSummary.arbExecutions.push(
                arb.swapExecution,
              );
            });

            swapData.forEach((swap: SwapExecutionWithBlockHeight) => {
              const blockSummary = blockSummaryMap[swap.blockHeight] as BlockSummaryData;
              blockSummary.swapExecutions.push(
                swap.swapExecution,
              );
            });

            setBlockData(blockSummaryMap);
          },
        )
        .catch((error) => {
          console.error("Error fetching block summary data:", error);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [
    isBlockRangeLoading,
    blockInfo,
    startingBlockHeight,
    endingBlockHeight,
    error,
  ]);

  // Draw vertical line
  useEffect(() => {
    if (currentStatusRef.current && originalStatusRef.current) {
      const firstBoxRect = currentStatusRef.current.getBoundingClientRect();
      const lastBoxRect = originalStatusRef.current.getBoundingClientRect();

      // Calculate the new height of the line to stretch from the bottom of the first box to the top of the last box.
      const newLineHeight = lastBoxRect.top - firstBoxRect.top;
      setLineHeight(newLineHeight - 50);
      setLineTop(firstBoxRect.bottom);
    }
  }, []);

  const onSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (
      userRequestedBlockEndHeight >= 1 &&
      endingBlockHeight !== userRequestedBlockEndHeight
    ) {
      setEndingBlockHeight(userRequestedBlockEndHeight);
      setStartingBlockHeight(-1); // trigger update
      setIsBlockRangeLoading(true);
      setIsLoading(true);
    }
  };

  return isLoading ? (
    <LoadingSpinner />
  ) : error ? (
    <Box
      position="relative"
      display="flex"
      flexDirection="column"
      width="100%"
      height="100%"
      paddingTop="20%"
    >
      <Text>{error}</Text>
    </Box>
  ) : (
    <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        width="100%"
      >
        <FormControl width="100%" mb={8}>
          <FormLabel></FormLabel>
          <form
            onSubmit={onSearch}
            style={{ width: "100%", textAlign: "center" }}
          >
            <NumberInput>
              <NumberInputField
                placeholder="Enter block height"
                value={userRequestedBlockEndHeight}
                justifyContent={"center"}
                backgroundColor="rgba(0,0,0,1)"
                // backgroundColor="var(--body-background)"
                onChange={(e) =>
                  setUserRequestedBlockEndHeight(parseInt(e.target.value))
                }
                width="100%"
                p={5}
                border="none"
              />
            </NumberInput>
          </form>
        </FormControl>

        {Array.from(Array(endingBlockHeight - startingBlockHeight + 1)).map(
          (_, index: number) => (
            <BlockSummary
              key={index}
              blockHeight={endingBlockHeight - index}
              blockSummary={blockData[endingBlockHeight - index] as BlockSummaryData}
            />
          )
        )}
      </Box>
  );
}
