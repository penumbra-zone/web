import styles from "@/Home.module.css";
import Layout from "../components/layout";
import { useEffect, useState } from "react";
import { Price, Trace, TraceType } from "./block/[block_height]";
import { Box, Heading, HStack, Link, VStack } from "@chakra-ui/react";
import {
  SwapExecution,
  SwapExecution_Trace,
} from "@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/dex/v1/dex_pb";
import { fetchAllTokenAssets } from "@/utils/token/tokenFetch";
import { Token } from "@/utils/types/token";
import { LoadingSpinner } from "@/components/util/loadingSpinner";

export const routes = [
  { path: "/lp/utils" },
  { path: "/lp/<NFT_ID>" },
  {
    path: "/pair/<BASE_TOKEN_NAME>:<QUOTE_TOKEN_NAME>",
  },
];

export default function Home() {
  const [swapExecutions, setSwapExecutions] = useState<SwapExecution[]>([]);
  const [metadataByAssetId, setMetadataByAssetId] = useState<Record<string, Token>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let fetchData = async () => {
      const blockHeight = await fetch("/api/blocks/1")
        .then((res) => res.json())
        .then((data) => {
          return data[0]["height"]
        }).catch((err) => {
          console.error(err);
          return null;
        })

      console.log("Current block height: ", blockHeight);

      let swaps = []
      let blockRange = 10
      let maxBlocks = 100000

      while (blockRange <= maxBlocks && swaps.length == 0) {
        console.log("route: ", `/api/swaps/${blockHeight - blockRange}/${blockHeight}`)
        swaps = await fetch(`/api/swaps/${blockHeight - blockRange}/${blockHeight}`)
          .then((res) => res.json())
          .then((data) => {
            return data
          }).catch((err) => {
            console.error(err);
            return []
          })

        if (swaps.length != 0) {
          swaps = swaps.sort((a: any, b: any) => {
            return b.blockHeight - a.blockHeight;
          });

          setSwapExecutions(swaps as SwapExecution[]);

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
          setMetadataByAssetId(metadataByAssetId);
        }

        blockRange *= 10
        console.log("Block range: ", blockRange);
        console.log(swaps)
      }
      console.log("Latest swap executions: ", swaps);
      setIsLoading(false);  // Set loading to false after fetching is complete
    }
    fetchData();
  }, []);

  return (
    <Layout pageTitle="Penumbra Dex Explorer">
      <div className={styles.container}>
        <main className={styles.main}>
          <div style={{ width: "100%", maxWidth: "1000px", margin: "0 auto", padding: "40px 20px" }}>
            <Heading as="h1" size="xl" textAlign="center" marginBottom="40px" color="var(--complimentary-background)">
              Recent Swaps
            </Heading>
            {isLoading ? (
              <Box display="flex" justifyContent="center" alignItems="center" height="200px">
                <LoadingSpinner />
              </Box>
            ) : swapExecutions.length === 0 ? (
              <Box textAlign="center" color="var(--complimentary-background)">
                No recent swaps found.
              </Box>
            ) : (
              <VStack
                fontSize={"small"}
                fontFamily={"monospace"}
                spacing={"40px"}
                width={"100%"}
              >
                {swapExecutions.map((swapExecution: any, execIndex: number) => {
                  const firstTrace = swapExecution.swapExecution.traces[0];
                  const lastTrace = swapExecution.swapExecution.traces[swapExecution.swapExecution.traces.length - 1];
                  const startAssetId = firstTrace.value[0].assetId?.inner;
                  const endAssetId = lastTrace.value[lastTrace.value.length - 1].assetId?.inner;
                  const startAssetDisplay = metadataByAssetId[startAssetId]?.display;
                  const endAssetDisplay = metadataByAssetId[endAssetId]?.display;
                  const poolLink = `/pair/${startAssetDisplay}:${endAssetDisplay}`;

                  return (
                    <Box key={execIndex} width="100%" backgroundColor="var(--charcoal)" borderRadius="15px" padding="25px">
                      <VStack
                        spacing={8}
                        align="stretch"
                        width={"100%"}
                      >
                        <HStack justifyContent="space-between" width="100%">
                          <Link href={`/block/${swapExecution.blockHeight}`} color="var(--complimentary-background)">
                            Block #{swapExecution.blockHeight}
                          </Link>
                          <Link href={poolLink} color="var(--complimentary-background)">
                            View {startAssetDisplay}:{endAssetDisplay} Pool
                          </Link>
                        </HStack>

                        {swapExecution.swapExecution.traces.map(
                          (trace: SwapExecution_Trace, index: number) => (
                            <Box
                              key={index}
                              backgroundColor="var(--charcoal-tertiary)"
                              borderRadius="10px"
                              padding="20px"
                              boxShadow="0 0 10px rgba(255, 255, 255, 0.05)"
                            >
                              <VStack spacing={4} align="stretch">
                                <Trace
                                  trace={trace}
                                  metadataByAssetId={metadataByAssetId}
                                  type={TraceType.SWAP}
                                  hidePrice={true}
                                />
                                <Box
                                  backgroundColor="var(--charcoal-secondary)"
                                  padding="10px"
                                  borderRadius="8px"
                                  textAlign="center"
                                  fontWeight="bold"
                                >
                                  <Price trace={trace} metadataByAssetId={metadataByAssetId} />
                                </Box>
                              </VStack>
                            </Box>
                          )
                        )}
                      </VStack>
                    </Box>
                  );
                })}
              </VStack>
            )}
          </div>
        </main>
      </div>
    </Layout>
  );
}