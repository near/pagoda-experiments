import { Button, Card, Flex, Grid, HR, Section, SvgIcon, Text } from '@near-pagoda/ui';
import { CalendarDots, HandPeace, Plus, Ticket } from '@phosphor-icons/react';

import { useDefaultLayout } from '@/hooks/useLayout';
import { NextPageWithLayout } from '@/utils/types';

const Home: NextPageWithLayout = () => {
  return (
    <>
      <Section
        grow="available"
        style={{
          position: 'relative',
          background: 'linear-gradient(to right, var(--violet9), var(--cyan10))',
          border: 'none',
          overflow: 'hidden',
        }}
      >
        <img
          src="/images/hero-background.jpg"
          alt=""
          style={{
            position: 'absolute',
            zIndex: 0,
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: 0.1,
            filter: 'saturate(0%) blur(2px)',
          }}
        />

        <Flex stack gap="xl" gapTablet="l" style={{ zIndex: 5, margin: 'auto' }}>
          <Flex stack gap="s" style={{ textAlign: 'center' }}>
            <Text as="h1" color="white">
              Easy, robust ticketing for any event
            </Text>
            <Text size="text-2xl" weight={400} color="violet12">
              ...without the crazy fees
            </Text>
          </Flex>

          <Grid columns="1fr 1fr 1fr" columnsTablet="1fr 1fr" columnsPhone="1fr" gap="l" gapPhone="m">
            <Card>
              <Flex style={{ margin: 'auto 0' }} align="center">
                <SvgIcon icon={<CalendarDots />} color="violet8" size="m" />
                <Text color="violet12" size="text-s">
                  Manage any number of events with configurable ticket purchasing, resale, and refund rules.
                </Text>
              </Flex>
            </Card>

            <Card>
              <Flex style={{ margin: 'auto 0' }} align="center">
                <SvgIcon icon={<Ticket />} color="violet8" size="m" />
                <Text color="violet12" size="text-s">
                  Scan and verify tickets at your event. Ticket holders will receive a proof of attendance.
                </Text>
              </Flex>
            </Card>

            <Card>
              <Flex style={{ margin: 'auto 0' }} align="center">
                <SvgIcon icon={<HandPeace />} color="violet8" size="m" />
                <Text color="violet12" size="text-s">
                  Combat scalpers and prioritize ticket sales for previous attendees.
                </Text>
              </Flex>
            </Card>
          </Grid>
        </Flex>
      </Section>

      <Section>
        <Grid columns="1fr 1fr" gap="xl" columnsTablet="1fr">
          <Flex stack align="start">
            <Text as="h2">Event Producer</Text>

            <Text>
              Sign in to start creating and managing your events. After {`you've`} created an event, {`you'll`} be able
              to share a special link with your attendees and fans for them to purchase tickets.
            </Text>

            <HR />

            <Flex wrap>
              <Button iconLeft={<Plus />} variant="affirmative" label="Create Event" size="large" href="/events/new" />
              <Button iconLeft={<CalendarDots />} label="Manage Events" size="large" href="/events" />
            </Flex>
          </Flex>

          <Flex stack align="start">
            <Text as="h2">Attendee</Text>

            <Text>
              The event producer will share a special link with you to purchase tickets for their event. If {`you've`}{' '}
              already purchased tickets, you can view and manage your tickets by visiting the special link that was
              emailed to you upon purchase.
            </Text>

            <Text>
              Depending on how the producer configured the event, {`you'll`} be able to transfer, resell, or refund your
              tickets.
            </Text>
          </Flex>
        </Grid>
      </Section>
    </>
  );
};

Home.getLayout = useDefaultLayout;

export default Home;
