import { Button, Card, Container, copyTextToClipboard, Dropdown, Flex, Section, SvgIcon, Text } from '@near-pagoda/ui';
import { CalendarBlank, CalendarDots, Link, List, QrCode } from '@phosphor-icons/react';
import Head from 'next/head';
import { useRouter } from 'next/router';

import { useProducerLayout } from '@/hooks/useLayout';
import { HOSTNAME } from '@/utils/config';
import { NextPageWithLayout } from '@/utils/types';

const EditEvent: NextPageWithLayout = () => {
  const router = useRouter();

  return (
    <>
      <Head>
        <title>Edit Event</title>
      </Head>

      <Section background="primary-gradient" grow="available">
        <Container size="s" style={{ margin: 'auto' }}>
          <Flex stack gap="l">
            <Flex align="center">
              <SvgIcon icon={<CalendarBlank />} color="sand12" size="m" />

              <Text as="h3" style={{ marginRight: 'auto' }}>
                Edit Event
              </Text>

              <Dropdown.Root>
                <Dropdown.Trigger asChild>
                  <Button label="Other Event Actions" icon={<List weight="bold" />} size="small" />
                </Dropdown.Trigger>

                <Dropdown.Content>
                  <Dropdown.Section>
                    <Dropdown.Item href={`/events/${router.query.eventId}`}>
                      <SvgIcon icon={<CalendarDots />} />
                      View Event
                    </Dropdown.Item>

                    <Dropdown.Item
                      onSelect={() =>
                        copyTextToClipboard(`${HOSTNAME}/events/${router.query.eventId}`, 'Shareable event URL')
                      }
                    >
                      <SvgIcon icon={<Link />} />
                      Copy Share Link
                    </Dropdown.Item>

                    <Dropdown.Item href={`/events/${router.query.eventId}/scan`}>
                      <SvgIcon icon={<QrCode />} />
                      Scan Tickets
                    </Dropdown.Item>
                  </Dropdown.Section>
                </Dropdown.Content>
              </Dropdown.Root>
            </Flex>

            <Card>
              <Text>Ability to edit an event is currently in the works. Please check back again soon!</Text>
            </Card>
          </Flex>
        </Container>
      </Section>
    </>
  );
};

EditEvent.getLayout = useProducerLayout;

export default EditEvent;
