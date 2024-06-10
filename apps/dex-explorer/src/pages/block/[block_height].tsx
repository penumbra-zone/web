import Layout from "@/components/layout";
import { useRouter } from "next/router";
import {
  Box,
  Text,
  VStack,
  IconButton,
  HStack,
  Avatar,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { BlockDetailedSummaryData } from "@/utils/types/block";
import { BlockInfo, LiquidityPositionEvent } from "@/utils/indexer/types/lps";
import { SwapExecutionWithBlockHeight } from "@/utils/protos/types/DexQueryServiceClientInterface";
import { LoadingSpinner } from "@/components/util/loadingSpinner";
import { testnetConstants } from "@/constants/configConstants";
import { formatTimestampShort } from "@/components/blockTimestamp";
import { AddIcon, MinusIcon } from "@chakra-ui/icons";
import { innerToBech32Address } from "@/utils/math/bech32";
import {
  SwapExecution,
  SwapExecution_Trace,
} from "@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/dex/v1/dex_pb";
import BigNumber from "bignumber.js";
import { fetchAllTokenAssets } from "@/utils/token/tokenFetch";
import { Token } from "@/utils/types/token";
import { fromBaseUnit } from "@/utils/math/hiLo";

export const Price = ({
  trace,
  metadataByAssetId,
}: {
  trace: SwapExecution_Trace;
  metadataByAssetId: Record<string, Token>;
}) => {
  const inputValue = trace.value[0];
  const outputValue = trace.value[trace.value.length - 1];
  let price: string | undefined;

  if (
    inputValue?.amount &&
    outputValue?.amount &&
    inputValue.assetId &&
    outputValue.assetId
  ) {
    const firstValueMetadata =
      metadataByAssetId[inputValue.assetId.inner as unknown as string];
    const lastValueMetadata =
      metadataByAssetId[outputValue.assetId.inner as unknown as string];

    if (firstValueMetadata?.symbol && lastValueMetadata?.symbol) {
      const inputDisplayDenomExponent = firstValueMetadata.decimals ?? 0;
      const outputDisplayDenomExponent = lastValueMetadata.decimals ?? 0;
      const formattedInputAmount = fromBaseUnit(
        BigInt(inputValue.amount?.lo ?? 0),
        BigInt(inputValue.amount?.hi ?? 0),
        inputDisplayDenomExponent
      ).toFixed(6);
      const formattedOutputAmount = fromBaseUnit(
        BigInt(outputValue.amount?.lo ?? 0),
        BigInt(outputValue.amount?.hi ?? 0),
        outputDisplayDenomExponent
      ).toFixed(6);
      const outputToInputRatio = new BigNumber(formattedOutputAmount)
        .dividedBy(formattedInputAmount)
        .toFormat(outputDisplayDenomExponent);

      // Remove trailing zeros
      const outputToInputFormatted = outputToInputRatio.replace(/\.?0+$/, "");

      price = `1 ${firstValueMetadata.symbol} = ${outputToInputFormatted} ${lastValueMetadata.symbol}`;
    }
  }

  if (!price) return null;
  return <span className="text-xs text-muted-foreground">{price}</span>;
};

// Enum for the different types of data boxes
enum DataBoxType {
  OPEN_POSITIONS = "open_positions",
  CLOSE_POSITIONS = "close_positions",
  ARBS = "arbs",
  SWAPS = "swaps",
}

// Trace Type enum
enum TraceType {
  SWAP = DataBoxType.SWAPS,
  ARB = DataBoxType.ARBS,
}

export const Trace = ({
  trace,
  metadataByAssetId,
  type,
}: {
  trace: SwapExecution_Trace;
  metadataByAssetId: Record<string, Token>;
  type: TraceType;
}) => {
  return (
    <Box width="100%" paddingLeft="0%">
      <HStack
        spacing={2}
        align="start"
        justifyContent="space-between"
        padding="2px"
        whiteSpace="nowrap"
        width={"100%"}
        position="relative"
      >
        {/* Background line for trace connections */}
        <Box
          position="absolute"
          top="50%"
          left="0"
          right="0"
          height="2px"
          backgroundColor="var(--charcoal-tertiary-bright)"
          zIndex="0"
          width="100%"
        />
        {trace.value.map((value, index) => {
          const metadata =
            metadataByAssetId[value.assetId?.inner as unknown as string];
          const displayDenomExponent = metadata?.decimals ?? 0;
          const formattedAmount = fromBaseUnit(
            BigInt(value.amount?.lo ?? 0),
            BigInt(value.amount?.hi ?? 0),
            displayDenomExponent
          ).toFixed(2);
          return (
            <HStack key={index} align="left" zIndex={1}>
              <Box>
                <HStack
                  outline={"2px solid var(--charcoal-tertiary-blended)"}
                  padding="8px"
                  borderRadius={"30px"}
                  backgroundColor="var(--charcoal-tertiary)"
                >
                  {metadata?.imagePath ? (
                    <Avatar src={metadata.imagePath} size={"xs"} />
                  ) : (
                    <Avatar size={"xs"} />
                  )}
                  <Text fontSize={"small"} fontFamily={"monospace"}>
                    {formattedAmount} {metadata?.symbol}
                  </Text>
                </HStack>
              </Box>
            </HStack>
          );
        })}
      </HStack>
      {type !== TraceType.ARB && (
        <Price trace={trace} metadataByAssetId={metadataByAssetId} />
      )}
    </Box>
  );
};

const formatTimestampOrDefault = (timestamp: any) => {
  if (timestamp === undefined || timestamp === "") {
    return "Missing data in indexer to display timestamp";
  }
  return formatTimestampShort(timestamp);
};

export const ArbSummary = ({
  swapExecution,
  metadataByAssetId,
  index,
  isExpanded,
  toggleExpand,
}: {
  swapExecution: SwapExecution;
  metadataByAssetId: Record<string, Token>;
  index: number;
  isExpanded: boolean;
  toggleExpand: (index: number) => void;
}) => {
  const arbPerAsset: Record<string, number> = {};
  const tracesPerAsset: Record<string, number> = {};

  swapExecution.traces.forEach((trace: SwapExecution_Trace) => {
    const firstTrace = trace.value[0];
    const lastTrace = trace.value[trace.value.length - 1];
    if (!firstTrace.assetId?.inner != !lastTrace.assetId?.inner) {
      console.error("First and last trace asset id must be equal");
      return;
    }

    const assetId = firstTrace.assetId?.inner as unknown as string;
    const displayDenomExponent = metadataByAssetId[assetId]?.decimals ?? 0;

    const formattedInputAmount = fromBaseUnit(
      BigInt(firstTrace.amount?.lo ?? 0),
      BigInt(firstTrace.amount?.hi ?? 0),
      displayDenomExponent
    ).toNumber();

    const formattedOutputAmount = fromBaseUnit(
      BigInt(lastTrace.amount?.lo ?? 0),
      BigInt(lastTrace.amount?.hi ?? 0),
      displayDenomExponent
    ).toNumber();

    if (tracesPerAsset[assetId]) {
      tracesPerAsset[assetId] += 1;
    } else {
      tracesPerAsset[assetId] = 1;
    }

    const arbedAmount = formattedOutputAmount - formattedInputAmount;

    if (arbPerAsset[assetId]) {
      arbPerAsset[assetId] += arbedAmount;
    } else {
      arbPerAsset[assetId] = arbedAmount;
    }
  });

  return (
    <Box overflowX="auto" width="100%" textAlign={"left"}>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        {Object.entries(arbPerAsset).map(([assetId, amount]) => {
          const metadata = metadataByAssetId[assetId];
          return (
            <HStack key={assetId} align="left">
              <Box>
                <HStack padding="8px" borderRadius={"30px"}>
                  {metadata?.imagePath ? (
                    <Avatar src={metadata.imagePath} size={"xs"} />
                  ) : (
                    <Avatar size={"xs"} />
                  )}
                  <Text fontSize={"md"} fontFamily={"monospace"}>
                    {amount.toFixed(6)} {metadata?.symbol} in{" "}
                    {tracesPerAsset[assetId]} routes
                  </Text>
                </HStack>
              </Box>
            </HStack>
          );
        })}
        <IconButton
          onClick={() => toggleExpand(index)}
          icon={isExpanded ? <MinusIcon /> : <AddIcon />}
          size="xs"
          aria-label="Expand/Collapse"
          colorScheme="purple"
        />
      </Box>
      {isExpanded && (
        <Box overflowX="auto" width="100%">
          <VStack
            spacing={2}
            align="left"
            justifyContent="left"
            paddingTop="10px"
            width={"100%"}
          >
            {swapExecution.traces.map(
              (trace: SwapExecution_Trace, traceIndex: number) => (
                <Trace
                  key={traceIndex}
                  trace={trace}
                  metadataByAssetId={metadataByAssetId}
                  type={TraceType.ARB}
                />
              )
            )}
          </VStack>
        </Box>
      )}
    </Box>
  );
};

export default function Block() {
  const router = useRouter();
  const { block_height } = router.query as { block_height: string };
  console.log(router);
  console.log(router.query);

  const [isLoading, setIsLoading] = useState(true);
  const [blockHeight, setBlockHeight] = useState(-1);
  const [blockData, setBlockData] = useState<BlockDetailedSummaryData>();
  const [error, setError] = useState<string | undefined>(undefined);
  const [expandedArbs, setExpandedArbs] = useState<Record<number, boolean>>({});

  const toggleArbExpand = (index: number) => {
    setExpandedArbs((prevState) => ({
      ...prevState,
      [index]: !prevState[index],
    }));
  };

  // Get detailed block data
  useEffect(() => {
    setIsLoading(true);
    if (block_height && blockHeight <= 0) {
      console.log("Fetching data for block...", block_height);
      const height: number = parseInt(block_height);
      const blockInfoPromise: Promise<BlockInfo[]> = fetch(
        `/api/blocks/${height}/${height + 1}`
      ).then((res) => res.json());
      const liquidityPositionOpenClosePromise: Promise<
        LiquidityPositionEvent[]
      > = fetch(`/api/lp/block/${height}/${height + 1}`).then((res) =>
        res.json()
      );
      const liquidityPositionOtherExecutions: Promise<
        LiquidityPositionEvent[]
      > = fetch(`/api/lp/block/${height}`).then((res) => res.json());
      const arbsPromise: Promise<SwapExecutionWithBlockHeight[]> = fetch(
        `/api/arbs/${height}/${height + 1}`
      ).then((res) => res.json());
      const swapsPromise: Promise<SwapExecutionWithBlockHeight[]> = fetch(
        `/api/swaps/${height}/${height + 1}`
      ).then((res) => res.json());

      Promise.all([
        blockInfoPromise,
        liquidityPositionOpenClosePromise,
        liquidityPositionOtherExecutions,
        arbsPromise,
        swapsPromise,
      ])
        .then(
          ([
            blockInfoResponse,
            liquidityPositionOpenCloseResponse,
            liquidityPositionOtherResponse,
            arbsResponse,
            swapsResponse,
          ]) => {
            const blockInfoList: BlockInfo[] = blockInfoResponse as BlockInfo[];
            const positionData: LiquidityPositionEvent[] =
              liquidityPositionOpenCloseResponse as LiquidityPositionEvent[];
            const otherPositionData: LiquidityPositionEvent[] =
              liquidityPositionOtherResponse as LiquidityPositionEvent[];
            const arbData: SwapExecutionWithBlockHeight[] =
              arbsResponse as SwapExecutionWithBlockHeight[];
            const swapData: SwapExecutionWithBlockHeight[] =
              swapsResponse as SwapExecutionWithBlockHeight[];

            if (blockInfoList.length === 0) {
              //setError(`No data for block ${block_height} found`);
              //setIsLoading(false);
              console.log(`No data for block ${block_height} found`);
              blockInfoList.push({
                height: height,
                created_at: "",
              });
            }
            console.log("Fetching data for block...");

            const detailedBlockSummaryData: BlockDetailedSummaryData = {
              openPositionEvents: [],
              closePositionEvents: [],
              withdrawPositionEvents: [],
              otherPositionEvents: [],
              swapExecutions: [],
              arbExecutions: [],
              createdAt: blockInfoList[0]["created_at"],
            };
            positionData.forEach(
              (positionOpenCloseEvent: LiquidityPositionEvent) => {
                if (positionOpenCloseEvent["type"].includes("PositionOpen")) {
                  detailedBlockSummaryData["openPositionEvents"].push(
                    positionOpenCloseEvent
                  );
                } else if (
                  positionOpenCloseEvent["type"].includes("PositionClose")
                ) {
                  detailedBlockSummaryData["closePositionEvents"].push(
                    positionOpenCloseEvent
                  );
                } else if (
                  positionOpenCloseEvent["type"].includes("PositionWithdraw")
                ) {
                  detailedBlockSummaryData["withdrawPositionEvents"].push(
                    positionOpenCloseEvent
                  );
                }
              }
            );
            otherPositionData.forEach(
              (positionEvent: LiquidityPositionEvent) => {
                detailedBlockSummaryData["otherPositionEvents"].push(
                  positionEvent
                );
              }
            );
            arbData.forEach((arb: SwapExecutionWithBlockHeight) => {
              detailedBlockSummaryData["arbExecutions"].push(arb.swapExecution);
            });
            swapData.forEach((swap: SwapExecutionWithBlockHeight) => {
              detailedBlockSummaryData["swapExecutions"].push(
                swap.swapExecution
              );
            });
            setBlockData(detailedBlockSummaryData);
            setBlockHeight(height);
          }
        )
        .catch((error) => {
          console.error("Error fetching block summary data:", error);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
      if (block_height === undefined) {
        // The router query is not yet available
        setIsLoading(true);
      }
    }
  }, [block_height, blockHeight]);

  const DataBox = ({
    title,
    dataLength,
    type,
  }: {
    title: string;
    dataLength: number;
    type: DataBoxType;
  }) => {
    // ! Expand default
    const [isExpanded, setIsExpanded] = useState(false); // EXPAND
    const tokenAssets = fetchAllTokenAssets();
    const metadataByAssetId: Record<string, Token> = {};
    tokenAssets.forEach((asset) => {
      metadataByAssetId[asset.inner] = {
        symbol: asset.symbol,
        display: asset.display,
        decimals: asset.decimals,
        inner: asset.inner,
        imagePath: asset.imagePath,
      };
    });

    const toggleExpand = () => {
      setIsExpanded(!isExpanded);
    };

    return (
      <Box
        className="neon-box"
        position="relative"
        padding="2%"
        paddingTop="2%"
        paddingBottom="2%"
        paddingLeft="5%"
        paddingRight="5%"
        width="50%"
      >
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Text>
            {title}: {dataLength}
          </Text>
        </Box>
        {dataLength > 0 && (
          <IconButton
            onClick={toggleExpand}
            icon={isExpanded ? <MinusIcon /> : <AddIcon />}
            size="xs"
            aria-label="Expand/Collapse"
            position="absolute"
            top="10px"
            right="10px"
            colorScheme="purple"
          />
        )}
        {isExpanded && dataLength > 0 && (
          <Box marginTop="10px" width={"100%"}>
            {type === DataBoxType.OPEN_POSITIONS ? (
              <VStack
                fontSize={"small"}
                fontFamily={"monospace"}
                spacing={"10px"}
                paddingTop={"10px"}
              >
                {blockData!.openPositionEvents.map((positionEvent) => (
                  <a
                    key={positionEvent.lpevent_attributes.positionId.inner}
                    href={`/lp/${innerToBech32Address(
                      positionEvent.lpevent_attributes.positionId.inner,
                      "plpid"
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Text>
                      {innerToBech32Address(
                        positionEvent.lpevent_attributes.positionId.inner,
                        "plpid"
                      )}
                    </Text>
                  </a>
                ))}
              </VStack>
            ) : type === DataBoxType.CLOSE_POSITIONS ? (
              <VStack
                fontSize={"small"}
                fontFamily={"monospace"}
                spacing={"10px"}
                paddingTop={"10px"}
                width={"100%"}
              >
                {blockData!.closePositionEvents.map((positionEvent) => (
                  <a
                    key={positionEvent.lpevent_attributes.positionId.inner}
                    href={`/lp/${innerToBech32Address(
                      positionEvent.lpevent_attributes.positionId.inner,
                      "plpid"
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Text>
                      {innerToBech32Address(
                        positionEvent.lpevent_attributes.positionId.inner,
                        "plpid"
                      )}
                    </Text>
                  </a>
                ))}
              </VStack>
            ) : type === DataBoxType.ARBS ? (
              <VStack
                fontSize={"small"}
                fontFamily={"monospace"}
                spacing={"10px"}
                paddingTop={"10px"}
                width={"100%"}
              >
                {blockData!.arbExecutions.map(
                  (swapExecution: SwapExecution, index: number) => (
                    <ArbSummary
                      key={index}
                      swapExecution={swapExecution}
                      metadataByAssetId={metadataByAssetId}
                      index={index}
                      isExpanded={!!expandedArbs[index]}
                      toggleExpand={toggleArbExpand}
                    />
                  )
                )}
              </VStack>
            ) : type === DataBoxType.SWAPS ? (
              <VStack
                fontSize={"small"}
                fontFamily={"monospace"}
                spacing={"10px"}
                paddingTop={"10px"}
                width={"100%"}
              >
                {blockData!.swapExecutions.map(
                  (swapExecution: SwapExecution) => (
                    <>
                      <Box overflowX="auto" width="100%">
                        <VStack
                          spacing={2}
                          align="left"
                          justifyContent="left"
                          paddingTop="10px"
                          width={"100%"}
                        >
                          {swapExecution.traces.map(
                            (trace: SwapExecution_Trace, index: number) => (
                              <>
                                <Trace
                                  key={index}
                                  trace={trace}
                                  metadataByAssetId={metadataByAssetId}
                                  type={TraceType.SWAP}
                                />
                                <Box paddingTop="3px" />
                              </>
                            )
                          )}
                        </VStack>
                      </Box>
                    </>
                  )
                )}
              </VStack>
            ) : (
              <Text>Unimplemented type: {type}</Text>
            )}
          </Box>
        )}
      </Box>
    );
  };

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
          paddingBottom="5px"
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
            <Text
              fontWeight={"bold"}
              width={"100%"}
              fontSize={"xs"}
              textAlign={"center"}
              textColor="var(--charcoal-tertiary-bright)"
            >
              {formatTimestampOrDefault(blockData?.createdAt)}
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
          <VStack
            paddingTop="40px"
            width={"100%"}
            spacing={"60px"}
            fontSize={"large"}
            fontFamily={"monospace"}
            alignContent={"center"}
            textAlign={"center"}
          >
            <DataBox
              title="Positions Opened"
              dataLength={blockData!.openPositionEvents.length}
              type={DataBoxType.OPEN_POSITIONS}
            />
            <DataBox
              title="Arbs"
              dataLength={blockData!.arbExecutions.length}
              type={DataBoxType.ARBS}
            />
            <DataBox
              title="Batch Swaps"
              dataLength={blockData!.swapExecutions.length}
              type={DataBoxType.SWAPS}
            />
            <DataBox
              title="Positions Closed"
              dataLength={blockData!.closePositionEvents.length}
              type={DataBoxType.CLOSE_POSITIONS}
            />
          </VStack>
        </>
      )}
    </Layout>
  );
}
