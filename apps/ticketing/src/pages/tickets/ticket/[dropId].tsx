/*
  NOTE: This page implements a simple redirect for the URL that's sent via Keypom's email worker. 
  We might need to end up deploying our own email worker to further customize behavior, but this 
  redirect will allow us to keep using their worker in the mean time.
*/

import { Section } from '@near-pagoda/ui';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

import { useDefaultLayout } from '@/hooks/useLayout';
import type { NextPageWithLayout } from '@/utils/types';

const RedirectToPurchasedTickets: NextPageWithLayout = () => {
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const secretKey = window.location.hash.replace(/^#/, '');
      router.replace(`/tickets/purchased#${secretKey}`);
    }
  }, [router]);

  return (
    <>
      <Head>
        <title>Your Tickets</title>
      </Head>

      <Section grow="available" background="primary-gradient" />
    </>
  );
};

RedirectToPurchasedTickets.getLayout = useDefaultLayout;

export default RedirectToPurchasedTickets;
