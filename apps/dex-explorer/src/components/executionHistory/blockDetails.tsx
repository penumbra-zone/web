import { BlockSummaryData } from "@/utils/types/block";
import { VStack, Text } from "@chakra-ui/react";

export interface BlockDetailsProps {
  blockSummary: BlockSummaryData
}

export const BlockDetails = ({ blockSummary }: BlockDetailsProps) => {

    return (
        <>
          <VStack align={"left"} spacing={2} paddingTop={".5em"}>
            <Text fontSize={"medium"} fontStyle={"oblique"}>
              {"Number Positions Opened: "}{blockSummary.openPositionEvents.length}
            </Text>
            <Text fontSize={"medium"} fontStyle={"oblique"}>
              {"Number Positions Closed: "}{blockSummary.closePositionEvents.length}
            </Text>
            <Text fontSize={"medium"} fontStyle={"oblique"}>
              {"Number Positions Withdrawn: "}{blockSummary.withdrawPositionEvents.length}
            </Text>
            <Text fontSize={"medium"} fontStyle={"oblique"}>
              {"Number Swaps: "}{blockSummary.swapExecutions.length}
            </Text>
            <Text fontSize={"medium"} fontStyle={"oblique"}>
              {"Number Arbs: "}{blockSummary.arbExecutions.length}
            </Text>
          </VStack>
        </>
      );
}