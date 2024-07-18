import { useRouter } from 'next/router';
import type { DocsThemeConfig } from 'nextra-theme-docs';

const config: DocsThemeConfig =  {
  logo: <b>Penumbra Web</b>,
  docsRepositoryBase: 'https://github.com/penumbra-zone/web/tree/main/apps/docs',
  project: {
    link: 'https://github.com/penumbra-zone/web',
  },
  chat: {
    link: 'https://discord.gg/hKvkrqa3zC',
  },
  footer: {
    component: null,
  },
  darkMode: true,
  nextThemes: {
    defaultTheme: 'dark',
  },
  useNextSeoProps() {
    const {asPath} = useRouter();
    return {
      titleTemplate: asPath !== '/' ? '%s · Penumbra Web' : 'Penumbra Web',
    };
  },
};

export default config;
