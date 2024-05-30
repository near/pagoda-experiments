import { Button } from '@pagoda/ui/src/components/Button';
import { Card } from '@pagoda/ui/src/components/Card';
import { Container } from '@pagoda/ui/src/components/Container';
import { Flex } from '@pagoda/ui/src/components/Flex';
import { Form } from '@pagoda/ui/src/components/Form';
import { HR } from '@pagoda/ui/src/components/HorizontalRule';
import { Input } from '@pagoda/ui/src/components/Input';
import { Section } from '@pagoda/ui/src/components/Section';
import { SvgIcon } from '@pagoda/ui/src/components/SvgIcon';
import { Text } from '@pagoda/ui/src/components/Text';
import { openToast } from '@pagoda/ui/src/components/Toast';
import { handleClientError } from '@pagoda/ui/src/utils/error';
import { ArrowRight, CalendarPlus, CurrencyDollar, MapPinArea, Tag, Ticket } from '@phosphor-icons/react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { SubmitHandler, useForm } from 'react-hook-form';

import { useProducerLayout } from '@/hooks/useLayout';
import { NextPageWithLayout } from '@/utils/types';

type FormSchema = {
  name: string;
  location: string;
  date: string;
  startTime?: string;
  endTime?: string;
  ticketPrice?: number;
  ticketQuantityLimit?: number;
};

function timeout(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const CreateEvent: NextPageWithLayout = () => {
  const form = useForm<FormSchema>();
  const router = useRouter();

  const onValidSubmit: SubmitHandler<FormSchema> = async (data) => {
    try {
      console.log('TODO: Submit data to API', data);
      await timeout(1000);
      const newEventId = 123;

      openToast({
        type: 'success',
        title: 'Event Created',
      });

      router.push(`/events/${newEventId}`);
    } catch (error) {
      handleClientError({ error });
    }
  };

  return (
    <>
      <Head>
        <title>Create New Event</title>
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
                <SvgIcon icon={<CalendarPlus />} color="sand12" size="m" />

                <Text as="h3" style={{ marginRight: 'auto' }}>
                  Create New Event
                </Text>
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

                <HR />

                <Flex stack="phone">
                  <Input
                    label="Ticket Price"
                    placeholder="Free"
                    iconLeft={<CurrencyDollar />}
                    number={{
                      allowNegative: false,
                    }}
                    error={form.formState.errors.ticketPrice?.message}
                    {...form.register('ticketPrice')}
                  />

                  <Input
                    label="Quantity Limit"
                    placeholder="Unlimited"
                    iconLeft={<Ticket />}
                    number={{
                      allowNegative: false,
                      allowDecimal: false,
                    }}
                    error={form.formState.errors.ticketQuantityLimit?.message}
                    {...form.register('ticketQuantityLimit')}
                  />
                </Flex>
              </Card>

              <Flex justify="end">
                <Button
                  type="submit"
                  variant="affirmative"
                  label="Create Event"
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

CreateEvent.getLayout = useProducerLayout;

export default CreateEvent;
