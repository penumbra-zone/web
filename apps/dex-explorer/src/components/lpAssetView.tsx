import React, { FC, useEffect, useState } from "react";
import { CopyIcon } from "@radix-ui/react-icons";
import { Avatar, HStack, VStack } from "@chakra-ui/react";
import { Text } from "@chakra-ui/react";
import {
  LiquidityPositionEvent,
  PositionExecutionEvent,
} from "@/utils/indexer/types/lps";
import { fetchTokenAsset } from "@/utils/token/tokenFetch";
import { fromBaseUnit } from "@/utils/math/hiLo";
import { base64ToUint8Array } from "@/utils/math/base64";
import { Token } from "@/utils/types/token";

interface LPAssetViewProps {
  sectionTitle: string;
  lp_event: LiquidityPositionEvent | PositionExecutionEvent;
}

const LPAssetView: FC<LPAssetViewProps> = ({ sectionTitle, lp_event }) => {
  // States for tokens
  const [asset1Token, setAsset1Token] = useState<Token>({
    symbol: "UNKNOWN",
    display: "UNKNOWN",
    decimals: 0,
    inner: "UNKNOWN",
    imagePath: "UNKNOWN",
  });
  const [asset2Token, setAsset2Token] = useState<Token>({
    symbol: "UNKNOWN",
    display: "UNKNOWN",
    decimals: 0,
    inner: "UNKNOWN",
    imagePath: "UNKNOWN",
  });
  const [assetError, setAssetError] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [reserves1, setReserves1] = useState<number>(0);
  const [reserves2, setReserves2] = useState<number>(0);

  useEffect(() => {
    // Function to fetch tokens asynchronously
    const fetchTokens = async () => {
      setIsLoading(true);
      try {
        let asset1;
        let asset2;

        if ("lpevent_attributes" in lp_event) {
          asset1 = base64ToUint8Array(
            lp_event.lpevent_attributes.tradingPair!.asset1.inner
          );
          asset2 = base64ToUint8Array(
            lp_event.lpevent_attributes.tradingPair!.asset2.inner
          );
        } else {
          asset1 = base64ToUint8Array(
            lp_event.execution_event_attributes.tradingPair!.asset1.inner
          );
          asset2 = base64ToUint8Array(
            lp_event.execution_event_attributes.tradingPair!.asset2.inner
          );
        }

        if (asset1) {
          const fetchedAsset1Token = fetchTokenAsset(asset1)
          if (!fetchedAsset1Token) {
            setAssetError("Asset 1 token not found");
            throw new Error("Asset 1 token not found");
          }
          setAsset1Token(fetchedAsset1Token);
        }

        if (asset2) {
          const fetchedAsset2Token = fetchTokenAsset(asset2)
          //const fetchedAsset2Token = await fetchToken(asset2);
          if (!fetchedAsset2Token) {
            setAssetError("Asset 2 token not found");
            throw new Error("Asset 2 token not found");
          }
          setAsset2Token(fetchedAsset2Token);
        }
      } catch (error) {
        console.error(error);
      }
      setIsLoading(false);
    };

    fetchTokens();
  }, [lp_event]);

  if (!isLoading && (!asset1Token || !asset2Token)) {
    return <div>{`LP exists, but ${assetError}.`}</div>;
  }

  useEffect(() => {
    // number to bigint
    // if undefined, default to 0
    let reserves1;
    let reserves2;
    if ("lpevent_attributes" in lp_event) {
      reserves1 = fromBaseUnit(
        BigInt(lp_event.lpevent_attributes.reserves1?.lo ?? 0),
        BigInt(lp_event.lpevent_attributes.reserves1?.hi ?? 0),
        asset1Token.decimals
      );

      reserves2 = fromBaseUnit(
        BigInt(lp_event.lpevent_attributes.reserves2?.lo ?? 0),
        BigInt(lp_event.lpevent_attributes.reserves2?.hi ?? 0),
        asset2Token.decimals
      );
    } else {
      reserves1 = fromBaseUnit(
        BigInt(lp_event.execution_event_attributes.reserves1?.lo ?? 0),
        BigInt(lp_event.execution_event_attributes.reserves1?.hi ?? 0),
        asset1Token.decimals
      );

      reserves2 = fromBaseUnit(
        BigInt(lp_event.execution_event_attributes.reserves2?.lo ?? 0),
        BigInt(lp_event.execution_event_attributes.reserves2?.hi ?? 0),
        asset2Token.decimals
      );
    }

    setReserves1(Number.parseFloat(reserves1.toFixed(6)));
    setReserves2(Number.parseFloat(reserves2.toFixed(6)));
  }, [lp_event, asset1Token, asset2Token]);

  return (
    <>
      <VStack align={"left"} spacing={2} paddingTop={".5em"}>
        <Text fontSize={"medium"} fontStyle={"oblique"}>
          {sectionTitle}{" "}
        </Text>
        <HStack align={"center"} spacing={7}>
          {/* Asset 1 */}
          <HStack>
            <Avatar
              name={asset1Token.display}
              src={asset1Token.imagePath}
              // Extra small
              size="xs"
              borderRadius="50%"
            />
            <Text fontSize={"small"} fontFamily={"monospace"}>
              {Number.parseFloat(reserves1.toFixed(6))} {asset1Token.symbol}
            </Text>
          </HStack>

          {/* Asset 2 */}
          <HStack>
            <Avatar
              name={asset2Token.display}
              src={asset2Token.imagePath}
              // Extra small
              size="xs"
              borderRadius="50%"
            />
            <Text fontSize={"small"} fontFamily={"monospace"}>
              {Number.parseFloat(reserves2.toFixed(6))} {asset2Token.symbol}
            </Text>
          </HStack>
        </HStack>
      </VStack>
    </>
  );
};

export default LPAssetView;
