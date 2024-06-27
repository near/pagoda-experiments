import { Button } from '@pagoda/ui/src/components/Button';
import { Container } from '@pagoda/ui/src/components/Container';
import { Flex } from '@pagoda/ui/src/components/Flex';
import { Grid } from '@pagoda/ui/src/components/Grid';
import { HR } from '@pagoda/ui/src/components/HorizontalRule';
import { MetaTags } from '@pagoda/ui/src/components/MetaTags';
import { Section } from '@pagoda/ui/src/components/Section';
import { SvgIcon } from '@pagoda/ui/src/components/SvgIcon';
import { Text } from '@pagoda/ui/src/components/Text';
import { Tooltip } from '@pagoda/ui/src/components/Tooltip';
import { copyTextToClipboard } from '@pagoda/ui/src/utils/clipboard';
import { Clock, Link, MapPinArea, Pencil, Ticket } from '@phosphor-icons/react';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { useRouter } from 'next/router';

import { useDefaultLayout } from '@/hooks/useLayout';
import { useWalletStore } from '@/stores/wallet';
import { CLOUDFLARE_IPFS } from '@/utils/common';
import { HOSTNAME } from '@/utils/config';
import { displayEventDate } from '@/utils/date';
import { parseEventIdQueryParam } from '@/utils/event-id';
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

      <Section grow="available">
        <Grid
          columns={event.artwork ? '1fr 1fr' : '1fr'}
          columnsTablet="1fr"
          align="center"
          gap="l"
          style={{ margin: 'auto', maxWidth: event.artwork ? undefined : 'var(--container-width-m)' }}
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
                    copyTextToClipboard(`${HOSTNAME}/events/${router.query.eventId}`, 'Shareable event URL');
                  }}
                  size="small"
                />
              </Tooltip>

              {canEditEvent && (
                <Tooltip content="Edit your event" asChild>
                  <Button
                    size="small"
                    label="Edit Event"
                    icon={<Pencil />}
                    href={`/events/${router.query.eventId}/edit`}
                  />
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
                <Text color="sand12">{displayEventDate(event)?.dateAndTime}</Text>
              </Flex>
            </Flex>

            {event.description && <Text>{event.description}</Text>}

            <HR style={{ margin: 0 }} />

            <Flex align="center" wrap>
              <Button
                iconLeft={<Ticket />}
                // label={`Get Tickets (${event.ticketPrice ? formatDollar(event.ticketPrice) : 'Free'})`} // TODO: Fetch and show ticket price
                label="Get Tickets"
                variant="affirmative"
                style={{ marginRight: 'auto' }}
              />

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
            <img src={`${CLOUDFLARE_IPFS}/${event.artwork}`} alt={event.name} style={{ borderRadius: '6px' }} />
          )}
        </Grid>
      </Section>
    </>
  );
};

EventDetails.getLayout = useDefaultLayout;

export default EventDetails;
