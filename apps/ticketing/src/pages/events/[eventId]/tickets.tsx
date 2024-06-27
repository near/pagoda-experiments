import { Button } from '@pagoda/ui/src/components/Button';
import { Card } from '@pagoda/ui/src/components/Card';
import { Container } from '@pagoda/ui/src/components/Container';
import { Flex } from '@pagoda/ui/src/components/Flex';
import { Form } from '@pagoda/ui/src/components/Form';
import { Grid } from '@pagoda/ui/src/components/Grid';
import { HR } from '@pagoda/ui/src/components/HorizontalRule';
import { Input } from '@pagoda/ui/src/components/Input';
import { PlaceholderSection } from '@pagoda/ui/src/components/Placeholder';
import { Section } from '@pagoda/ui/src/components/Section';
import { SvgIcon } from '@pagoda/ui/src/components/SvgIcon';
import { Text } from '@pagoda/ui/src/components/Text';
import { openToast } from '@pagoda/ui/src/components/Toast';
import { Tooltip } from '@pagoda/ui/src/components/Tooltip';
import { handleClientError } from '@pagoda/ui/src/utils/error';
import { ArrowLeft, ArrowRight, Clock, MapPinArea, Minus, Plus, Ticket } from '@phosphor-icons/react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';

import { useDrops } from '@/hooks/useDrops';
import { useEvent } from '@/hooks/useEvents';
import { useDefaultLayout } from '@/hooks/useLayout';
import { CLOUDFLARE_IPFS } from '@/utils/common';
import { displayEventDate } from '@/utils/date';
import { formatDollar, formatTicketPrice } from '@/utils/dollar';
import { formatEventIdQueryParam, parseEventIdQueryParam } from '@/utils/event-id';
import { stringToNumber } from '@/utils/number';
import type { NextPageWithLayout } from '@/utils/types';

type FormSchema = {
  email: string;
  tickets: {
    dropId: string;
    quantity?: number;
  }[];
};

