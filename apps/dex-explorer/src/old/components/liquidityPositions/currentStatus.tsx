// @ts-nocheck
/* eslint-disable -- disabling this file as this was created before our strict rules */
import React, { useEffect, useState } from "react";
import { VStack, Text, Badge, HStack, Image, Avatar } from "@chakra-ui/react";
import {
  Position,
  PositionState,
} from "@penumbra-zone/protobuf/penumbra/core/component/dex/v1/dex_pb";
import { fromBaseUnit } from "@/old/utils/math/hiLo";
import { uint8ArrayToBase64 } from "@/old/utils/math/base64";
import { fetchTokenAsset } from "@/old/utils/token/tokenFetch";
import BigNumber from "bignumber.js";
import { CopyIcon } from "@radix-ui/react-icons";
import { Token } from "@/old/utils/types/token";
import { useTokenAssetDeprecated } from "@/fetchers/tokenAssets";

interface CurrentLPStatusProps {
  nftId: string;
  position: Position;
}

function getStatusText(position): string {
  // Get status
  const status = (position.state!).state.toString();

  // https://buf.build/penumbra-zone/penumbra/docs/main:penumbra.core.component.dex.v1#penumbra.core.component.dex.v1.PositionState.PositionStateEnum
  let statusText = "";

  switch (status) {
    case "POSITION_STATE_ENUM_UNSPECIFIED":
      statusText = "Unspecified";
      break;
    case "POSITION_STATE_ENUM_OPENED":
      statusText = "Open";
      break;
    case "POSITION_STATE_ENUM_CLOSED":
      statusText = "Closed";
      break;
    case "POSITION_STATE_ENUM_WITHDRAWN":
      statusText = "Withdrawn";
      break;
    case "POSITION_STATE_ENUM_CLAIMED":
      statusText = "Claimed";
      break;
    default:
      statusText = "Unknown";
  }

  return statusText;
}

const CurrentLPStatus = ({ nftId, position }: CurrentLPStatusProps) => {
  const [isCopied, setIsCopied] = useState<boolean>(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(nftId).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 1500); // Hide popup after 1.5 seconds
    });
  };

  // First process position to human readable pieces
  const statusText = getStatusText(position);

  // Get fee tier
  const feeTier = Number(position.phi!.component!.fee);

  const { asset1, asset2 }  = position.phi!.pair!;
  const { data: asset1Token } = useTokenAssetDeprecated(asset1.inner);
  const { data: asset2Token } = useTokenAssetDeprecated(asset2.inner);
  const [assetError, setAssetError] = useState<string | undefined>();

  const reserves1 = fromBaseUnit(
    BigInt(position.reserves!.r1?.lo || 0),
    BigInt(position.reserves!.r1?.hi || 0),
    asset1Token.decimals
  );

  const reserves2 = fromBaseUnit(
    BigInt(position.reserves!.r2?.lo || 0),
    BigInt(position.reserves!.r2?.hi || 0),
    asset2Token.decimals
  );

  const p: BigNumber = fromBaseUnit(
    BigInt(position.phi!.component!.p!.lo || 0),
    BigInt(position.phi!.component!.p!.hi || 0),
    asset2Token.decimals
  );

  const q: BigNumber = fromBaseUnit(
    BigInt(position.phi!.component!.q!.lo || 0),
    BigInt(position.phi!.component!.q!.hi || 0),
    asset1Token.decimals
  );

  return (
    <VStack width={["100%"]}>
      <HStack>
        <Text fontFamily={"monospace"} wordBreak={"break-word"}>
          {nftId}
        </Text>
        <div style={{ position: "relative", display: "inline-block" }}>
          <CopyIcon onClick={handleCopy} style={{ cursor: "pointer" }} />
          {isCopied && (
            <div
              style={{
                position: "absolute",
                bottom: "100%", // Align bottom of popup with top of the button
                left: "50%",
                transform: "translateX(-50%) translateY(-8px)", // Adjust Y translation for spacing
                padding: "8px",
                backgroundColor: "#4A5568", // Dark grayish-blue
                color: "white",
                borderRadius: "6px",
                fontSize: "14px",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)", // Soft shadow
                zIndex: 1, // Ensure the popup is above other elements
                transition: "opacity 0.3s, transform 0.3s", // Smooth transition for both opacity and position
                opacity: 0.9, // Slightly transparent
                width: "10em",
                textAlign: "center",
                border: "3px solid #2D3748",
              }}
            >
              {`LP ID copied`}
            </div>
          )}
        </div>
      </HStack>
      <HStack width={"100%"} justifyContent={"center"} paddingTop={"1em"}>
        <HStack>
          <Badge colorScheme="blue">Status:</Badge>
          <Text>{statusText}</Text>
        </HStack>
        <HStack width={{ base: "10%", md: "5%" }} />
        <HStack>
          <Badge colorScheme="orange">Fee tier:</Badge>
          <Text>{feeTier + "bps"}</Text>
        </HStack>
      </HStack>
      <VStack width={"100%"} padding="1em" alignItems={"left"}>
        <HStack>
          <Avatar
            name={asset1Token.symbol}
            src={asset1Token.imagePath}
            size="sm"
            borderRadius="50%"
          />
          <Text fontFamily={"monospace"}>
            {`Sell ${Number.parseFloat(reserves1.toFixed(6))} ${
              asset1Token.symbol
            } @ ${Number.parseFloat(p.div(q).toFixed(6))} ${
              asset2Token.symbol
            } / ${asset1Token.symbol} `}
          </Text>
        </HStack>
        <HStack width={"100%"} justifyContent={"left"} paddingLeft=".15em">
          <Image
            src="/assets/icons/swap.svg"
            alt="swap"
            width="7"
            paddingTop=".2em"
            paddingBottom=".2em"
            sx={{ transform: "rotate(90deg)" }}
          />
        </HStack>
        <HStack>
          <Avatar
            name={asset2Token.symbol}
            src={asset2Token.imagePath}
            size="sm"
            borderRadius="50%"
          />
          <Text fontFamily={"monospace"}>
            {`Sell ${Number.parseFloat(reserves2.toFixed(6))} ${
              asset2Token.symbol
            } @ ${Number.parseFloat(q.div(p).toFixed(6))} ${
              asset1Token.symbol
            } / ${asset2Token.symbol} `}
          </Text>
        </HStack>
      </VStack>
    </VStack>
  );
};

export default CurrentLPStatus;
