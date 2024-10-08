// @ts-nocheck
/* eslint-disable -- disabling this file as this was created before our strict rules */
import React, { FC, useEffect, useState } from "react";
import { CopyIcon } from "@radix-ui/react-icons";
import { Avatar, HStack, VStack , Text } from "@chakra-ui/react";
import {
  LiquidityPositionEvent,
  PositionExecutionEvent,
} from "@/old/utils/indexer/types/lps";
import { useTokenAssetDeprecated } from "@/fetchers/tokenAssets";
import { fromBaseUnit } from "@/old/utils/math/hiLo";
import { base64ToUint8Array } from "@/old/utils/math/base64";
import { Token } from "@/old/utils/types/token";

interface LPAssetViewProps {
  sectionTitle: string;
  lp_event: LiquidityPositionEvent | PositionExecutionEvent;
}

const LPAssetView: FC<LPAssetViewProps> = ({ sectionTitle, lp_event }) => {
  const { asset1, asset2 } = lp_event.lpevent_attributes?.tradingPair
    ?? lp_event.execution_event_attributes?.tradingPair;

  const { data: asset1Token } = useTokenAssetDeprecated(asset1 && base64ToUint8Array(asset1.inner));
  const { data: asset2Token } = useTokenAssetDeprecated(asset2 && base64ToUint8Array(asset2.inner));

  const [reserves1, setReserves1] = useState<number>(0);
  const [reserves2, setReserves2] = useState<number>(0);

  useEffect(() => {
    if (!asset1Token) return;
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
  );
};

export default LPAssetView;
