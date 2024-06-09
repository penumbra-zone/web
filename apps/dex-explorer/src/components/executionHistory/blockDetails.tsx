import { BlockSummaryData } from "@/utils/types/block";
import { VStack, Text } from "@chakra-ui/react";

export interface BlockDetailsProps {
  blockSummary: BlockSummaryData
}

export const BlockDetails = ({ blockSummary }: BlockDetailsProps) => {

    return (
      <>
        <VStack align={"left"} spacing={2} paddingTop={".5em"}>
          <Text fontSize={"medium"} fontStyle={"monospace"}>
            {"Positions Opened: "}
            {blockSummary.openPositionEvents.length}
          </Text>
          <Text fontSize={"medium"} fontStyle={"monospace"}>
            {"Positions Closed: "}
            {blockSummary.closePositionEvents.length}
          </Text>
          <Text fontSize={"medium"} fontStyle={"monospace"}>
            {"Positions Withdrawn: "}
            {blockSummary.withdrawPositionEvents.length}
          </Text>
          <Text fontSize={"medium"} fontStyle={"monospace"}>
            {"Swaps: "}
            {blockSummary.swapExecutions.length}
          </Text>
          <Text fontSize={"medium"} fontStyle={"monospace"}>
            {"Asset Arbs: "}
            {blockSummary.arbExecutions.length}
          </Text>
        </VStack>
      </>
    );
}