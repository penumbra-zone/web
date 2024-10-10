// @ts-nocheck
/* eslint-disable -- disabling this file as this was created before our strict rules */
import { Center, VStack, Spinner, Text } from "@chakra-ui/react";

export const LoadingSpinner = () => {
  return (
    <Center height="100%">
      <VStack spacing={4} align="center" justify="center">
        <Spinner
          thickness="4px"
          speed="0.65s"
          emptyColor="var(--light-grey)"
          color="purple.700"
          size="xl"
        />
        <Text fontSize="l">Loading</Text>{" "}
      </VStack>
    </Center>
  );
}