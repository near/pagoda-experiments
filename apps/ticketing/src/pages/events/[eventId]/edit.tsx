import { Button } from '@pagoda/ui/src/components/Button';
import { Card } from '@pagoda/ui/src/components/Card';
import { Container } from '@pagoda/ui/src/components/Container';
import * as Dropdown from '@pagoda/ui/src/components/Dropdown';
import { Flex } from '@pagoda/ui/src/components/Flex';
import { Form } from '@pagoda/ui/src/components/Form';
import { Input } from '@pagoda/ui/src/components/Input';
import { Section } from '@pagoda/ui/src/components/Section';
import { SvgIcon } from '@pagoda/ui/src/components/SvgIcon';
import { Text } from '@pagoda/ui/src/components/Text';
import { openToast } from '@pagoda/ui/src/components/Toast';
import { copyTextToClipboard } from '@pagoda/ui/src/utils/clipboard';
import { handleClientError } from '@pagoda/ui/src/utils/error';
import { ArrowRight, CalendarBlank, CalendarDots, Link, List, MapPinArea, QrCode, Tag } from '@phosphor-icons/react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useMemo } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';

import { useProducerLayout } from '@/hooks/useLayout';
import { HOSTNAME } from '@/utils/config';
import { EventDetails, NextPageWithLayout } from '@/utils/types';

type FormSchema = {
  name: string;
  location: string;
  date: string;
  startTime?: string;
  endTime?: string;
};

function timeout(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const EditEvent: NextPageWithLayout = () => {
  const form = useForm<FormSchema>();
  const router = useRouter();
  const eventId = router.query.eventId as string;

  const event: EventDetails = useMemo(() => {
    /*
      This useMemo() is just a temporary hack to roughly represent something like 
      Zustand or React Query keeping a stable reference for the object so that we 
      can properly reset the form when the data loads or changes.
    */

    return {
      id: '1',
      imageUrl: `${HOSTNAME}/images/hero-background.jpg`,
      name: 'Some Cool Event Name',
      date: '2024-10-14',
      startTime: '19:00',
      endTime: '22:00',
      location: '1234 W Cool St, Denver, CO',
      tickets: {
        available: 20,
        sold: 30,
        total: 50,
      },
      ticketPrice: 10,
      ticketQuantityLimit: 3,
    };
  }, []);

  useEffect(() => {
    form.reset({
      name: event.name,
      location: event.location,
      date: event.date,
      startTime: event.startTime,
      endTime: event.endTime,
    });
  }, [event, form]);

  const onValidSubmit: SubmitHandler<FormSchema> = async (data) => {
    try {
      console.log('TODO: Submit data to API', data);
      await timeout(1000);

      openToast({
        type: 'success',
        title: 'Event Updated',
      });

      router.push(`/events/${eventId}`);
    } catch (error) {
      handleClientError({ error });
    }
  };

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
          <Form onSubmit={form.handleSubmit(onValidSubmit)}>
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

              <Card>
                <Input
                  label="Name"
                  iconLeft={<Tag />}
                  error={form.formState.errors.name?.message}
                  {...form.register('name', {
                    required: 'Please enter a name',
                  })}
                />

                <Input
                  label="Location"
                  iconLeft={<MapPinArea />}
                  error={form.formState.errors.location?.message}
                  {...form.register('location', {
                    required: 'Please enter a location',
                  })}
                />

                <Input
                  label="Date"
                  type="date"
                  error={form.formState.errors.date?.message}
                  {...form.register('date', {
                    required: 'Please enter a date',
                  })}
                />

                <Flex stack="phone">
                  <Input
                    label="Start Time"
                    type="time"
                    error={form.formState.errors.startTime?.message}
                    {...form.register('startTime')}
                  />

                  <Input
                    label="End Time"
                    type="time"
                    error={form.formState.errors.endTime?.message}
                    {...form.register('endTime')}
                  />
                </Flex>
              </Card>

              <Flex justify="end">
                <Button
                  type="submit"
                  variant="affirmative"
                  label="Update Event"
                  iconRight={<ArrowRight />}
                  loading={form.formState.isSubmitting}
                />
              </Flex>
            </Flex>
          </Form>
        </Container>
      </Section>
    </>
  );
};

EditEvent.getLayout = useProducerLayout;

export default EditEvent;
