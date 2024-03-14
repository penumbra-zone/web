
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

interface TimelinePositionProps {
  nftId: string;
  lp_event: LiquidityPositionEvent;
}

const TimelinePosition = ({ nftId }: TimelinePositionProps) => {
  return (
    <Box className="neon-box" padding={15} width={"20em"}>
        <Text>beep boop</Text>;
    </Box>
  );
};

export default TimelinePosition;
