import React, { useEffect, useState } from "react";
import {
  Box,
  VStack,
  Text,
  Divider,
  Badge,
  HStack,
  Image,
  Avatar,
} from "@chakra-ui/react";
import {
  Position,
  PositionState,
} from "@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/dex/v1/dex_pb";
import { fromBaseUnit } from "../../utils/math/hiLo";
import { uint8ArrayToBase64 } from "../../utils/math/base64";
import BigNumber from "bignumber.js";
import {
  LiquidityPositionEvent,
  PositionExecutionEvent,
} from "@/utils/indexer/types/lps";
import CopiedTxToClipboard from "../copiedTx";
import LPAssetView from "../lpAssetView";
import BlockTimestampView from "../blockTimestamp";

interface ExecutionEventProps {
  nftId: string;
  lp_event: PositionExecutionEvent;
}

const ExecutionEvent = ({ nftId, lp_event }: ExecutionEventProps) => {
  return (
    <HStack
      spacing={{ base: "1em", md: "5em" }}
      flexDirection={{ base: "column", md: "row" }}
      alignItems={{ base: "flex-start", md: "center" }}
      width={["95vw", "inherit"]}
    >
      <VStack spacing={".5em"} align={"flex-start"}>
        <BlockTimestampView
          blockHeight={lp_event.block_height}
          timestamp={lp_event.created_at}
        />
      </VStack>
      <Box
        className="neon-box"
        width={{ base: "100%", md: "25em" }}
        height={"7em"}
        padding="2em"
        display={"flex"}
      >
        <HStack align={"center"} spacing={10}>
          <Text fontSize={"large"} fontWeight={"bold"}>
            Fill
          </Text>
          <HStack align={"center"} spacing={2}>
            <LPAssetView sectionTitle={"Updated Reserves"} lp_event={lp_event} />
          </HStack>
        </HStack>
      </Box>
    </HStack>

  );
};

export default ExecutionEvent;
