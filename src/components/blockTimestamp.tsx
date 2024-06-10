import React, { FC } from "react";
import { HStack } from "@chakra-ui/react";
import { Text } from "@chakra-ui/react";

interface BlockTimestampProps {
  blockHeight: number;
  timestamp: string;
}

export function formatTimestampShort(timestamp: string) {
  const date = new Date(timestamp);
  const month = date.toLocaleString("en-US", { month: "short" });
  const day = date.getUTCDate();
  const year = String(date.getUTCFullYear());
  const hour = String(date.getUTCHours()).padStart(2, "0");
  const minute = String(date.getUTCMinutes()).padStart(2, "0");

  return `${month} ${day}, ${year}\n${hour}:${minute} UTC`;
}

export const formatTimestampOrDefault = (timestamp: any) => {
  if (timestamp === undefined || timestamp === "") {
    return "Missing data in indexer to display timestamp";
  }
  return formatTimestampShort(timestamp);
};

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
            href={`/block/${blockHeight}`}
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
        {formatTimestampOrDefault(timestamp)}
      </Text>
    </>
  );
};

export default BlockTimestampView;
