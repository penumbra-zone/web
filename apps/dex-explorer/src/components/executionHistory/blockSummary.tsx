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
        <HStack spacing={"5em"}>
          <VStack spacing={".5em"} align={"flex-start"}>
            <BlockTimestampView
              blockHeight={blockHeight}
              timestamp={blockSummary.createdAt ?? undefined}
            />
          </VStack>
          <Box
            className="neon-box"
            width={"35em"}
            height={"12em"}
            padding="2em"
            display={"flex"}
          >
            <HStack align={"center"} spacing={10}>
              <Text as={"a"} href={"/block/" + blockHeight} fontSize={"large"} fontWeight={"bold"}>
                Block: {blockHeight}
              </Text>
              <HStack align={"center"} spacing={2}>
                <BlockDetails blockSummary={blockSummary}/>
              </HStack>
            </HStack>
          </Box>
        </HStack>
      </>
    );
  };
