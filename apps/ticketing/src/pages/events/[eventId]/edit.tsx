import { Button } from '@pagoda/ui/src/components/Button';
import { Card } from '@pagoda/ui/src/components/Card';
import { Container } from '@pagoda/ui/src/components/Container';
import * as Dropdown from '@pagoda/ui/src/components/Dropdown';
import { Flex } from '@pagoda/ui/src/components/Flex';
import { Section } from '@pagoda/ui/src/components/Section';
import { SvgIcon } from '@pagoda/ui/src/components/SvgIcon';
import { Text } from '@pagoda/ui/src/components/Text';
import { copyTextToClipboard } from '@pagoda/ui/src/utils/clipboard';
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

      <Section
        grow="available"
        style={{
          background: 'linear-gradient(to bottom right, var(--violet4), var(--cyan3))',
        }}
      >
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
