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
    <Text>Hmm</Text>
    </>
  );
};

export default DepthChart;
