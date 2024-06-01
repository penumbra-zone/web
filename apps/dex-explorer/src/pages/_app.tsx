import type { AppProps } from "next/app";
import React from "react";
import "@/global.css";
import { ChakraProvider, extendTheme } from "@chakra-ui/react";

function app({ Component, pageProps }: AppProps) {
  // May not necessarily be the best way to apply global styles
  const theme = extendTheme({
    styles: {
      global: {
        // Apply some styles globally across all elements
        body: {
          bg: "var(--charcoal-secondary)",
          color: "var(--light-grey)",
          fontFamily: "sans-serif",
          fontWeight: "400",
        },
      },
    },
  });
  return (
    <ChakraProvider theme={theme}>
      <Component {...pageProps} />
    </ChakraProvider>
  );
}

export default app;
