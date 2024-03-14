import React from "react";
import {
  Box,
} from "@chakra-ui/react";
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
