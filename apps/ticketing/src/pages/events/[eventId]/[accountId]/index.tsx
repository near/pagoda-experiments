import { Button } from '@pagoda/ui/src/components/Button';
import { Card } from '@pagoda/ui/src/components/Card';
import { Container } from '@pagoda/ui/src/components/Container';
import { Flex } from '@pagoda/ui/src/components/Flex';
import { Grid } from '@pagoda/ui/src/components/Grid';
import { HR } from '@pagoda/ui/src/components/HorizontalRule';
import { PlaceholderSection } from '@pagoda/ui/src/components/Placeholder';
import { Section } from '@pagoda/ui/src/components/Section';
import { SvgIcon } from '@pagoda/ui/src/components/SvgIcon';
import { Text } from '@pagoda/ui/src/components/Text';
import { openToast } from '@pagoda/ui/src/components/Toast';
import { Tooltip } from '@pagoda/ui/src/components/Tooltip';
import { CalendarDots, Clock, DownloadSimple, MapPinArea, Ticket } from '@phosphor-icons/react';
import html2canvas from 'html2canvas';
import Head from 'next/head';
import { useRouter } from 'next/router';
import QRCode from 'react-qr-code';

import { AddToAppleWallet } from '@/components/AddToAppleWallet';
import { AddToGoogleWallet } from '@/components/AddToGoogleWallet';
import { useEvent } from '@/hooks/useEvents';
import { useDefaultLayout } from '@/hooks/useLayout';
import { CLOUDFLARE_IPFS } from '@/utils/common';
import { displayEventDate } from '@/utils/date';
import { formatEventIdQueryParam, parseEventIdQueryParam } from '@/utils/event-id';
import { convertToSafeFilename } from '@/utils/file';
import type { EventAccount, NextPageWithLayout } from '@/utils/types';

const TICKETS_DOM_ID = 'tickets';

const PurchasedTickets: NextPageWithLayout = () => {
  const router = useRouter();
  const { publisherAccountId, eventId } = parseEventIdQueryParam(router.query.eventId);
  const accountId = router.query.accountId as string;
  const event = useEvent(publisherAccountId, eventId);

  console.log('TODO: Fetch account/ticket details', accountId);

  const account: EventAccount = {
    id: '1',
    tickets: [
      {
        id: 'a0fd96f4-12a5-4a92-882d-7b68609f8420', // Random, dummy UUID
        tier: 'Premium Seating',
      },
      {
        id: 'd7d2fc4e-c978-4b0d-93b1-3e57de9c92aa', // Random, dummy UUID
        tier: 'General Admission',
      },
    ],
  };

  const downloadTickets = async () => {
    try {
      if (!event.data) return;

      document.body.classList.add('html2canvas');

      const element = document.getElementById(TICKETS_DOM_ID)!;
      const canvas = await html2canvas(element, {
        useCORS: true, // Allows rendering of externally hosted event image
      });

      const image = canvas.toDataURL('image/jpeg', 1);
      const downloadLink = document.createElement('a');
      downloadLink.download = convertToSafeFilename(`Tickets for ${event.data.name}`);
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

  if (!event.data) {
    return <PlaceholderSection />;
  }

  return (
    <>
      <Head>
        <title>Your Tickets</title>
      </Head>

      <Section
        grow="available"
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
                {account.tickets.length > 1 ? `Your ${account.tickets.length} Tickets` : 'Your Ticket'}
              </Text>

              <Tooltip asChild content="View all event details">
                <Button
                  label="View Event"
                  icon={<CalendarDots />}
                  size="small"
                  href={`/events/${formatEventIdQueryParam(publisherAccountId, eventId)}`}
                  target="_blank"
                  data-html2canvas-ignore
                />
              </Tooltip>
            </Flex>

            <Grid columns="2fr 1fr" align="center">
              <Flex stack gap="xs">
                <Text size="text-s" color="sand12" weight={600}>
                  {event.data.name}
                </Text>

                <Flex align="center" gap="s">
                  <SvgIcon icon={<MapPinArea />} size="xs" data-html2canvas-ignore />
                  <Text size="text-xs">{event.data.location}</Text>
                </Flex>

                <Flex align="center" gap="s">
                  <SvgIcon icon={<Clock />} size="xs" data-html2canvas-ignore />
                  <Text size="text-xs">{displayEventDate(event.data)?.dateAndTime}</Text>
                </Flex>
              </Flex>

              {event.data.artwork && (
                <img
                  src={`${CLOUDFLARE_IPFS}/${event.data.artwork}`}
                  alt={event.data.name}
                  style={{ borderRadius: '6px' }}
                />
              )}
            </Grid>

            <HR style={{ margin: 0 }} />

            <Flex data-html2canvas-ignore stretch wrap>
              <Tooltip
                content="Save your tickets to your device to access them offline"
                asChild
                data-html2canvas-ignore
              >
                <Button
                  icon={<DownloadSimple />}
                  label="Download"
                  size="small"
                  variant="primary"
                  fill="outline"
                  onClick={downloadTickets}
                  style={{ marginRight: 'auto' }}
                />
              </Tooltip>

              <AddToAppleWallet
                href={`/api/apple-wallet/generate-event-pass?accountId=${accountId}&eventId=${formatEventIdQueryParam(publisherAccountId, eventId)}`}
              />

              <AddToGoogleWallet
                href={`/api/google-wallet/generate-event-pass?accountId=${accountId}&eventId=${formatEventIdQueryParam(publisherAccountId, eventId)}`}
              />
            </Flex>

            <Flex stack>
              {account.tickets.map((ticket, i) => (
                <Card key={ticket.id}>
                  <Grid columns="1fr 1fr" columnsPhone="1fr" align="center">
                    <QRCode
                      size={256}
                      style={{ height: 'auto', maxWidth: '100%', width: '100%' }}
                      value={ticket.id}
                      viewBox={`0 0 256 256`}
                    />

                    <Flex stack style={{ textAlign: 'center' }} align="center">
                      <SvgIcon icon={<Ticket weight="thin" />} color="sand10" size="m" />

                      <Flex stack gap="s">
                        <Text size="text-xs" weight={600}>
                          Ticket #{i + 1}
                        </Text>

                        <Text size="text-s" color="sand12" weight={600}>
                          {ticket.tier}
                        </Text>

                        <Text size="text-xs">{ticket.id}</Text>
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
