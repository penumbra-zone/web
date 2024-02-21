// pages/lp/[lp_nft_id].js

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import styles from "../../../styles/Home.module.css";
import { LiquidityPositionQuerier } from "../../utils/protos/services/dex/liquidity-positions";
import { testnetConstants } from "../../utils/protos/constants";
import { PositionId } from "@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/dex/v1/dex_pb";

export default function LP() {
  const router = useRouter();
  const { lp_nft_id } = router.query;
  const [liquidityPosition, setLiquidityPosition] = useState(null);
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
    <div className={styles.container}>
      <Head>
        <title>LP - {lp_nft_id}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        {isLoading ? (
          <p>Loading...</p>
        ) : liquidityPosition ? (
          <>
            <h1>NFT ID: {lp_nft_id}</h1>
            {/* todo */}
            <p>{JSON.stringify(liquidityPosition)}</p>{" "}
            {/* todo */}
          </>
        ) : (
          <p>No liquidity position found.</p>
        )}
      </main>

      {/* todo */}
    </div>
  );
}
