import { Badge } from '@pagoda/ui/src/components/Badge';
import { Button } from '@pagoda/ui/src/components/Button';
import * as Dropdown from '@pagoda/ui/src/components/Dropdown';
import { Flex } from '@pagoda/ui/src/components/Flex';
import { Section } from '@pagoda/ui/src/components/Section';
import { SvgIcon } from '@pagoda/ui/src/components/SvgIcon';
import * as Table from '@pagoda/ui/src/components/Table';
import { Text } from '@pagoda/ui/src/components/Text';
import { Tooltip } from '@pagoda/ui/src/components/Tooltip';
import { copyTextToClipboard } from '@pagoda/ui/src/utils/clipboard';
import { unreachable } from '@pagoda/ui/src/utils/unreachable';
import { CalendarDots, Link, List, Pencil, Plus, QrCode } from '@phosphor-icons/react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState } from 'react';

import { useProducerLayout } from '@/hooks/useLayout';
import { HOSTNAME } from '@/utils/config';
import { displayEventDate, parseEventDate } from '@/utils/date';
import { EventDetails, NextPageWithLayout } from '@/utils/types';

type EventSortType = 'DATE_ASC' | 'DATE_DES';

const Events: NextPageWithLayout = () => {
  const router = useRouter();
  const [sort, setSort] = useState<EventSortType>('DATE_DES');
  const now = new Date();

  const events: EventDetails[] = [
    {
      id: 1,
      name: 'Some Cool Event Name',
      date: '2024-03-05',
      location: '1234 W Cool St, Denver, CO',
      tickets: {
        available: 20,
        sold: 30,
        total: 50,
      },
    },
    {
      id: 2,
      name: 'Another Event Name',
      location: '3455 S Awesome St, San Francisco, CA',
      date: '2024-10-14',
      startTime: '19:00',
      endTime: '22:00',
      tickets: {
        available: 10,
        sold: 15,
        total: 25,
      },
    },
  ];

  switch (sort) {
    case 'DATE_ASC':
      events.sort((a, b) => parseEventDate(a).getTime() - parseEventDate(b).getTime());
      break;
    case 'DATE_DES':
      events.sort((a, b) => parseEventDate(b).getTime() - parseEventDate(a).getTime());
      break;
    default:
      unreachable(sort);
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
            {!events && <Table.PlaceholderRows />}

            {events?.length === 0 && (
              <Table.Row>
                <Table.Cell colSpan={100}>No events have been created yet.</Table.Cell>
              </Table.Row>
            )}

            {events.map((event) => (
              <Table.Row key={event.id} onClick={() => router.push(`/events/${event.id}`)}>
                <Table.Cell style={{ minWidth: '9rem' }}>
                  <Flex stack align="start" gap="none">
                    <Text size="text-s" weight={600} color="sand12">
                      {displayEventDate(event)?.date}
                    </Text>
                    {event.startTime && <Text size="text-xs">{displayEventDate(event)?.time}</Text>}
                  </Flex>
                </Table.Cell>

                <Table.Cell wrap style={{ minWidth: '13rem' }}>
                  <Flex stack align="start" gap="none">
                    <Text size="text-s" weight={600} color="sand12" clampLines={1}>
                      {event.name}
                    </Text>
                    <Text size="text-xs" clampLines={1}>
                      {event.location}
                    </Text>
                  </Flex>
                </Table.Cell>

                <Table.Cell>
                  <Flex align="center">
                    <Flex stack gap="none">
                      <Text size="text-s" weight={600} color="sand12">
                        {event.tickets.total}
                      </Text>
                      <Text size="text-xs">Total</Text>
                    </Flex>
                    <Flex stack gap="none">
                      <Text size="text-s" weight={600} color="sand12">
                        {event.tickets.sold}
                      </Text>
                      <Text size="text-xs">Sold</Text>
                    </Flex>
                    <Flex stack gap="none">
                      <Text size="text-s" weight={600} color="sand12">
                        {event.tickets.available}
                      </Text>
                      <Text size="text-xs">Available</Text>
                    </Flex>
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
                        href={`/events/${event.id}/edit`}
                      />
                    </Tooltip>

                    <Dropdown.Root>
                      <Dropdown.Trigger asChild>
                        <Button label="Other Event Actions" fill="outline" icon={<List />} size="small" />
                      </Dropdown.Trigger>

                      <Dropdown.Content>
                        <Dropdown.Section>
                          <Dropdown.Item href={`/events/${event.id}`}>
                            <SvgIcon icon={<CalendarDots />} />
                            View Event
                          </Dropdown.Item>

                          <Dropdown.Item onSelect={() => copyTextToClipboard(`${HOSTNAME}/events/${event.id}`)}>
                            <SvgIcon icon={<Link />} />
                            Copy Share Link
                          </Dropdown.Item>

                          <Dropdown.Item href={`/events/${event.id}/scan`}>
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
