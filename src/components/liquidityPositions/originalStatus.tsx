// components/OriginalLPStatus.js

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

interface OriginalLPStatusProps {
  nftId: string;
}

const OriginalLPStatus = ({ nftId }: OriginalLPStatusProps) => {
  return (
    <Box className="neon-box" padding={15}>
      <Text>
        Original Status here pending{" "}
        <a
          href="https://github.com/penumbra-zone/penumbra/issues/3844"
          style={{ color: "var(--light-grey)", textDecoration: "underline" }}
          target="_blank"
          rel="noreferrer"
        >
          issue completion
        </a>
      </Text>
    </Box>
  );
};

export default OriginalLPStatus;
