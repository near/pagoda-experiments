import { Button } from '@pagoda/ui/src/components/Button';
import { Flex } from '@pagoda/ui/src/components/Flex';
import { Grid } from '@pagoda/ui/src/components/Grid';
import { HR } from '@pagoda/ui/src/components/HorizontalRule';
import { MetaTags } from '@pagoda/ui/src/components/MetaTags';
import { Section } from '@pagoda/ui/src/components/Section';
import { SvgIcon } from '@pagoda/ui/src/components/SvgIcon';
import { Text } from '@pagoda/ui/src/components/Text';
import { Tooltip } from '@pagoda/ui/src/components/Tooltip';
import { copyTextToClipboard } from '@pagoda/ui/src/utils/clipboard';
import { formatDollar } from '@pagoda/ui/src/utils/number';
import {
  Clock,
  FacebookLogo,
  Globe,
  Link,
  MapPinArea,
  Pencil,
  Ticket,
  XLogo,
  YoutubeLogo,
} from '@phosphor-icons/react';
import Head from 'next/head';
import { useRouter } from 'next/router';

import { useDefaultLayout } from '@/hooks/useLayout';
import { useWalletStore } from '@/stores/wallet';
import { HOSTNAME } from '@/utils/config';
import { displayEventDate } from '@/utils/date';
import type { EventDetails, NextPageWithLayout } from '@/utils/types';

const EventDetails: NextPageWithLayout = () => {
  const router = useRouter();
  const eventId = router.query.eventId as string;
  const account = useWalletStore((store) => store.account);
  const canEditEvent = !!account; // TODO: Determine when the signed in wallet owns the wallet

  const event: EventDetails = {
    id: 1,
    name: 'Some Cool Event Name',
    location: '1234 W Cool St, Denver, CO',
    date: '2024-10-14',
    startTime: '19:00',
    endTime: '22:00',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
    imageUrl: `${HOSTNAME}/images/hero-background.jpg`,
    links: {
      facebook: 'https://facebook.com',
      website: 'https://google.com',
      x: 'https://x.com',
      youTube: 'https://youtube.com',
    },
    tickets: {
      available: 20,
      sold: 30,
      total: 50,
    },
    ticketPrice: 10,
    ticketQuantityLimit: 3,
  };

  return (
    <>
      <Head>
        <title>{event.name}</title>
      </Head>

      <MetaTags
        title={event.name}
        description={`${event.location} on ${displayEventDate(event)?.date}${event.startTime ? ` at ${displayEventDate(event)?.time}` : undefined}`}
        image={event.imageUrl}
      />

      <Section grow="available">
        <Grid
          columns={event.imageUrl ? '1fr 1fr' : '1fr'}
          columnsTablet="1fr"
          align="center"
          gap="xl"
          gapTablet="l"
          style={{ margin: 'auto', maxWidth: event.imageUrl ? undefined : 'var(--container-width-m)' }}
        >
          <Flex stack gap="l">
            <Flex align="center">
              <Text as="h4" style={{ marginRight: 'auto' }}>
                {event.name}
              </Text>

              <Tooltip content="Copy shareable event link" asChild>
                <Button
                  label="Copy Event Link"
                  fill="outline"
                  icon={<Link weight="bold" />}
                  onClick={(click) => {
                    click.stopPropagation();
                    copyTextToClipboard(`${HOSTNAME}/events/${event.id}`);
                  }}
                  size="small"
                />
              </Tooltip>

              {canEditEvent && (
                <Tooltip content="Edit your event" asChild>
                  <Button size="small" label="Edit Event" icon={<Pencil />} href={`/events/${eventId}/edit`} />
                </Tooltip>
              )}
            </Flex>

            <Flex stack>
              <Flex align="center" gap="s">
                <SvgIcon icon={<MapPinArea />} />
                <Text color="sand12">{event.location}</Text>
              </Flex>

              <Flex align="center" gap="s">
                <SvgIcon icon={<Clock />} />
                <Text color="sand12">
                  {displayEventDate(event)?.date}
                  {event.startTime ? ` at ${displayEventDate(event)?.time}` : undefined}
                </Text>
              </Flex>
            </Flex>

            {event.description && <Text>{event.description}</Text>}

            <HR style={{ margin: 0 }} />

            <Flex align="center" wrap>
              <Button
                iconLeft={<Ticket />}
                label={`Get Tickets (${event.ticketPrice ? formatDollar(event.ticketPrice) : 'Free'})`}
                variant="affirmative"
                style={{ marginRight: 'auto' }}
              />

              {event.links && (
                <Flex gap="xs" align="center">
                  {event.links.facebook && (
                    <Button
                      label="Facebook"
                      variant="secondary"
                      fill="ghost"
                      icon={<FacebookLogo weight="bold" />}
                      href={event.links.facebook}
                      target="_blank"
                    />
                  )}

                  {event.links.x && (
                    <Button
                      label="Twitter / X"
                      variant="secondary"
                      fill="ghost"
                      icon={<XLogo weight="bold" />}
                      href={event.links.x}
                      target="_blank"
                    />
                  )}

                  {event.links.youTube && (
                    <Button
                      label="YouTube"
                      fill="ghost"
                      variant="secondary"
                      icon={<YoutubeLogo weight="bold" />}
                      href={event.links.youTube}
                      target="_blank"
                    />
                  )}

                  {event.links.website && (
                    <Button
                      label="Website"
                      variant="secondary"
                      fill="ghost"
                      icon={<Globe weight="bold" />}
                      href={event.links.website}
                      target="_blank"
                    />
                  )}
                </Flex>
              )}
            </Flex>
          </Flex>

          {event.imageUrl && <img src={event.imageUrl} alt={event.name} style={{ borderRadius: '6px' }} />}
        </Grid>
      </Section>
    </>
  );
};

EventDetails.getLayout = useDefaultLayout;

export default EventDetails;
