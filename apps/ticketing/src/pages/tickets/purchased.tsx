/*
  NOTE: This page supports rendering single or multiple purchased tickets based on
  the number of comma separated values that exist in the URL hash:

  - Single ticket: /tickets/purchased#1
  - Multiple tickets: /tickets/purchased#1,2,3
*/

import {
  Button,
  Card,
  Container,
  Flex,
  Grid,
  HR,
  openToast,
  PlaceholderSection,
  Section,
  SvgIcon,
  Text,
  Tooltip,
} from '@near-pagoda/ui';
import { CalendarDots, Clock, DownloadSimple, MapPinArea, Ticket } from '@phosphor-icons/react';
import html2canvas from 'html2canvas';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import QRCode from 'react-qr-code';

import { AddToAppleWallet } from '@/components/AddToAppleWallet';
import { AddToGoogleWallet } from '@/components/AddToGoogleWallet';
import { useDefaultLayout } from '@/hooks/useLayout';
import { usePurchasedTickets } from '@/hooks/usePurchasedTickets';
import { CLOUDFLARE_IPFS } from '@/utils/config';
import { displayEventDate } from '@/utils/date';
import { formatEventIdQueryParam } from '@/utils/event';
import { convertToSafeFilename } from '@/utils/file';
import type { NextPageWithLayout } from '@/utils/types';

const TICKETS_DOM_ID = 'tickets';

const PurchasedTickets: NextPageWithLayout = () => {
  const router = useRouter();
  const [secretKeys, setSecretKeys] = useState<string[]>([]);
  const purchasedTickets = usePurchasedTickets(secretKeys);
  const { event, publisherAccountId, tickets } = purchasedTickets.data ?? {};

  useEffect(() => {
    /*
      NOTE: The secret keys are stored and read from "location.hash" instead of
      a query param to help provide an extra layer of privacy since URI fragments
      are never sent to the server (they're client side only).

      https://en.wikipedia.org/wiki/URI_fragment
    */

    if (typeof window !== 'undefined') {
      const keys = window.location.hash.replace(/^#/, '').split(',');
      setSecretKeys(keys);
    }
  }, [router]);

  const downloadTickets = async () => {
    try {
      if (!event) return;

      document.body.classList.add('html2canvas');

      const element = document.getElementById(TICKETS_DOM_ID)!;
      const canvas = await html2canvas(element, {
        useCORS: true, // Allows rendering of externally hosted event image
      });

      const image = canvas.toDataURL('image/jpeg', 1);
      const downloadLink = document.createElement('a');
      downloadLink.download = convertToSafeFilename(`Tickets for ${event.name}`);
      downloadLink.href = image;
      downloadLink.click();

      setTimeout(() => {
        downloadLink.remove();
        canvas.remove();
      });
    } catch (error) {
      console.error(error);
      openToast({
        type: 'error',
        title: 'Download Failed',
        description: 'Failed to save tickets to device. Please try again later or take a screenshot of your tickets.',
      });
    } finally {
      document.body.classList.remove('html2canvas');
    }
  };

  if (!event || !tickets || !publisherAccountId) {
    return <PlaceholderSection background="primary-gradient" />;
  }

  return (
    <>
      <Head>
        <title>Your Tickets</title>
      </Head>

      <Section
        grow="available"
        background="primary-gradient"
        style={{
          padding: 0,
        }}
      >
        <Container
          id={TICKETS_DOM_ID}
          style={{
            margin: 'auto',
            padding: 'var(--section-padding-x) var(--section-padding-x)',
            maxWidth: 'calc(var(--container-width-s) + (var(--section-padding-x) * 2))',
          }}
        >
          <Flex stack gap="l">
            <Flex align="center">
              <Text as="h3" style={{ marginRight: 'auto' }}>
                {tickets.length > 1 ? `Your ${tickets.length} Tickets` : 'Your Ticket'}
              </Text>

              <Tooltip asChild content="View all event details">
                <Button
                  label="View Event"
                  icon={<CalendarDots />}
                  size="small"
                  href={`/events/${formatEventIdQueryParam(publisherAccountId, event.id)}`}
                  target="_blank"
                  data-html2canvas-ignore
                />
              </Tooltip>
            </Flex>

            <HR style={{ margin: 0 }} />

            <Grid columns="2fr 1fr" align="center">
              <Flex stack gap="xs">
                <Text size="text-s" color="sand12" weight={600}>
                  {event.name}
                </Text>

                <Flex align="center" gap="s">
                  <SvgIcon icon={<MapPinArea />} size="xs" data-html2canvas-ignore />
                  <Text size="text-xs">{event.location}</Text>
                </Flex>

                <Flex align="center" gap="s">
                  <SvgIcon icon={<Clock />} size="xs" data-html2canvas-ignore />
                  <Text size="text-xs">{displayEventDate(event).dateAndTime}</Text>
                </Flex>
              </Flex>

              {event.artwork && (
                <img
                  src={`${CLOUDFLARE_IPFS}/${event.artwork}`}
                  alt={event.name}
                  style={{ borderRadius: '6px', boxShadow: '0 0 0 1px var(--blackA3)' }}
                />
              )}
            </Grid>

            <Flex data-html2canvas-ignore stretch wrap>
              <AddToAppleWallet data={purchasedTickets.data} />
              <AddToGoogleWallet data={purchasedTickets.data} />

              <Tooltip
                content="Save your tickets to your device to access them offline"
                asChild
                data-html2canvas-ignore
              >
                <Button
                  icon={<DownloadSimple />}
                  label="Download"
                  size="small"
                  variant="affirmative"
                  onClick={downloadTickets}
                  style={{ marginLeft: 'auto' }}
                />
              </Tooltip>
            </Flex>

            <Flex stack>
              {tickets.map((ticket, i) => (
                <Card key={ticket.secretKey}>
                  <Grid columns="1fr 1fr" columnsPhone="1fr" align="center">
                    <QRCode
                      size={256}
                      style={{ height: 'auto', maxWidth: '100%', width: '100%' }}
                      value={ticket.secretKey}
                      viewBox={`0 0 256 256`}
                    />

                    <Flex stack style={{ textAlign: 'center' }} align="center">
                      <SvgIcon icon={<Ticket weight="duotone" />} color="sand10" size="m" />

                      <Flex stack gap="s">
                        <Text size="text-xs" weight={600}>
                          Ticket {i + 1} of {tickets.length}
                        </Text>

                        <Text size="text-s" color="sand12" weight={600}>
                          {ticket.title}
                        </Text>

                        {ticket.description && <Text size="text-xs">{ticket.description}</Text>}
                      </Flex>
                    </Flex>
                  </Grid>
                </Card>
              ))}
            </Flex>
          </Flex>
        </Container>
      </Section>
    </>
  );
};

PurchasedTickets.getLayout = useDefaultLayout;

export default PurchasedTickets;
