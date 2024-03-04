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
import LPStatus from "../../components/liquidityPositions/status";
import { VStack, Text, Spinner, Center } from "@chakra-ui/react";
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

  return (
    <Layout pageTitle={`LP - ${lp_nft_id}`}>
      <main className={styles.main}>
        {isLoading ? (
          <LoadingSpinner />
        ) : liquidityPosition ? (
          <>
            <VStack width={"100%"} paddingTop={"4em"}>
              <VStack>
                <Text
                  fontWeight={"bold"}
                  width={"100%"}
                  alignContent={"left"}
                  fontSize={"1.5em"}
                  paddingBottom=".5em"
                >
                  Position Status
                </Text>
                <LPStatus nftId={lp_nft_id} position={liquidityPosition} />
              </VStack>
            </VStack>
          </>
        ) : (
          <p>No liquidity position found.</p>
        )}
      </main>

      {/* todo */}
    </Layout>
  );
}
