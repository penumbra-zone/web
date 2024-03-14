import React from "react";
import {
  VStack,
  Text,
  HStack,
} from "@chakra-ui/react";
import { LiquidityPositionEvent } from "@/utils/indexer/types/lps";
import CopiedTxToClipboard from "../copiedTx";
import LPAssetView from "../lpAssetView";

interface WithdrawnPositionStatusProps {
  nftId: string;
  lp_event: LiquidityPositionEvent;
}

const WithdrawnPositionStatus = ({
  nftId,
  lp_event,
}: WithdrawnPositionStatusProps) => {
  return (
    <>
      <VStack align={"left"} spacing={2}>
        <Text fontSize={"large"} fontWeight={"bold"} paddingBottom=".2em">
          Position Withdrawn
        </Text>
        <HStack align={"center"} spacing={2}>
          <Text fontSize={"small"} fontFamily={"monospace"}>
            Tx{" "}
          </Text>

          <CopiedTxToClipboard
            txHash={lp_event.tx_hash}
            clipboardPopupText={"Tx hash copied"}
          />
        </HStack>
        <LPAssetView sectionTitle={"Reserves Withdrawn"} lp_event={lp_event}/>
      </VStack>
    </>
  );
};

export default WithdrawnPositionStatus;
