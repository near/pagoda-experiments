import {
  Button,
  Container,
  copyTextToClipboard,
  Flex,
  Grid,
  HR,
  Section,
  SvgIcon,
  Text,
  Tooltip,
} from '@near-pagoda/ui';
import { Clock, ImageSquare, Link, MapPinArea, Pencil, Ticket } from '@phosphor-icons/react';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { useRouter } from 'next/router';

import { MetaTags } from '@/components/MetaTags';
import { useDefaultLayout } from '@/hooks/useLayout';
import { useWalletStore } from '@/stores/wallet';
import { CLOUDFLARE_IPFS } from '@/utils/config';
import { HOSTNAME } from '@/utils/config';
import { displayEventDate } from '@/utils/date';
import { parseEventIdQueryParam } from '@/utils/event';
import { FunderEventMetadata } from '@/utils/helpers';
import { fetchEventFromJsonRpc } from '@/utils/rpc';
import type { EventDetails, NextPageWithLayout } from '@/utils/types';

/*
  NOTE: This page is a bit of an outlier. Due to this particular page being frequently shared
  via social media, it's important to fetch the event data on the server side so that we can
  properly render meta tags to populate dynamic preview content when shared.
*/

export const getServerSideProps = (async (req) => {
  const defaultProps = { props: { event: null } };

  try {
    const { publisherAccountId, eventId } = parseEventIdQueryParam(req.query.eventId);
    const event = await fetchEventFromJsonRpc(publisherAccountId, eventId);
    if (!event) return defaultProps;
    return { props: { event } };
  } catch (error) {
    console.error(error);
  }

  return defaultProps;
}) satisfies GetServerSideProps<{ event: FunderEventMetadata | null }>;

const EventDetails: NextPageWithLayout = ({ event }: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const router = useRouter();
  const { publisherAccountId } = parseEventIdQueryParam(router.query.eventId);
  const account = useWalletStore((store) => store.account);
  const canEditEvent = account?.accountId === publisherAccountId;

  if (!event) {
    return (
      <Section grow="available">
        <Container size="s" style={{ margin: 'auto' }}>
          <Flex stack style={{ textAlign: 'center' }}>
            <Text size="text-l" color="red9">
              Failed to load event
            </Text>
            <Text>
              We {`couldn't`} find the requested event. Please make sure your URL is valid and try again later.
            </Text>
          </Flex>
        </Container>
      </Section>
    );
  }

  return (
    <>
      <MetaTags
        title={event?.name ?? 'Event'}
        description={
          event ? `${event.location} on ${displayEventDate(event)?.dateAndTime}` : 'View details and purchase tickets'
        }
        image={event?.artwork ? `${CLOUDFLARE_IPFS}/${event.artwork}` : undefined}
      />

      <Section grow="available" background="primary-gradient">
        <Grid
          columns={event.artwork ? '1fr 1fr' : '1fr'}
          columnsTablet="1fr"
          align="center"
          gap="l"
          style={{ margin: 'auto', maxWidth: event.artwork ? undefined : 'var(--container-width-m)' }}
          stretch
        >
          <Flex stack gap="l">
            <Flex stack>
              <Flex align="center" gap="s">
                <Text as="h3">{event.name}</Text>
                <Tooltip content="Copy shareable event link" asChild>
                  <Button
                    label="Copy Event Link"
                    fill="ghost"
                    icon={<Link weight="bold" />}
                    onClick={(click) => {
                      click.stopPropagation();
                      copyTextToClipboard(`${HOSTNAME}/events/${router.query.eventId}`, 'Shareable event URL');
                    }}
                    size="small"
                  />
                </Tooltip>
              </Flex>

              {event.description && <Text>{event.description}</Text>}
            </Flex>

            <HR style={{ margin: 0 }} />

            <Flex stack gap="s">
              <Flex align="center" gap="s">
                <SvgIcon icon={<MapPinArea />} color="sand10" />
                <Text color="sand12" size="text-s">
                  {event.location}
                </Text>
              </Flex>

              <Flex align="center" gap="s">
                <SvgIcon icon={<Clock />} color="sand10" />
                <Text color="sand12" size="text-s">
                  {displayEventDate(event)?.dateAndTime}
                </Text>
              </Flex>
            </Flex>

            <Flex align="center" wrap>
              <Button
                iconLeft={<Ticket />}
                href={`/events/${router.query.eventId}/tickets`}
                label="Get Tickets"
                variant="affirmative"
              />

              {canEditEvent && (
                <Tooltip content="Edit your event" asChild>
                  <Button label="Edit Event" icon={<Pencil />} href={`/events/${router.query.eventId}/edit`} />
                </Tooltip>
              )}

              {/* TODO: Ability to attach link info to events */}

              {/* {event.links && (
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
              )} */}
            </Flex>
          </Flex>

          {event.artwork && (
            <div style={{ position: 'relative' }}>
              <img
                src={`${CLOUDFLARE_IPFS}/${event.artwork}`}
                alt={event.name}
                style={{
                  borderRadius: '6px',
                  boxShadow: '0 0 0 1px var(--blackA3)',
                  margin: 'auto',
                }}
              />

              <SvgIcon
                icon={<ImageSquare />}
                color="sand8"
                size="l"
                style={{
                  position: 'absolute',
                  inset: 0,
                  margin: 'auto',
                  zIndex: -1,
                }}
              />
            </div>
          )}
        </Grid>
      </Section>
    </>
  );
};

EventDetails.getLayout = useDefaultLayout;

export default EventDetails;
