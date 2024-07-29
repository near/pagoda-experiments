import {
  AssistiveText,
  Button,
  Card,
  Container,
  Flex,
  Form,
  Grid,
  handleClientError,
  HR,
  Input,
  openToast,
  PlaceholderSection,
  Section,
  SvgIcon,
  Text,
  Tooltip,
} from '@near-pagoda/ui';
import { ArrowLeft, ArrowRight, Clock, Envelope, MapPinArea, Minus, Plus, Ticket } from '@phosphor-icons/react';
import { useMutation } from '@tanstack/react-query';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';

import { useDrops } from '@/hooks/useDrops';
import { useEvent } from '@/hooks/useEvents';
import { useDefaultLayout } from '@/hooks/useLayout';
import { useNearStore } from '@/stores/near';
import { CLOUDFLARE_IPFS } from '@/utils/config';
import { displayEventDate } from '@/utils/date';
import { formatDollar, formatTicketPrice } from '@/utils/dollar';
import { formatEventIdQueryParam, parseEventIdQueryParam } from '@/utils/event';
import { stringToNumber } from '@/utils/number';
import { pluralize } from '@/utils/pluralize';
import { purchaseTickets } from '@/utils/purchase';
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
  const viewAccount = useNearStore((store) => store.viewAccount);
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
    if (!drop?.ticket.extra?.priceFiat || !ticket.quantity) return result;
    const price = (stringToNumber(drop.ticket.extra.priceFiat) || 0) * ticket.quantity;
    return result + price;
  }, 0);

  const mutation = useMutation({ mutationFn: purchaseTickets });

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
    if (!event.data || !dropsForEvent || !viewAccount) return;
    try {
      const { email, tickets } = formData;
      const { purchases } = await mutation.mutateAsync({
        event: event.data,
        dropsForEvent,
        publisherAccountId,
        email,
        tickets,
        viewAccount,
      });

      openToast({
        type: 'success',
        title: `${purchases.length} ${pluralize(purchases.length, 'ticket')} purchased`,
        description: `${pluralize(purchases.length, 'Ticket')} emailed to: ${email}`,
      });

      router.push(`/tickets/purchased#${purchases.map((purchase) => purchase.secretKey).join(',')}`);
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
                      <Flex align="center" gap="s">
                        <SvgIcon icon={<Ticket weight="duotone" />} color="sand10" size="s" />
                        <Text size="text-s" weight={600} color="sand12">
                          {drop.ticket.title}
                        </Text>
                      </Flex>

                      <HR variant="secondary" style={{ margin: 0 }} />

                      {drop.ticket.description && (
                        <>
                          <Text size="text-s">{drop.ticket.description}</Text>
                          <HR variant="secondary" style={{ margin: 0 }} />
                        </>
                      )}

                      <Flex align="center">
                        <Flex stack gap="xs">
                          <Text size="text-xs" weight={600} color="sand12">
                            {formatTicketPrice(drop.ticket.extra?.priceFiat)}
                          </Text>
                          <Flex align="center" gap="xs" wrap>
                            {drop.ticket.extra?.maxSupply && (
                              <Text size="text-xs">
                                {drop.ticket.remaining} tickets left. Limit {drop.ticket.extra.limitPerUser} per
                                customer.
                              </Text>
                            )}
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
                            disabled={!drop.ticket.remaining || !drop.ticket.validatedSellThrough.valid}
                            error={form.formState.errors.tickets?.[index]?.quantity?.message}
                            {...form.register(`tickets.${index}.quantity`, {
                              min: 0,
                              max: {
                                value: Math.min(drop.ticket.extra?.limitPerUser || Infinity, drop.ticket.remaining),
                                message: `Limit: ${Math.min(drop.ticket.extra?.limitPerUser || Infinity, drop.ticket.remaining)}`,
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

                      {!drop.ticket.validatedSellThrough.valid && (
                        <AssistiveText
                          variant="error"
                          message={drop.ticket.validatedSellThrough.message || 'Ticket sales have closed'}
                        />
                      )}

                      {!drop.ticket.remaining && <AssistiveText variant="error" message="Tickets sold out" />}
                    </Flex>
                  </Card>
                ))}

                <Card>
                  <Input
                    label="Your Email"
                    type="email"
                    iconLeft={<Envelope />}
                    error={form.formState.errors.email?.message}
                    assistive="Your tickets will be sent to this address"
                    {...form.register('email', {
                      required: 'Please enter an email',
                      pattern: {
                        value: /^(.+)@(.+)[^.]$/,
                        message: 'Please enter a valid email addresss',
                      },
                    })}
                  />
                </Card>
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
                  loading={form.formState.isSubmitting}
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
