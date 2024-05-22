import '@pagoda/ui/src/styles/reset.css';
import '@pagoda/ui/src/styles/theme.css';
import '@pagoda/ui/src/styles/globals.css';

import { Toaster } from '@pagoda/ui/src/components/Toast';
import type { AppProps } from 'next/app';
import Head from 'next/head';

import type { NextPageWithLayout } from '@/types/next';

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

export default function App({ Component, pageProps }: AppPropsWithLayout) {
  const getLayout = Component.getLayout ?? ((page) => page);

  return (
    <>
      <Head>
        <link rel="icon" href="favicon.ico" />
        <link rel="manifest" href="manifest.json" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />

        <title>NFT Ticketing</title>
      </Head>

      {getLayout(<Component {...pageProps} />)}

      <Toaster />
    </>
  );
}
