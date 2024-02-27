// components/LPStatus.js

import React from "react";
import { Box, VStack, Text, Divider, Badge, HStack } from "@chakra-ui/react";
import {
  Position,
  PositionState,
} from "@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/dex/v1/dex_pb";

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
      </VStack>
    </Box>
  );
};

export default LPStatus;
