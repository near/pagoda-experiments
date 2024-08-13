import '@near-pagoda/ui/globals.css';
import '@near-pagoda/ui/theme.css';
import '@near-pagoda/ui/lib.css';
import '@near-wallet-selector/modal-ui/styles.css';

import { PagodaUiProvider, Toaster } from '@near-pagoda/ui';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
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
  const router = useRouter();

  const getLayout = Component.getLayout ?? ((page) => page);
  useEffect(() => {
    const handleShowWalletSelector = (e: MessageEvent<{ showWalletSelector: boolean }>) => {
      if (e.data.showWalletSelector) {
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
        <PagodaUiProvider
          value={{
            routerPrefetch: router.prefetch,
            routerPush: router.push,
            Link,
          }}
        >
          <Head>
            <link rel="icon" href="favicon.ico" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <title>Ticketing</title>
          </Head>

          {getLayout(<Component {...pageProps} />)}

          <Toaster />
        </PagodaUiProvider>
      </QueryClientProvider>
    </>
  );
}
