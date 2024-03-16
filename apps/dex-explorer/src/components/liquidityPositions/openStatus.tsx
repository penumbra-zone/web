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
import CopiedTxToClipboard from "../copiedTx";
import LPAssetView from "../lpAssetView";

interface OpenPositionStatusProps {
  nftId: string;
  lp_event: LiquidityPositionEvent;
}

const OpenPositionStatus = ({ nftId, lp_event }: OpenPositionStatusProps) => {
  return (
    <>
      <VStack align={"left"} spacing={2}>
        <Text fontSize={"large"} fontWeight={"bold"} paddingBottom=".2em">
          Position Opened
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
        <LPAssetView sectionTitle={"Initial Reserves"} lp_event={lp_event} />
      </VStack>
    </>
  );
};

export default OpenPositionStatus;
