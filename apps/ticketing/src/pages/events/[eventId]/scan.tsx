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
import { useMutation } from '@tanstack/react-query';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useRef } from 'react';

import { QrCodeScanner } from '@/components/QrCodeScanner';
import { useEvent } from '@/hooks/useEvents';
import { useDefaultLayout } from '@/hooks/useLayout';
import { fetchDetailsForPurchasedTicket } from '@/hooks/usePurchasedTickets';
import { useNearStore } from '@/stores/near';
import { displayEventDate } from '@/utils/date';
import { parseEventIdQueryParam } from '@/utils/event-id';
import { NextPageWithLayout } from '@/utils/types';

const ScanEventTickets: NextPageWithLayout = () => {
  const router = useRouter();
  const { publisherAccountId, eventId } = parseEventIdQueryParam(router.query.eventId);
  const event = useEvent(publisherAccountId, eventId);
  const viewAccount = useNearStore((store) => store.viewAccount);
  const verifiedSecretKeys = useRef<string[]>([]);

  const verifyMutation = useMutation({
    mutationFn: async (secretKey: string): Promise<{ isVerified: boolean; message?: string }> => {
      console.log('Verifying secret key...', secretKey);

      try {
        const hasBeenVerified = verifiedSecretKeys.current.includes(secretKey);

        if (hasBeenVerified) {
          // Return early before making any API requests if we know we've already scanned the ticket
          return {
            isVerified: true,
            message: 'Ticket has already been scanned',
          };
        }

        const details = await fetchDetailsForPurchasedTicket(secretKey, viewAccount);
        const matchesEvent = details.extra.eventId === eventId;
        const hasBeenUsed = details.usesRemaining !== 2; // This logic was copied from Keypom. Not sure why we check against 2 instead of checking greater than 0...

        if (hasBeenUsed) {
          return {
            isVerified: true,
            message: 'Ticket has already been scanned',
          };
        }

        if (!matchesEvent) {
          return {
            isVerified: false,
            message: 'Ticket is not associated with current event',
          };
        }

        return {
          isVerified: true,
        };
      } catch (error) {
        console.error(error);
      }

      return {
        isVerified: false,
        message: 'Failed to load ticket information',
      };
    },
  });

  const onScanSuccess = async (secretKey: string) => {
    const { isVerified, message } = await verifyMutation.mutateAsync(secretKey);

    if (isVerified) {
      openToast({
        type: 'success',
        title: 'Ticket Verified',
        description: message,
        duration: 1000,
      });
    } else {
      openToast({
        type: 'error',
        title: 'Invalid Ticket',
        description: message,
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
              <QrCodeScanner onScanSuccess={onScanSuccess} processing={verifyMutation.isPending} />

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
