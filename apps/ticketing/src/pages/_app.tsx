import '@pagoda/ui/src/styles/reset.css';
import '@pagoda/ui/src/styles/theme.css';
import '@near-wallet-selector/modal-ui/styles.css';
import '@pagoda/ui/src/styles/globals.css';

import { Toaster } from '@pagoda/ui/src/components/Toast';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import { useEffect } from 'react';

import { useNearInitializer } from '@/hooks/useNearInitializer';
import { useWalletInitializer } from '@/hooks/useWalletInitializer';
import { useWalletStore } from '@/stores/wallet';
import type { NextPageWithLayout } from '@/utils/types';

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

const queryClient = new QueryClient();

export default function App({ Component, pageProps }: AppPropsWithLayout) {
  useNearInitializer();
  useWalletInitializer();
  const modal = useWalletStore((store) => store.modal);

  const getLayout = Component.getLayout ?? ((page) => page);
  useEffect(() => {
    const handleShowWalletSelector = (e: MessageEvent<{ showWalletSelector: boolean }>) => {
      console.log('handleShowWalletSelector is firing');
      if (e.data.showWalletSelector) {
        console.log('modal?.show() is firing');
        modal?.show();
      }
    };
    window.addEventListener('message', handleShowWalletSelector, false);
    return () => {
      window.removeEventListener('message', handleShowWalletSelector, false);
    };
  }, [modal]);

  return (
    <>
      <QueryClientProvider client={queryClient}>
        <Head>
          <link rel="icon" href="favicon.ico" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>Ticketing</title>
        </Head>

        {getLayout(<Component {...pageProps} />)}

        <Toaster />
      </QueryClientProvider>
    </>
  );
}
