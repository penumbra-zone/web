import { Box, HStack, VStack, Text } from "@chakra-ui/react";
import BlockTimestampView from "../blockTimestamp";
import { BlockDetails } from "./blockDetails";
import { BlockSummaryData } from "@/utils/types/block";

export interface BlockSummaryProps {
  blockHeight: number
  blockSummary: BlockSummaryData
}

export const BlockSummary = ({ blockHeight, blockSummary }: BlockSummaryProps) => {
  return (
    <>
      <HStack
        spacing={{ base: "1em", md: "5em" }}
        flexDirection={{ base: "column", md: "row" }}
        alignItems={{ base: "flex-start", md: "center" }}
      >
        <VStack spacing=".5em" align="flex-start" paddingBottom={"5px"}>
          <BlockTimestampView
            blockHeight={blockHeight}
            timestamp={blockSummary.createdAt ?? undefined}
          />
        </VStack>
        <Box
          className="neon-box"
          width={{ base: "calc(100vw - 2em)", md: "35em" }}
          height="14em"
          padding="2em"
          display="flex"
          justifyContent="center"
        >
          <HStack align="center" spacing={10}>
            <Text as="a" href={"/block/" + blockHeight} fontSize="large" fontWeight="bold">
              Block: {blockHeight}
            </Text>
            <HStack align="center" spacing={2}>
              <BlockDetails blockSummary={blockSummary} />
            </HStack>
          </HStack>
        </Box>
      </HStack>
    </>
  );
};