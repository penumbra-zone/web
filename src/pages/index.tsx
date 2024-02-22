import Head from "next/head";
import styles from "@/Home.module.css";

export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title>Penumbra Dex Explorer</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1>Penumbra Dex Explorer</h1>
      </main>
    </div>
  );
}
