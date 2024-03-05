// pages/lp/[lp_nft_id].js

import { useEffect, useState } from "react";
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
    setTradeTimelineData([1, 2, 3]);
  }, [lp_nft_id]);

  return (
    <Layout pageTitle={`LP - ${lp_nft_id}`}>
      <main className={styles.main}>
        {isLoading ? (
          <LoadingSpinner />
        ) : liquidityPosition ? (
          <>
            <Box
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
                    <CurrentLPStatus
                      nftId={lp_nft_id}
                      position={liquidityPosition}
                    />
                  </VStack>
                  {/* 
                  <Box
                    position="absolute"
                    zIndex={-1}
                    left="50%"
                    top="100%"
                    height="9em"
                    width={".1em"}
                    className="neon-box"
                    backgroundColor="var(--complimentary-background)"
                  />
                   End Vertical line */}
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
                      <VStack key={index} paddingTop={index === 0 ? "0" : "3em"} >
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

                  <Box paddingTop={"4em"} paddingBottom={"5em"}>
                    <OriginalLPStatus nftId={lp_nft_id} />
                  </Box>
                </VStack>
              </VStack>
            </Box>
          </>
        ) : (
          <p>No liquidity position found.</p>
        )}
      </main>
    </Layout>
  );
}
