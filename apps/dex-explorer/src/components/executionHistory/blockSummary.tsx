import { Box, HStack, Flex, Text } from "@chakra-ui/react";
import BlockTimestampView from "../blockTimestamp";
import { BlockDetails } from "./blockDetails";
import { BlockSummaryData } from "@/utils/types/block";

export interface BlockSummaryProps {
  blockHeight: number
  blockSummary: BlockSummaryData
}

export const BlockSummary = ({ blockHeight, blockSummary }: BlockSummaryProps) => {
  return (
    <Flex
      w="100%"
      className="box-card"
      backgroundColor="var(--charcoal-tertiary)"
      borderRadius="10px"
      padding={6}
      mb={6}
    >
      <Box w="50%">
        <Text as="a" href={"/block/" + blockHeight} fontSize="large" fontWeight="bold" w="50%" py={2}>
          Block: {blockHeight}
        </Text>
        <BlockTimestampView
          blockHeight={blockHeight}
          timestamp={blockSummary.createdAt ?? undefined}
        />
      </Box>
      <BlockDetails blockSummary={blockSummary} />
    </Flex>
  );
};