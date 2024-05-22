// pages/lp/utils.tsx

import React, { useState } from "react";
import Layout from "../../components/layout";
import { VStack, Text, Center, HStack, Input, Button } from "@chakra-ui/react";
import { innerToBech32Address, bech32ToInner } from "../../utils/math/bech32";

export default function Utils() {
  const [innerAddress, setInnerAddress] = useState("");
  const [bech32Address, setBech32Address] = useState("");
  const [innerToBech32Output, setInnerToBech32Output] = useState("");
  const [bech32ToInnerOutput, setBech32ToInnerOutput] = useState("");

  const handleInnerToBech32 = () => {
    const bech32 = innerToBech32Address(innerAddress, "plpid");
    setInnerToBech32Output(bech32);
  };

  const handleBech32ToInner = () => {
    const inner = bech32ToInner(bech32Address);
    setBech32ToInnerOutput(inner);
  };

  return (
    <Layout pageTitle="Utils">
      <Center height="100vh">
        <VStack spacing={4}>
          <HStack spacing={2}>
            <Input
              placeholder="Enter B64 encoded Inner String"
              value={innerAddress}
              onChange={(e) => setInnerAddress(e.target.value)}
              width={"40em"}
            />
            <Button
              colorScheme="purple"
              onClick={handleInnerToBech32}
              width={"20em"}
            >
              Convert to Bech32
            </Button>
          </HStack>
          {innerToBech32Output && <Text>Bech32: {innerToBech32Output}</Text>}
          <VStack paddingBottom={"5em"}/>
          <HStack spacing={2}>
            <Input
              placeholder="Enter Bech32 Address"
              value={bech32Address}
              onChange={(e) => setBech32Address(e.target.value)}
              width={"40em"}
            />
            <Button
              colorScheme="purple"
              onClick={handleBech32ToInner}
              width={"20em"}
            >
              Convert to B64 Inner
            </Button>
          </HStack>
          {bech32ToInnerOutput && <Text>Inner: {bech32ToInnerOutput}</Text>}
        </VStack>
      </Center>
    </Layout>
  );
}