const GetTickets: NextPageWithLayout = () => {
  const router = useRouter();
  const { publisherAccountId, eventId } = parseEventIdQueryParam(router.query.eventId);
  const event = useEvent(publisherAccountId, eventId);
  const drops = useDrops(publisherAccountId);
  const dropsForEvent = drops.data?.[eventId];
  const form = useForm<FormSchema>({
    defaultValues: {
      tickets: [],
    },
  });
  const tickets = form.watch('tickets');

  const totalTickets = tickets.reduce((result, ticket) => {
    return result + (ticket.quantity || 0);
  }, 0);

  const totalPrice = tickets.reduce((result, ticket, index) => {
    const drop = dropsForEvent?.[index];
    if (!drop?.extra?.priceNear || !ticket.quantity) return result;
    const price = (stringToNumber(drop.extra.priceNear) || 0) * ticket.quantity;
    return result + price;
  }, 0);

  useEffect(() => {
    if (drops.data && !dropsForEvent) {
      openToast({
        type: 'error',
        title: 'Failed to load ticket info',
        description: 'Please try again later',
      });
    }
  }, [drops.data, dropsForEvent]);

  useEffect(() => {
    if (dropsForEvent) {
      form.reset({
        tickets: dropsForEvent.map((drop) => ({ dropId: drop.drop_id, quantity: undefined })),
      });
    }
  }, [dropsForEvent, form]);

  const onValidSubmit: SubmitHandler<FormSchema> = async (formData) => {
    try {
      console.log(formData);
    } catch (error) {
      handleClientError({ title: 'Checkout Failed', error });
    }
  };

  if (!event.data || !dropsForEvent) {
    return <PlaceholderSection background="primary-gradient" />;
  }

  return (
    <>
      <Head>
        <title>Get Tickets</title>
      </Head>

      <Section background="primary-gradient" grow="available">
        <Form onSubmit={form.handleSubmit(onValidSubmit)}>
          <Container size="s" style={{ margin: 'auto' }}>
            <Flex stack gap="l">
              <Flex align="center" gap="s" style={{ marginLeft: '-0.75rem' }}>
                <Tooltip asChild content="Back to event details">
                  <Button
                    label="View Event"
                    icon={<ArrowLeft weight="bold" />}
                    fill="ghost"
                    href={`/events/${formatEventIdQueryParam(publisherAccountId, eventId)}`}
                  />
                </Tooltip>

                <Text as="h3">Get Tickets</Text>
              </Flex>

              <HR style={{ margin: 0 }} />

              <Grid columns="2fr 1fr" align="center">
                <Flex stack gap="xs">
                  <Text size="text-s" color="sand12" weight={600}>
                    {event.data.name}
                  </Text>

                  <Flex align="center" gap="s">
                    <SvgIcon icon={<MapPinArea />} size="xs" />
                    <Text size="text-xs">{event.data.location}</Text>
                  </Flex>

                  <Flex align="center" gap="s">
                    <SvgIcon icon={<Clock />} size="xs" />
                    <Text size="text-xs">{displayEventDate(event.data)?.dateAndTime}</Text>
                  </Flex>
                </Flex>

                {event.data.artwork && (
                  <img
                    src={`${CLOUDFLARE_IPFS}/${event.data.artwork}`}
                    alt={event.data.name}
                    style={{ borderRadius: '6px', boxShadow: '0 0 0 1px var(--blackA3)' }}
                  />
                )}
              </Grid>

              <Flex stack>
                {dropsForEvent.map((drop, index) => (
                  <Card key={drop.drop_id}>
                    <Flex stack>
                      <Flex align="center">
                        <SvgIcon icon={<Ticket weight="duotone" />} color="sand10" size="s" />

                        <Flex stack gap="none">
                          <Text size="text-s" weight={600} color="sand12">
                            {drop.drop_config.nft_keys_config.token_metadata.title ?? 'General Admission'}
                          </Text>

                          {drop.drop_config.nft_keys_config.token_metadata.description && (
                            <Text size="text-s">{drop.drop_config.nft_keys_config.token_metadata.description}</Text>
                          )}
                        </Flex>
                      </Flex>

                      <HR variant="secondary" style={{ margin: 0 }} />

                      <Flex align="center">
                        <Flex stack gap="none">
                          <Text size="text-s" color="sand12">
                            {formatTicketPrice(drop.extra?.priceNear)}
                          </Text>
                          <Flex align="center" gap="xs" wrap>
                            {drop.extra?.maxSupply && <Text size="text-xs">Available: {drop.extra.maxSupply}</Text>}
                            {drop.extra?.limitPerUser && <Text size="text-xs">Limit: {drop.extra.limitPerUser}</Text>}
                          </Flex>
                        </Flex>

                        <Flex gap="s" align="center" style={{ marginLeft: 'auto' }}>
                          <Button
                            label="Decrease Quantity"
                            fill="ghost"
                            size="small"
                            icon={<Minus weight="bold" />}
                            onClick={() => {
                              const value = form.getValues(`tickets.${index}.quantity`) || 0;
                              const newValue = Math.max(0, value - 1);
                              form.setValue(`tickets.${index}.quantity`, newValue, {
                                shouldValidate: true,
                              });
                            }}
                          />

                          <Input
                            placeholder="0"
                            number={{
                              allowDecimal: false,
                              allowNegative: false,
                            }}
                            style={{
                              width: '4.5rem',
                              textAlign: 'center',
                            }}
                            error={form.formState.errors.tickets?.[index]?.quantity?.message}
                            {...form.register(`tickets.${index}.quantity`, {
                              min: 0,
                              max: {
                                value: drop.extra?.limitPerUser || Infinity,
                                message: `Limit: ${drop.extra?.limitPerUser}`,
                              },
                              valueAsNumber: true,
                            })}
                          />

                          <Button
                            label="Increase Quantity"
                            fill="ghost"
                            size="small"
                            icon={<Plus weight="bold" />}
                            onClick={() => {
                              const value = form.getValues(`tickets.${index}.quantity`) || 0;
                              form.setValue(`tickets.${index}.quantity`, value + 1, {
                                shouldValidate: true,
                              });
                            }}
                          />
                        </Flex>
                      </Flex>
                    </Flex>
                  </Card>
                ))}
              </Flex>

              <Flex align="center">
                <Text weight={600} color="sand12" style={{ marginRight: 'auto' }}>
                  Total: {formatDollar(totalPrice)}
                </Text>

                <Button
                  type="submit"
                  disabled={!totalTickets}
                  label="Checkout"
                  variant="affirmative"
                  iconRight={<ArrowRight />}
                />
              </Flex>
            </Flex>
          </Container>
        </Form>
      </Section>
    </>
  );
};

GetTickets.getLayout = useDefaultLayout;

export default GetTickets;
