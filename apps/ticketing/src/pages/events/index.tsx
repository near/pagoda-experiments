import {
  Badge,
  Button,
  copyTextToClipboard,
  Dropdown,
  Flex,
  Section,
  SvgIcon,
  Table,
  Text,
  Tooltip,
  unreachable,
} from '@near-pagoda/ui';
import { CalendarDots, Link, List, Pencil, Plus, QrCode } from '@phosphor-icons/react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState } from 'react';

import { useDrops } from '@/hooks/useDrops';
import { useEvents } from '@/hooks/useEvents';
import { useProducerLayout } from '@/hooks/useLayout';
import { useWalletStore } from '@/stores/wallet';
import { HOSTNAME } from '@/utils/config';
import { displayEventDate, parseEventDate } from '@/utils/date';
import { formatTicketPrice } from '@/utils/dollar';
import { formatEventIdQueryParam } from '@/utils/event';
import { NextPageWithLayout } from '@/utils/types';

type EventSortType = 'DATE_ASC' | 'DATE_DES';

const Events: NextPageWithLayout = () => {
  const router = useRouter();
  const account = useWalletStore((store) => store.account);
  const publisherAccountId = account?.accountId ?? '';
  const events = useEvents(publisherAccountId);
  const drops = useDrops(publisherAccountId);
  const [sort, setSort] = useState<EventSortType>('DATE_DES');
  const now = new Date();

  if (events.data) {
    switch (sort) {
      case 'DATE_ASC':
        events.data.sort((a, b) => a.date.startDate - b.date.startDate);
        break;
      case 'DATE_DES':
        events.data.sort((a, b) => b.date.startDate - a.date.startDate);
        break;
      default:
        unreachable(sort);
    }
  }

  return (
    <>
      <Head>
        <title>Manage Events</title>
      </Head>

      <Section>
        <Flex align="center">
          <SvgIcon icon={<CalendarDots />} color="sand10" size="m" />

          <Text as="h3" style={{ marginRight: 'auto' }}>
            Manage Events
          </Text>

          <Tooltip content="Create a new event" asChild>
            <Button
              label="Create New Event"
              icon={<Plus weight="bold" />}
              size="small"
              variant="affirmative"
              href="/events/new"
            />
          </Tooltip>
        </Flex>

        <Table.Root>
          <Table.Head>
            <Table.Row>
              <Table.HeaderCell
                sort={sort === 'DATE_DES' ? 'descending' : 'ascending'}
                onClick={() => setSort(sort === 'DATE_DES' ? 'DATE_ASC' : 'DATE_DES')}
              >
                Date & Time
              </Table.HeaderCell>
              <Table.HeaderCell>Name & Location</Table.HeaderCell>
              <Table.HeaderCell>Tickets</Table.HeaderCell>
              <Table.HeaderCell></Table.HeaderCell>
              <Table.HeaderCell></Table.HeaderCell>
            </Table.Row>
          </Table.Head>

          <Table.Body>
            {!events.data && <Table.PlaceholderRows />}

            {events.data?.length === 0 && (
              <Table.Row>
                <Table.Cell colSpan={100}>No events have been created yet.</Table.Cell>
              </Table.Row>
            )}

            {events.data?.map((event) => (
              <Table.Row
                key={event.id}
                onClick={() => router.push(`/events/${formatEventIdQueryParam(publisherAccountId, event.id)}`)}
              >
                <Table.Cell style={{ minWidth: '9rem' }}>
                  <Flex stack align="start" gap="none">
                    <Text size="text-xs" weight={600} color="sand12">
                      {displayEventDate(event)?.date}
                    </Text>
                    {event.date.startTime && <Text size="text-xs">{displayEventDate(event)?.time}</Text>}
                  </Flex>
                </Table.Cell>

                <Table.Cell wrap style={{ minWidth: '13rem' }}>
                  <Flex stack align="start" gap="none">
                    <Text size="text-xs" weight={600} color="sand12" clampLines={1}>
                      {event.name}
                    </Text>
                    <Text size="text-xs" clampLines={1}>
                      {event.location}
                    </Text>
                  </Flex>
                </Table.Cell>

                <Table.Cell>
                  <Flex gap="s">
                    {drops.data?.[event.id]?.map((drop) => (
                      <Tooltip
                        key={drop.drop_id}
                        root={{ disableHoverableContent: true }}
                        content={
                          <Flex stack gap="xs">
                            <Text size="text-xs" weight={600} color="sand12">
                              {drop.ticket.title}
                            </Text>

                            <Flex wrap gap="s">
                              <Text size="text-xs">
                                Sold: <b>{drop.ticket.sold ?? 0}</b>
                              </Text>

                              <Text size="text-xs">
                                Total: <b>{drop.ticket.extra?.maxSupply ?? 0}</b>
                              </Text>

                              <Text size="text-xs">
                                Limit: <b>{drop.ticket.extra?.limitPerUser ?? 0}</b>
                              </Text>

                              <Text size="text-xs">
                                Price: <b>{formatTicketPrice(drop.ticket.extra?.priceFiat)}</b>
                              </Text>
                            </Flex>
                          </Flex>
                        }
                      >
                        <Badge
                          label={
                            <>
                              {drop.ticket.sold ?? 0} / {drop.ticket.extra?.maxSupply ?? 0}
                            </>
                          }
                        />
                      </Tooltip>
                    ))}
                  </Flex>
                </Table.Cell>

                <Table.Cell>
                  {parseEventDate(event).getTime() - now.getTime() > 0 && <Badge label="Upcoming" variant="success" />}
                  {parseEventDate(event).getTime() - now.getTime() < 0 && <Badge label="Past" variant="neutral" />}
                </Table.Cell>

                <Table.Cell style={{ width: '1px' }} onClick={(click) => click.stopPropagation()}>
                  <Flex gap="s">
                    <Tooltip content="Edit event details" asChild>
                      <Button
                        label="Edit Event"
                        fill="outline"
                        icon={<Pencil />}
                        size="small"
                        href={`/events/${formatEventIdQueryParam(publisherAccountId, event.id)}/edit`}
                      />
                    </Tooltip>

                    <Dropdown.Root>
                      <Dropdown.Trigger asChild>
                        <Button label="Other Event Actions" fill="outline" icon={<List />} size="small" />
                      </Dropdown.Trigger>

                      <Dropdown.Content>
                        <Dropdown.Section>
                          <Dropdown.Item href={`/events/${formatEventIdQueryParam(publisherAccountId, event.id)}`}>
                            <SvgIcon icon={<CalendarDots />} />
                            View Event
                          </Dropdown.Item>

                          <Dropdown.Item
                            onSelect={() =>
                              copyTextToClipboard(
                                `${HOSTNAME}/events/${formatEventIdQueryParam(publisherAccountId, event.id)}`,
                                'Shareable event URL',
                              )
                            }
                          >
                            <SvgIcon icon={<Link />} />
                            Copy Share Link
                          </Dropdown.Item>

                          <Dropdown.Item href={`/events/${formatEventIdQueryParam(publisherAccountId, event.id)}/scan`}>
                            <SvgIcon icon={<QrCode />} />
                            Scan Tickets
                          </Dropdown.Item>
                        </Dropdown.Section>
                      </Dropdown.Content>
                    </Dropdown.Root>
                  </Flex>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </Section>
    </>
  );
};

Events.getLayout = useProducerLayout;

export default Events;
