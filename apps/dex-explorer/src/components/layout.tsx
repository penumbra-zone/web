// components/Layout.js

import Head from "next/head";
import styles from "@/Home.module.css";
import { Navbar } from "./navbar";
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
      <header className={styles.header} >
        <Navbar/>
      </header>
      <main>{children}</main>
      <footer>{/* Footer */}</footer>
    </>
  );
};

export default Layout;
