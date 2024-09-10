/* eslint-disable -- disabling this file as this was created before our strict rules */
export default function Home() {
  return null;
}

export async function getServerSideProps() {
  return {
    redirect: {
      destination: '/trade',
    },
  };
}
