// pages/lp/[lp_nft_id].js

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import styles from "../../../styles/Home.module.css";
import { LiquidityPositionQuerier } from "../../utils/protos/services/dex/liquidity-positions";
import { testnetConstants } from "../../constants/configConstants";
import {
  PositionId,
  Position,
} from "@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/dex/v1/dex_pb";
import Layout from "../../components/layout";
import CurrentLPStatus from "../../components/liquidityPositions/currentStatus";
import OpenPositionStatus from "../../components/liquidityPositions/openStatus";
import { VStack, Text, Spinner, Center, Box, HStack } from "@chakra-ui/react";
import { LoadingSpinner } from "../../components/util/loadingSpinner";
import {
  LiquidityPositionEvent,
  PositionExecutionEvent,
} from "@/utils/indexer/types/lps";

export default function LP() {
  const router = useRouter();
  const { lp_nft_id } = router.query as { lp_nft_id: string };
  const [liquidityPosition, setLiquidityPosition] = useState<Position | null>(
    null
  );
  const [LPData, setLPData] = useState<LiquidityPositionEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (lp_nft_id) {
      setIsLoading(true);

      try {
        const lp_querier = new LiquidityPositionQuerier({
          grpcEndpoint: testnetConstants.grpcEndpoint,
        });

        const positionId = new PositionId({
          altBech32m: lp_nft_id,
        });

        lp_querier
          .liquidityPositionById(positionId)
          .then((res) => {
            if (!res) {
              console.error("Error fetching liquidity position: no response");
              return;
            }

            setLiquidityPosition(res);
          })
          .catch((error) => {
            console.error("Error fetching liquidity position:", error);
          });

        // Fetch liquidity position events
        fetch(`/api/lp/${lp_nft_id}`)
          .then((res) => res.json())
          .then((data) => {
            if (!data) {
              console.error(
                "Error fetching liquidity position events: no response"
              );
              return;
            }
            setLPData(data as LiquidityPositionEvent[]);
          })
          .catch((error) => {
            console.error("Error fetching liquidity position events:", error);
          });
      } catch (error) {
        console.error("Error fetching liquidity position:", error);
      } finally {
        setIsLoading(false);
      }
    }
  }, [lp_nft_id]); // Runs when lp_nft_id changes, important as this isnt always grabbed immediately on page load.

  const [tradeTimelineData, setTradeTimelineData] = useState<any[]>([]);

  useEffect(() => {
    // TODO: Fetch timeline trade data from indexer
    setTradeTimelineData(
      Array.from({ length: 3 }, (_, i) => ({
        event_id: i + 1000,
      }))
    );
  }, [lp_nft_id]);

  // Note: Needs to be ordered by event id
  const [timelineData, setTimelineData] = useState<
    (LiquidityPositionEvent | PositionExecutionEvent)[]
  >([]);
  useEffect(() => {
    // Return if no data
    if (LPData.length === 0) {
      return;
    }

    // Create large list of all events ordered by event_id
    const allEvents = LPData.concat(tradeTimelineData);

    // Sort by event_id (descending order)
    allEvents.sort((a, b) => {
      return b.event_id - a.event_id;
    });

    setTimelineData(allEvents);
  }, [LPData, tradeTimelineData]);

  const currentStatusRef = useRef<HTMLDivElement>(null);
  const originalStatusRef = useRef<HTMLDivElement>(null);
  const [lineHeight, setLineHeight] = useState(0);
  const [lineTop, setLineTop] = useState(0);

  useEffect(() => {
    if (currentStatusRef.current && originalStatusRef.current) {
      const firstBoxRect = currentStatusRef.current.getBoundingClientRect();
      const lastBoxRect = originalStatusRef.current.getBoundingClientRect();
      const height = lastBoxRect.top - firstBoxRect.bottom;
      const top = firstBoxRect.top;

      setLineHeight(height + 100);
      setLineTop(top + firstBoxRect.bottom + 50);
    }
  }, [timelineData, tradeTimelineData, LPData, liquidityPosition]);

  return (
    <Layout pageTitle={`LP - ${lp_nft_id}`}>
      <main className={styles.main}>
        {isLoading || !timelineData.length ? (
          <LoadingSpinner />
        ) : liquidityPosition ? (
          <>
            <Box
              position="relative" // Ensure this Box is the positioning context for the vertical line
              display="flex"
              flexDirection="column"
              alignItems="center"
              width="100%"
            >
              <VStack spacing="5em" width="full" maxW="container.md" px={4}>
                <VStack align="stretch" paddingTop={"3em"}>
                  <VStack align="stretch">
                    <Text
                      fontWeight={"bold"}
                      width={"100%"}
                      alignContent={"left"}
                      fontSize={"1.5em"}
                      paddingBottom=".5em"
                      alignSelf="flex-start"
                    >
                      Position Status
                    </Text>
                    <Box ref={currentStatusRef}>
                      <CurrentLPStatus
                        nftId={lp_nft_id}
                        position={liquidityPosition}
                      />
                    </Box>
                  </VStack>
                  <Text
                    fontWeight={"bold"}
                    width={"100%"}
                    alignContent={"left"}
                    fontSize={"1.5em"}
                    paddingBottom=".5em"
                    alignSelf="flex-start"
                    paddingTop="2em"
                  >
                    Timeline
                  </Text>
                  {timelineData.map((dataItem, index) => (
                    <>
                      {"lpevent_attributes" in dataItem ? (
                        // ! User/LP Events
                        <VStack
                          align={"flex-start"}
                          paddingTop={index === 0 ? "0" : "3em"}
                        >
                          <VStack key={index}>
                            <Box
                              key={index}
                              className="neon-box"
                              width={"20em"}
                              height={"5em"}
                              padding="2em"
                            >
                              <Text textAlign={"center"}>
                                LP Event {dataItem.event_id}
                              </Text>
                            </Box>
                          </VStack>
                        </VStack>
                      ) : (
                        //! Trade Events
                        <VStack
                          align={"flex-end"}
                          paddingTop={index === 0 ? "0" : "3em"}
                        >
                          <VStack key={index}>
                            <Box
                              key={index}
                              className="neon-box"
                              width={"20em"}
                              height={"5em"}
                              padding="2em"
                            >
                              <Text textAlign={"center"}>
                                Example Trade {dataItem.event_id}
                              </Text>
                            </Box>
                          </VStack>
                        </VStack>
                      )}
                    </>
                  ))}

                  {/*
                  <VStack align={"flex-end"}>
                    {tradeTimelineData.map((dataItem, index) => (
                      <VStack
                        key={index}
                        paddingTop={index === 0 ? "0" : "3em"}
                      >
                        <Box
                          key={index}
                          className="neon-box"
                          width={"20em"}
                          height={"5em"}
                          padding="2em"
                        >
                          <Text textAlign={"center"}>
                            Example Trade {index}
                          </Text>
                        </Box>
                      </VStack>
                    ))}
                  </VStack>
        */}
                  <Box
                    
                    paddingTop={"2em"}
                    paddingBottom={"5em"}
                    ref={originalStatusRef}
                  >
                    <OpenPositionStatus nftId={lp_nft_id} />
                  </Box>
                </VStack>
              </VStack>
            </Box>
            <Box
              position="absolute"
              zIndex={-999}
              left="50%"
              top={`${lineTop}`}
              height={`${lineHeight}`}
              width={".1em"}
              className="neon-box"
              backgroundColor="var(--complimentary-background)"
              id="vertical-line"
            />
            <Text>
              {/*LPData.map((event, index) => (
                <p key={index}>{JSON.stringify(event)}</p>
              ))*/}
            </Text>
          </>
        ) : (
          <VStack height={"100%"} width={"100%"}>
            <Text paddingTop={"20%"}>Liquidity position not found.</Text>
          </VStack>
        )}
      </main>
    </Layout>
  );
}
