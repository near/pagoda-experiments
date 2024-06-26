import { Button } from '@pagoda/ui/src/components/Button';
import { Card } from '@pagoda/ui/src/components/Card';
import { Container } from '@pagoda/ui/src/components/Container';
import { Flex } from '@pagoda/ui/src/components/Flex';
import { HR } from '@pagoda/ui/src/components/HorizontalRule';
import { PlaceholderSection } from '@pagoda/ui/src/components/Placeholder';
import { Section } from '@pagoda/ui/src/components/Section';
import { SvgIcon } from '@pagoda/ui/src/components/SvgIcon';
import { Text } from '@pagoda/ui/src/components/Text';
import { openToast } from '@pagoda/ui/src/components/Toast';
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
    return <PlaceholderSection />;
  }

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
