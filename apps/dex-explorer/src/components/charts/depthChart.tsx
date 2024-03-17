import React from "react";
import { VStack, Text, HStack } from "@chakra-ui/react";

interface DepthChartProps {
  buySideData: {
    x: Number;
    y: Number;
  }[];
  sellSideData: {
    x: Number;
    y: Number;
  }[];
}

const DepthChart = ({ buySideData, sellSideData }: DepthChartProps) => {
  return (
    <>
      <VStack align={"left"} spacing={2}>
        <Text fontSize={"large"} fontWeight={"bold"} paddingBottom=".2em">
          Depth Chart
        </Text>
        <HStack align={"center"} spacing={2}>
          <Text fontSize={"small"} fontFamily={"monospace"}>
            Data{" "}
          </Text>
        </HStack>
      </VStack>
    </>
  );
};

export default DepthChart;
