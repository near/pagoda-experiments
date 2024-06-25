import { Action } from '@near-wallet-selector/core';
import { AssistiveText } from '@pagoda/ui/src/components/AssistiveText';
import { Button } from '@pagoda/ui/src/components/Button';
import { Card } from '@pagoda/ui/src/components/Card';
import { Container } from '@pagoda/ui/src/components/Container';
import { Flex } from '@pagoda/ui/src/components/Flex';
import { Form } from '@pagoda/ui/src/components/Form';
import { Input } from '@pagoda/ui/src/components/Input';
import { Section } from '@pagoda/ui/src/components/Section';
import { SvgIcon } from '@pagoda/ui/src/components/SvgIcon';
import { Text } from '@pagoda/ui/src/components/Text';
import { openToast } from '@pagoda/ui/src/components/Toast';
import { Tooltip } from '@pagoda/ui/src/components/Tooltip';
import { handleClientError } from '@pagoda/ui/src/utils/error';
import {
  ArrowRight,
  CalendarPlus,
  CurrencyDollar,
  HashStraight,
  MapPinArea,
  Note,
  Plus,
  Tag,
  Ticket,
  Trash,
} from '@phosphor-icons/react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { SubmitHandler, useFieldArray, useForm } from 'react-hook-form';

import { FilePreviews } from '@/components/FilePreviews';
import { useProducerLayout } from '@/hooks/useLayout';
import { useWalletStore } from '@/stores/wallet';
import { EVENTS_WORKER_BASE, KEYPOM_EVENTS_CONTRACT } from '@/utils/common';
import { createPayload, FormSchema, serializeMediaForWorker, TicketInfoFormMetadata } from '@/utils/helpers';
import { NextPageWithLayout } from '@/utils/types';

const CreateEvent: NextPageWithLayout = () => {
  const wallet = useWalletStore((state) => state.wallet);
  const account = useWalletStore((state) => state.account);
  const router = useRouter();
  const [stripeCheckout, setStripeCheckout] = useState(false);

  const form = useForm<FormSchema>();
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'tickets',
    rules: { required: 'Please add at least one ticket configuration', minLength: 1 },
  });

  const placeHolderTicket: TicketInfoFormMetadata = {
    name: 'General Admission',
    denomination: 'Near',
  };

  const onValidSubmit: SubmitHandler<FormSchema> = async (formData) => {
    try {
      if (stripeCheckout) {
        //set stripe account info when using stripe
      } else {
        (formData.stripeAccountId = ''), (formData.acceptNearPayments = false);
        formData.acceptStripePayments = false;
      }

      if (!wallet || !account) {
        openToast({
          type: 'error',
          title: 'Wallet not connected',
          description: 'Please connect your wallet to create an event',
        });
        return;
      }

      if (form.formState.isValid) {
        const serializedData = await serializeMediaForWorker(formData);
        let ipfsResponse: Response | undefined;
        try {
          const url = `${EVENTS_WORKER_BASE}/ipfs-pin`;
          ipfsResponse = await fetch(url, {
            method: 'POST',
            body: JSON.stringify({ base64Data: serializedData }),
          });
        } catch (error) {
          console.error('Failed to pin media on IPFS', error);
        }

        // if (ipfsResponse?.ok) {
        if (true) {
          // const resBody = await ipfsResponse.json();
          // const cids: string[] = resBody.cids;
          const cids: string[] = [
            'bafybeicjhlpijcsxcgsokdgjc3slgmna5ditnnx6hny4hlq6zgrhzictie',
            'bafkreicimptrgl6jr6qfuv6tmano6bx2gfx5lmdhrvzslo5g5wettivcm4',
          ];

          const eventArtworkCid: string = cids[0] as string;
          const ticketArtworkCids: string[] = [];
          for (let i = 0; i < cids.length - 1; i++) {
            ticketArtworkCids.push(cids[i + 1] as string);
          }

          const eventId = Date.now().toString();
          const { actions, dropIds }: { actions: Action[]; dropIds: string[] } = await createPayload({
            accountId: account.accountId,
            formData,
            eventId,
            eventArtworkCid,
            ticketArtworkCids,
          });

          if (actions && eventId) {
            localStorage.setItem('EVENT_INFO_SUCCESS_DATA', JSON.stringify({ eventId }));
          }

          await wallet.signAndSendTransaction({
            signerId: wallet.id!,
            receiverId: KEYPOM_EVENTS_CONTRACT,
            actions,
          });

          openToast({
            type: 'success',
            title: 'Event Created',
          });

          router.push('/events');
        } else {
        }
      }
    } catch (error) {
      handleClientError({ title: 'Event Creation Failed', error });
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

              <Flex stack>
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
                    label="Description"
                    iconLeft={<Note />}
                    error={form.formState.errors.description?.message}
                    {...form.register('description')}
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

                  <Card>
                    <Flex stack as="label">
                      <Text size="text-xs" weight={600} color="sand12">
                        Event Artwork
                      </Text>
                      <FilePreviews fileList={form.watch('eventArtwork')} />
                      <input type="file" {...form.register('eventArtwork')} />
                    </Flex>
                  </Card>
                </Card>

                {fields.map((field, index) => (
                  <Card key={field.id}>
                    <Flex stack="phone">
                      <Input
                        label="Ticket Name"
                        placeholder="General Admission"
                        iconLeft={<Tag />}
                        {...form.register(`tickets.${index}.name`)}
                      />
                    </Flex>

                    {/* <Flex stack="phone" style={{ display: 'block' }}>
                      <label> Payment Type</label>
                      <select {...form.register(`tickets.${index}.denomination`)}>
                        <option value="Near">Near</option>
                        <option disabled value="USD">
                          USD
                        </option>
                      </select>
                    </Flex> */}

                    <Flex stack="phone">
                      <Input
                        label="Ticket Price"
                        placeholder="Free"
                        iconLeft={<CurrencyDollar />}
                        number={{
                          allowNegative: false,
                        }}
                        {...form.register(`tickets.${index}.priceNear`)}
                      />

                      <Input
                        label="Total Supply"
                        placeholder="Unlimited"
                        iconLeft={<Ticket />}
                        number
                        {...form.register(`tickets.${index}.maxSupply`, {
                          valueAsNumber: true,
                        })}
                      />
                      <Input
                        label="Quantity Limit"
                        placeholder="Unlimited"
                        iconLeft={<HashStraight />}
                        number
                        {...form.register(`tickets.${index}.maxPurchases`, {
                          valueAsNumber: true,
                        })}
                      />
                    </Flex>

                    <Card>
                      <Flex stack as="label">
                        <Text size="text-xs" weight={600} color="sand12">
                          Ticket Artwork
                        </Text>
                        <FilePreviews fileList={form.watch(`tickets.${index}.artwork` as const)} />
                        <input type="file" {...form.register(`tickets.${index}.artwork`)} />
                      </Flex>
                    </Card>

                    <Tooltip asChild content="Remove Ticket Option">
                      <Button
                        variant="destructive"
                        label="Remove Option"
                        fill="outline"
                        icon={<Trash />}
                        size="small"
                        style={{ marginLeft: 'auto' }}
                        onClick={() => {
                          remove(index);
                        }}
                      />
                    </Tooltip>
                  </Card>
                ))}

                <Card>
                  <AssistiveText variant="error" message={form.formState.errors.tickets?.root?.message} />

                  <Button
                    variant="secondary"
                    label="Add Ticket"
                    iconLeft={<Plus />}
                    onClick={() => {
                      append(placeHolderTicket);
                    }}
                  />
                </Card>
              </Flex>

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
