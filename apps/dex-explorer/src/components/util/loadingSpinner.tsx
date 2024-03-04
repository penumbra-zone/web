import { Center, VStack, Spinner, Text } from "@chakra-ui/react";

export const LoadingSpinner = () => {
  return (
    <Center height="100vh">
      <VStack spacing={4} align="center" justify="center">
        <Spinner
          className="neon-spinner" // Custom neon effect
          thickness="4px"
          speed="0.65s"
          emptyColor="gray.200"
          color="purple.700" 
          size="xl"
        />
        <Text fontSize="l">Loading</Text>{" "}
      </VStack>
    </Center>
  );
}