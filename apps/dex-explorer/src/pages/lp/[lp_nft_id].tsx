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
import OriginalLPStatus from "../../components/liquidityPositions/originalStatus";
import { VStack, Text, Spinner, Center, Box, HStack } from "@chakra-ui/react";
import { LoadingSpinner } from "../../components/util/loadingSpinner";

export default function LP() {
  const router = useRouter();
  const { lp_nft_id } = router.query as { lp_nft_id: string };
  const [liquidityPosition, setLiquidityPosition] = useState<Position | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (lp_nft_id) {
      setIsLoading(true);
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
            setIsLoading(false);
            return;
          }

          setLiquidityPosition(res);
          setIsLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching liquidity position:", error);
          setIsLoading(false);
        });
    }
  }, [lp_nft_id]); // Runs when lp_nft_id changes, important as this isnt always grabbed immediately on page load.

  const [tradeTimelineData, setTradeTimelineData] = useState<any[]>([]);

  useEffect(() => {
    // TODO: Fetch timeline trade data from indexer
    setTradeTimelineData([1, 2,]);
  }, [lp_nft_id]);

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
  }, [currentStatusRef, originalStatusRef, liquidityPosition, tradeTimelineData, isLoading, lp_nft_id]);

  return (
    <Layout pageTitle={`LP - ${lp_nft_id}`}>
      <main className={styles.main}>
        {isLoading ? (
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

                  <Box
                    paddingTop={"4em"}
                    paddingBottom={"5em"}
                    ref={originalStatusRef}
                  >
                    <OriginalLPStatus nftId={lp_nft_id} />
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
          </>
        ) : (
          <p>No liquidity position found.</p>
        )}
      </main>
    </Layout>
  );
}
