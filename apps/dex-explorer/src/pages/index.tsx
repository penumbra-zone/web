import styles from "@/Home.module.css";
import Layout from "../components/layout";

export const routes = [
  { path: "/lp/utils" },
  { path: "/lp/<NFT_ID>" },
  {
    path: "/pair/<BASE_TOKEN_NAME>:<QUOTE_TOKEN_NAME>",
  },
];

export default function Home() {
  return (
    <Layout pageTitle="Penumbra Dex Explorer">
      <div className={styles.container}>
        <main className={styles.main}>
          <h1>Penumbra Dex Explorer</h1>
          <ul>
            {routes.map((route, index) => (
              <li key={index}>
                <a
                  href={route.path}
                  style={{
                    textDecoration: "underline",
                    color: "var(--complimentary-background)",
                    display: "flex",
                    fontSize: "small",
                    fontFamily: "monospace",
                  }}
                >
                  {route.path}
                </a>
              </li>
            ))}
          </ul>
        </main>
      </div>
    </Layout>
  );
}
