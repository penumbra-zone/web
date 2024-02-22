// components/Layout.js

import Head from "next/head";
import Image from "next/image";
import styles from "@/Home.module.css";
import { Text, HStack } from "@chakra-ui/react";
import React from "react";

interface LayoutProps {
  children?: React.ReactNode; 
  pageTitle: string;
}


const Layout = ({ children, pageTitle }: LayoutProps) => {
  return (
    <>
      <Head>
        <title className={styles.title}>{pageTitle}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <header className={styles.header}>
        <HStack>
          <Image
            src="/favicon.ico"
            alt="Penumbra Logo"
            width={35}
            height={35}
          />
          <Text fontWeight={"bold"}>Dex Explorer</Text>
        </HStack>
        {/* Common header content */}
        <nav>{/* Nav */}</nav>
      </header>
      <main>{children}</main>
      <footer>{/* Footer */}</footer>
    </>
  );
};

export default Layout;
