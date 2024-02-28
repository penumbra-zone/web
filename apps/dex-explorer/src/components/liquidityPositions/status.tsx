// components/LPStatus.js

import React from "react";
import {
  Box,
  VStack,
  Text,
  Divider,
  Badge,
  HStack,
  Image,
} from "@chakra-ui/react";
import {
  Position,
  PositionState,
} from "@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/dex/v1/dex_pb";
import { fromBaseUnit } from "../../utils/math/hiLo";
import { uint8ArrayToBase64 } from "../../utils/math/base64";
import { tokenConfigMapOnInner, Token } from "../../constants/tokenConstants";

interface LPStatusProps {
  nftId: string;
  position: Position;
}

const LPStatus = ({ nftId, position }: LPStatusProps) => {
  // Process position to human readable pieces

  // Get status
  const status = position.state;

  // https://buf.build/penumbra-zone/penumbra/docs/main:penumbra.core.component.dex.v1#penumbra.core.component.dex.v1.PositionState.PositionStateEnum
  let statusText = "";
  switch (status?.state) {
    case 0:
      statusText = "Unspecified";
      break;
    case 1:
      statusText = "Open";
      break;
    case 2:
      statusText = "Closed";
      break;
    case 3:
      statusText = "Withdrawn";
      break;
    case 4:
      statusText = "Claimed";
      break;
    default:
      statusText = "Unknown";
  }

  // Get fee tier
  const feeTier = position!.phi!.component!.fee;

  const asset1 = position!.phi!.pair!.asset1;
  const asset2 = position!.phi!.pair!.asset2;

  const reserves1 = position!.reserves!.r1;
  const reserves2 = position!.reserves!.r2;

  const p = position!.phi!.component!.p;
  const q = position!.phi!.component!.q;

  // TODO: We need a function that will query AssetMetadataById if the token is not in the tokenConfigMapOnInner

  const asset1Token: Token =
    tokenConfigMapOnInner[uint8ArrayToBase64(asset1!.inner)];
  const asset2Token: Token =
    tokenConfigMapOnInner[uint8ArrayToBase64(asset2!.inner)];

  return (
    <Box
      outline={".15em solid black"}
      borderRadius={".5em"}
      padding={15}
      width="fit-content"
    >
      <VStack width={"100%"}>
        <Text>{nftId}</Text>
        <HStack width={"100%"} justifyContent={"center"}>
          <HStack>
            <Badge colorScheme="blue">Status:</Badge>
            <Text>{statusText}</Text>
          </HStack>
          <HStack width={"10%"} />
          <HStack>
            <Badge colorScheme="orange">Fee tier:</Badge>
            <Text>{feeTier + "bps"}</Text>
          </HStack>
        </HStack>
        <VStack
          width={"100%"}
          padding="1em"
          alignItems={"left"}
        >
          {/* TODO Asset 1 */}


          {/* TODO chakra swap symbol*/}
          
          {/* Asset 2 */}
          <HStack>
            <Image
              src={asset2Token.imagePath}
              borderRadius={"50%"}
              width={"2em"}
            />
            <Text>
              {`Sell ${fromBaseUnit(
                reserves2!.lo,
                reserves2!.hi,
                asset2Token.decimals
                // TODO need the p/q pricing
              )} ${asset2Token.symbol} @ todo_pricing todo_asset1 / ${asset2Token.symbol} `}
            </Text>
          </HStack>
        </VStack>
      </VStack>
    </Box>
  );
};

export default LPStatus;
