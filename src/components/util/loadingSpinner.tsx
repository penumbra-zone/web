// @ts-nocheck
/* eslint-disable -- disabling this file as this was created before our strict rules */
import { Center, VStack, Spinner, Text } from "@chakra-ui/react";

export const LoadingSpinner = () => {
  return (
    <Center height="100vh">
      <VStack spacing={4} align="center" justify="center">
        <Spinner
          thickness="4px"
          speed="0.65s"
          emptyColor="var(--charcoal)"
          color="purple.700" 
          size="xl"
        />
        <Text fontSize="l">Loading</Text>{" "}
      </VStack>
    </Center>
  );
}