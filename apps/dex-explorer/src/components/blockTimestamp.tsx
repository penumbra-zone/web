import React, { FC, useEffect, useState } from "react";
import { CopyIcon } from "@radix-ui/react-icons";
import { Avatar, HStack, VStack } from "@chakra-ui/react";
import { testnetConstants } from "@/constants/configConstants";
import { Text } from "@chakra-ui/react";
import { LiquidityPositionEvent } from "@/utils/indexer/types/lps";
import { Token } from "@/constants/tokenConstants";
import { fetchToken } from "@/utils/token/tokenFetch";
import { fromBaseUnit } from "@/utils/math/hiLo";
import { base64ToUint8Array } from "@/utils/math/base64";

interface BlockTimestampProps {
  blockHeight: number;
  timestamp: string;
}

function formatTimestampShort(timestamp: string) {
  const date = new Date(timestamp);
  const month = date.toLocaleString("en-US", { month: "short" });
  const day = date.getUTCDate();
  const year = String(date.getUTCFullYear());
  const hour = String(date.getUTCHours()).padStart(2, "0");
  const minute = String(date.getUTCMinutes()).padStart(2, "0");

  return `${month} ${day}, ${year}\n${hour}:${minute} UTC`;
}

const BlockTimestampView: FC<BlockTimestampProps> = ({
  blockHeight,
  timestamp,
}) => {
  return (
    <>
      <HStack>
        <Text
          fontSize="xs"
          style={{
            color: "var(--charcoal-tertiary-blended)",
            fontSize: "small",
            fontFamily: "monospace",
          }}
        >
          Block{" "}
        </Text>
        <Text>
          <a
            href={`${testnetConstants.cuiloaUrl}/block/${blockHeight}`}
            target="_blank"
            rel="noreferrer"
            style={{
              textDecoration: "underline",
              color: "var(--charcoal-tertiary-blended)",
              display: "flex",
              fontSize: "small",
              fontFamily: "monospace",
            }}
          >
            {blockHeight}
          </a>
        </Text>
      </HStack>
      <Text
        fontSize="xs"
        style={{
          color: "var(--charcoal-tertiary-blended)",
          display: "flex",
          fontSize: "small",
          fontFamily: "monospace",
        }}
      >
        {" "}
        {formatTimestampShort(timestamp)}
      </Text>
    </>
  );
};

export default BlockTimestampView;
