// pages/tradingPairs/index.tsx

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import Layout from "../../components/layout";
import {
  VStack,
  Text,
  Spinner,
  Center,
  Box,
  HStack,
  Input,
  Button,
} from "@chakra-ui/react";
import { useSearchParams } from "next/navigation";

export default function TradingPairs() {
  const searchParams = useSearchParams();
  const token1 = searchParams.get("token1")?.toLocaleLowerCase();
  const token2 = searchParams.get("token2")?.toLocaleLowerCase();

  if (!token1 || !token2) {
    return (
      <Layout pageTitle="Trading Pair View">
        <Center height="100vh">
          <Text>token1 or token2 url argument missing.</Text>
        </Center>
      </Layout>
    );
  }
  
  
  return (
    <Layout pageTitle={`${token1}/${token2}`}>
      <Center height="100vh">
        <Text>{`${token1} ${token2}`}</Text>
      </Center>
    </Layout>
  );
}
