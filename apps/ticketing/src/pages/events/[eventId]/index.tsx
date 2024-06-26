import { Button } from '@pagoda/ui/src/components/Button';
import { Flex } from '@pagoda/ui/src/components/Flex';
import { Grid } from '@pagoda/ui/src/components/Grid';
import { HR } from '@pagoda/ui/src/components/HorizontalRule';
import { MetaTags } from '@pagoda/ui/src/components/MetaTags';
import { PlaceholderSection } from '@pagoda/ui/src/components/Placeholder';
import { Section } from '@pagoda/ui/src/components/Section';
import { SvgIcon } from '@pagoda/ui/src/components/SvgIcon';
import { Text } from '@pagoda/ui/src/components/Text';
import { Tooltip } from '@pagoda/ui/src/components/Tooltip';
import { copyTextToClipboard } from '@pagoda/ui/src/utils/clipboard';
import { Clock, Link, MapPinArea, Pencil, Ticket } from '@phosphor-icons/react';
import { useRouter } from 'next/router';

import { useEvent } from '@/hooks/useEvents';
import { useDefaultLayout } from '@/hooks/useLayout';
import { useWalletStore } from '@/stores/wallet';
import { CLOUDFLARE_IPFS } from '@/utils/common';
import { HOSTNAME } from '@/utils/config';
import { displayEventDate } from '@/utils/date';
import { parseEventIdQueryParam } from '@/utils/event-id';
import type { EventDetails, NextPageWithLayout } from '@/utils/types';

const EventDetails: NextPageWithLayout = () => {
  const router = useRouter();
  const { publisherAccountId, eventId } = parseEventIdQueryParam(router.query.eventId);
  const event = useEvent(publisherAccountId, eventId);
  const account = useWalletStore((store) => store.account);
  const canEditEvent = account?.accountId === publisherAccountId;

  if (!event.data) {
    return <PlaceholderSection />;
  }

  return (
    <>
      {/* NOTE: We'll need to make sure the event details are loaded on the server side to properly support social share previews for this event */}

      <MetaTags
        title={event.data.name}
        description={`${event.data.location} on ${displayEventDate(event.data)?.dateAndTime}`}
        image={event.data.artwork ? `${CLOUDFLARE_IPFS}/${event.data.artwork}` : undefined}
      />

      <Section grow="available">
        <Grid
          columns={event.data.artwork ? '1fr 1fr' : '1fr'}
          columnsTablet="1fr"
          align="center"
          gap="xl"
          gapTablet="l"
          style={{ margin: 'auto', maxWidth: event.data.artwork ? undefined : 'var(--container-width-m)' }}
        >
          <Flex stack gap="l">
            <Flex align="center">
              <Text as="h4" style={{ marginRight: 'auto' }}>
                {event.data.name}
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
                <Text color="sand12">{event.data.location}</Text>
              </Flex>

              <Flex align="center" gap="s">
                <SvgIcon icon={<Clock />} />
                <Text color="sand12">{displayEventDate(event.data)?.dateAndTime}</Text>
              </Flex>
            </Flex>

            {event.data.description && <Text>{event.data.description}</Text>}

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

          {event.data.artwork && (
            <img
              src={`${CLOUDFLARE_IPFS}/${event.data.artwork}`}
              alt={event.data.name}
              style={{ borderRadius: '6px' }}
            />
          )}
        </Grid>
      </Section>
    </>
  );
};

EventDetails.getLayout = useDefaultLayout;

export default EventDetails;
