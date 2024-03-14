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
import { tokenConfigMapOnInner, Token } from "../../constants/tokenConstants";
import { fetchToken } from "../../utils/token/tokenFetch";
import BigNumber from "bignumber.js";
import { LiquidityPositionEvent } from "@/utils/indexer/types/lps";
import ClosedPositionStatus from "@/components/liquidityPositions/closedStatus";
import OpenPositionStatus from "@/components/liquidityPositions/openStatus";
import WithdrawnPositionStatus from "@/components/liquidityPositions/withdrawnStatus";

interface TimelinePositionProps {
  nftId: string;
  lp_event: LiquidityPositionEvent;
}

const POSITION_OPEN_EVENT = "EventPositionOpen";
const POSITION_CLOSE_EVENT = "EventPositionClose";
const POSITION_WITHDRAW_EVENT = "EventPositionWithdraw";

const TimelinePosition = ({ nftId, lp_event }: TimelinePositionProps) => {
    console.log(lp_event)
  return (
    <Box
      className="neon-box"
      width={"28em"}
      height={"fit-content"}
      padding="2em"
    >
      {lp_event.type.includes(POSITION_OPEN_EVENT) ? (
        <OpenPositionStatus nftId={nftId} lp_event={lp_event} />
      ) : lp_event.type.includes(POSITION_CLOSE_EVENT) ? (
        <ClosedPositionStatus nftId={nftId} lp_event={lp_event} />
      ) : (
        <WithdrawnPositionStatus nftId={nftId} lp_event={lp_event} />
      )}
    </Box>
  );
};

export default TimelinePosition;
