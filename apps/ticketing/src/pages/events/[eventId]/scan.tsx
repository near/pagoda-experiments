import {
  Button,
  Card,
  Container,
  Flex,
  HR,
  openToast,
  PlaceholderSection,
  Section,
  SvgIcon,
  Text,
} from '@near-pagoda/ui';
import { CalendarDots, Clock, QrCode } from '@phosphor-icons/react';
import Head from 'next/head';
import { useRouter } from 'next/router';

import { QrCodeScanner } from '@/components/QrCodeScanner';
import { useEvent } from '@/hooks/useEvents';
import { useDefaultLayout } from '@/hooks/useLayout';
import { displayEventDate } from '@/utils/date';
import { parseEventIdQueryParam } from '@/utils/event-id';
import { NextPageWithLayout } from '@/utils/types';

const ScanEventTickets: NextPageWithLayout = () => {
  const router = useRouter();
  const { publisherAccountId, eventId } = parseEventIdQueryParam(router.query.eventId);
  const event = useEvent(publisherAccountId, eventId);

  const onScanSuccess = (data: string) => {
    console.log(`TODO: Verify ticket is valid for current event: ${data}`);

    const isValid = true;

    if (isValid) {
      openToast({
        type: 'success',
        title: 'Ticket Verified',
        description: data,
        duration: 1000,
      });
    } else {
      openToast({
        type: 'error',
        title: 'Invalid Ticket',
        description: data,
        duration: 1000,
      });
    }
  };

  if (!event.data) {
    return <PlaceholderSection background="primary-gradient" />;
  }

  return (
    <>
      <Head>
        <title>Scan Tickets</title>
      </Head>

      <Section background="primary-gradient" grow="available">
        <Container size="s" style={{ margin: 'auto' }}>
          <Flex stack gap="l">
            <Flex align="center">
              <SvgIcon icon={<QrCode />} color="sand12" size="m" />
              <Text as="h3" style={{ marginRight: 'auto' }}>
                Scan Tickets
              </Text>
              <Button
                label="View Event"
                icon={<CalendarDots />}
                size="small"
                href={`/events/${router.query.eventId}`}
                target="_blank"
              />
            </Flex>

            <Card>
              <QrCodeScanner onScanSuccess={onScanSuccess} />

              <HR style={{ margin: 0 }} />

              <Flex stack gap="none">
                <Text size="text-s" color="sand12" weight={600}>
                  {event.data.name}
                </Text>

                <Flex align="center" gap="s">
                  <SvgIcon icon={<Clock />} size="xs" />
                  <Text size="text-s">{displayEventDate(event.data)?.dateAndTime}</Text>
                </Flex>
              </Flex>
            </Card>
          </Flex>
        </Container>
      </Section>
    </>
  );
};

ScanEventTickets.getLayout = useDefaultLayout;

export default ScanEventTickets;
