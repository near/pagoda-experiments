import { Button } from '@pagoda/ui/src/components/Button';
import { Card } from '@pagoda/ui/src/components/Card';
import { Container } from '@pagoda/ui/src/components/Container';
import { Flex } from '@pagoda/ui/src/components/Flex';
import { HR } from '@pagoda/ui/src/components/HorizontalRule';
import { Section } from '@pagoda/ui/src/components/Section';
import { SvgIcon } from '@pagoda/ui/src/components/SvgIcon';
import { Text } from '@pagoda/ui/src/components/Text';
import { openToast } from '@pagoda/ui/src/components/Toast';
import { CalendarDots, Clock, QrCode } from '@phosphor-icons/react';
import Head from 'next/head';
import { useRouter } from 'next/router';

import { QrCodeScanner } from '@/components/QrCodeScanner';
import { useDefaultLayout } from '@/hooks/useLayout';
import { HOSTNAME } from '@/utils/config';
import { displayEventDate } from '@/utils/date';
import { EventDetails, NextPageWithLayout } from '@/utils/types';

const ScanEventTickets: NextPageWithLayout = () => {
  const router = useRouter();
  const eventId = router.query.eventId as string;

  console.log(`TODO: Load data for event ID: ${eventId}`);

  const event: EventDetails = {
    id: '1',
    imageUrl: `${HOSTNAME}/images/hero-background.jpg`,
    name: 'Some Cool Event Name',
    date: '2024-10-14',
    startTime: '19:00',
    endTime: '22:00',
    location: '1234 W Cool St, Denver, CO',
    tickets: {
      available: 20,
      sold: 30,
      total: 50,
    },
    ticketPrice: 10,
    ticketQuantityLimit: 3,
  };

  const onScanSuccess = (data: string) => {
    console.log(`TODO: Verify ticket is valid for current event: ${data} => ${eventId}`);

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

  return (
    <>
      <Head>
        <title>Scan Tickets</title>
      </Head>

      <Section
        grow="available"
        style={{
          background: 'linear-gradient(to bottom right, var(--violet4), var(--cyan3))',
        }}
      >
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
                href={`/events/${event.id}`}
                target="_blank"
              />
            </Flex>

            <Card>
              <QrCodeScanner onScanSuccess={onScanSuccess} />

              <HR style={{ margin: 0 }} />

              <Flex stack gap="none">
                <Text size="text-s" color="sand12" weight={600}>
                  {event.name}
                </Text>

                <Flex align="center" gap="s">
                  <SvgIcon icon={<Clock />} size="xs" />
                  <Text size="text-s">{displayEventDate(event)?.dateAndTime}</Text>
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
