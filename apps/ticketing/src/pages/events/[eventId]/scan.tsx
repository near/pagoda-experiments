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
import { useMutation } from '@tanstack/react-query';
import Head from 'next/head';
import { useRouter } from 'next/router';

import { QrCodeScanner } from '@/components/QrCodeScanner';
import { useEvent } from '@/hooks/useEvents';
import { useDefaultLayout } from '@/hooks/useLayout';
import { useNearStore } from '@/stores/near';
import { verifyAndClaimTicket, VerifyAndClaimTicketResult } from '@/utils/claim';
import { displayEventDate } from '@/utils/date';
import { parseEventIdQueryParam } from '@/utils/event';
import { NextPageWithLayout } from '@/utils/types';

const ScanEventTickets: NextPageWithLayout = () => {
  const router = useRouter();
  const { publisherAccountId, eventId } = parseEventIdQueryParam(router.query.eventId);
  const event = useEvent(publisherAccountId, eventId);
  const viewAccount = useNearStore((store) => store.viewAccount);
  const near = useNearStore((store) => store.near);
  const keyStore = useNearStore((store) => store.keyStore);

  const mutation = useMutation({
    mutationFn: async (secretKey: string): Promise<VerifyAndClaimTicketResult> => {
      try {
        if (!near || !keyStore || !viewAccount) {
          throw new Error('Near connection has not initialized yet');
        }

        return await verifyAndClaimTicket({
          eventId,
          keyStore,
          near,
          secretKey,
          viewAccount,
        });
      } catch (error) {
        console.error(error);
      }

      return {
        isVerified: false,
        message: 'Failed to verify ticket for unknown reason',
      };
    },
  });

  const onScanSuccess = async (secretKey: string) => {
    if (mutation.isPending) return;

    const { isVerified, message } = await mutation.mutateAsync(secretKey);

    if (isVerified) {
      openToast({
        type: 'success',
        title: 'Ticket Verified',
        description: message,
      });
    } else {
      openToast({
        type: 'error',
        title: 'Ticket Verification Failure',
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
              <QrCodeScanner onScanSuccess={onScanSuccess} processing={mutation.isPending} />

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
