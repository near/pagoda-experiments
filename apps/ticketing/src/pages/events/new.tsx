import { Action } from '@near-wallet-selector/core';
import { AssistiveText } from '@pagoda/ui/src/components/AssistiveText';
import { Badge } from '@pagoda/ui/src/components/Badge';
import { Button } from '@pagoda/ui/src/components/Button';
import { Card } from '@pagoda/ui/src/components/Card';
import { Container } from '@pagoda/ui/src/components/Container';
import { Flex } from '@pagoda/ui/src/components/Flex';
import { Form } from '@pagoda/ui/src/components/Form';
import { Input } from '@pagoda/ui/src/components/Input';
import { InputTextarea } from '@pagoda/ui/src/components/InputTextarea';
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
  Gear,
  HashStraight,
  MapPinArea,
  Plus,
  Tag,
  Ticket,
  Trash,
} from '@phosphor-icons/react';
import { FinalExecutionOutcome } from 'near-api-js/lib/providers';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { SubmitHandler, useFieldArray, useForm } from 'react-hook-form';

import { FilePreviews } from '@/components/FilePreviews';
import { useProducerLayout } from '@/hooks/useLayout';
import { useStripe } from '@/hooks/useStripe';
import { useNearStore } from '@/stores/near';
import { useStripeStore } from '@/stores/stripe';
import { useWalletStore } from '@/stores/wallet';
import { EVENTS_WORKER_BASE, KEYPOM_EVENTS_CONTRACT_ID, KEYPOM_MARKETPLACE_CONTRACT_ID } from '@/utils/common';
import {
  createPayload,
  estimateCosts,
  FormSchema,
  serializeMediaForWorker,
  TicketInfoFormMetadata,
  yoctoToNear,
} from '@/utils/helpers';
import { NextPageWithLayout } from '@/utils/types';

const CreateEvent: NextPageWithLayout = () => {
  const wallet = useWalletStore((store) => store.wallet);
  const account = useWalletStore((store) => store.account);
  const viewAccount = useNearStore((store) => store.viewAccount);
  const near = useNearStore((store) => store.near);
  const [attemptToConnect, setAttemptToConnect] = useState(false);
  const [stripeUploaded, setUploadedToStripe] = useState(false);
  const [estimatedNearCost, setEstimatedNearCost] = useState('');
  const checkForPriorStripeConnected = useStripeStore((store) => store.checkForPriorStripeConnected);
  const stripeAccountId = useStripeStore((store) => store.stripeAccountId);
  const router = useRouter();
  const successMessage = router.query.successMessage;
  // errorCode and transactionHashes comes from MNW
  // transactionHashes defines success transaction on myNearWallet
  const errorCode = router.query.errorCode;
  const transactionHashes = router.query.transactionHashes as string;

  const form = useForm<FormSchema>({
    defaultValues: {},
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'tickets',
    rules: { required: 'Please add at least one ticket configuration', minLength: 1 },
  });

  useStripe(account?.accountId, attemptToConnect);

  // check for stripe account id in local storage
  useEffect(() => {
    checkForPriorStripeConnected(account?.accountId);
  }, [account, checkForPriorStripeConnected]);

  // check for successMessage query string from router
  useEffect(() => {
    if (successMessage) {
      checkForPriorStripeConnected(account?.accountId);
    }
  }, [successMessage, account, checkForPriorStripeConnected]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (form.formState.isValid) {
        const { total } = estimateCosts({
          formData: form.getValues(),
        });
        setEstimatedNearCost(total);
      } else {
        setEstimatedNearCost('');
      }
    }, 250);

    return () => {
      clearInterval(interval);
    };
  }, [form]);

  useEffect(() => {
    const checkForEventCreationSuccess = async () => {
      const eventData = localStorage.getItem('EVENT_INFO_SUCCESS_DATA');
      if (eventData && viewAccount && !stripeUploaded) {
        console.log('eventData is ', eventData);
        const { eventId, eventName, stripeAccountId, priceByDropId } = JSON.parse(eventData);
        let response: Response | undefined;
        try {
          await viewAccount.viewFunction({
            contractId: KEYPOM_MARKETPLACE_CONTRACT_ID,
            methodName: 'get_event_information',
            args: { event_id: eventId },
          });

          response = await fetch(`${EVENTS_WORKER_BASE}/stripe/create-event`, {
            method: 'POST',
            body: JSON.stringify({
              priceByDropId,
              stripeAccountId,
              eventId,
              eventName,
            }),
          });

          if (response.ok) {
            setUploadedToStripe(true);
            openToast({
              type: 'success',
              title: 'Event Uploaded to Stripe',
            });
          }
        } catch (e) {
          console.error('Error uploading to stripe: ', e);
          handleClientError({
            title: 'Error Uploading to Stripe',
            error: e,
          });
        }

        localStorage.removeItem('EVENT_INFO_SUCCESS_DATA');
      }
    };
    checkForEventCreationSuccess();
  }, [router, stripeUploaded, viewAccount]);

  const placeHolderTicket: TicketInfoFormMetadata = {
    name: 'General Admission',
    denomination: 'Near',
  };

  useEffect(() => {
    if (errorCode) {
      const eventData = localStorage.getItem('EVENT_INFO_DATA');
      if (eventData) {
        form.reset(JSON.parse(eventData));
      }
    }
  }, [errorCode, form]);

  useEffect(() => {
    if (transactionHashes) {
      const checkTransactionStatusForEvent = async () => {
        const txHash = transactionHashes as string;
        const provider = near?.connection.provider;

        try {
          const result = (await provider!.txStatus(txHash, account?.accountId!)) as FinalExecutionOutcome;
          if (result.status && typeof result.status === 'object' && 'SuccessValue' in result.status) {
            openToast({
              type: 'success',
              title: 'Event Created',
            });
            localStorage.removeItem('EVENT_INFO_DATA');
            router.push('/events');
          }
        } catch (error) {
          handleClientError({
            title: 'Failed to fetch transaction status',
            error,
          });
        }
      };
      checkTransactionStatusForEvent();
    }
  }, [account?.accountId, near?.connection.provider, router, transactionHashes]);

  const onValidSubmit: SubmitHandler<FormSchema> = async (formData) => {
    try {
      localStorage.setItem('EVENT_INFO_DATA', JSON.stringify(formData));

      if (!wallet || !account) {
        openToast({
          type: 'error',
          title: 'Wallet not connected',
          description: 'Please connect your wallet to create an event',
        });
        return;
      }

      let ipfsResponse: Response | undefined;
      try {
        const serializedData = await serializeMediaForWorker(formData);
        const url = `${EVENTS_WORKER_BASE}/ipfs-pin`;
        ipfsResponse = await fetch(url, {
          method: 'POST',
          body: JSON.stringify({ base64Data: serializedData }),
        });
      } catch (error) {
        console.error('Failed to pin media on IPFS', error);
      }

      if (ipfsResponse?.ok) {
        const resBody = await ipfsResponse.json();
        const cids: string[] = resBody.cids;

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

        if (stripeAccountId) {
          const priceByDropId: Record<string, number> = {};
          for (let i = 0; i < formData.tickets.length; i++) {
            const ticketDropId = dropIds[i];
            if (formData.tickets[i]?.priceFiat) {
              priceByDropId[ticketDropId || `${eventId}-${i}`] = Math.round(
                parseFloat(formData.tickets[i]?.priceFiat || ''),
              );
            }
            {
              priceByDropId[ticketDropId || `${eventId}-${i}`] = 0;
            }
          }
          const stripeAccountInfo = {
            stripeAccountId,
            eventId,
            eventName: formData.name,
            priceByDropId,
          };

          localStorage.setItem('EVENT_INFO_SUCCESS_DATA', JSON.stringify(stripeAccountInfo));
        } else {
          localStorage.setItem('EVENT_INFO_SUCCESS_DATA', JSON.stringify({ eventId }));
        }

        await wallet.signAndSendTransaction({
          signerId: wallet.id,
          receiverId: KEYPOM_EVENTS_CONTRACT_ID,
          actions,
        });

        openToast({
          type: 'success',
          title: 'Event Created',
        });

        if (stripeAccountId) {
          openToast({
            type: 'success',
            title: 'Uploading to Stripe',
            description: 'Please wait while we upload your event to Stripe',
          });
        } else {
          router.push('/events');
        }
      }
    } catch (error) {
      handleClientError({ title: 'Event Creation Failed', error });
    }
  };

  const handleConnectStripe = async () => {
    const prevConnection = await checkForPriorStripeConnected(account?.accountId);
    if (prevConnection === null) {
      setAttemptToConnect(true);
    }
  };

  return (
    <>
      <Head>
        <title>Create New Event</title>
      </Head>

      <Section background="primary-gradient" grow="available">
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
                  <Text size="text-xs" weight={600} color="sand12">
                    Payment Options
                  </Text>

                  <Flex align="center">
                    <Text style={{ marginRight: 'auto' }}>Stripe</Text>

                    {stripeAccountId ? (
                      <>
                        <Badge variant="success" label={`Connected To: ${stripeAccountId}`} />

                        <Tooltip asChild content="Change Stripe Account">
                          <Button
                            variant="primary"
                            label="Change Stripe Account"
                            fill="outline"
                            size="small"
                            icon={<Gear />}
                            onClick={handleConnectStripe}
                          />
                        </Tooltip>
                      </>
                    ) : (
                      <Button
                        variant="primary"
                        label="Connect Stripe Account"
                        fill="outline"
                        size="small"
                        onClick={handleConnectStripe}
                      />
                    )}
                  </Flex>
                </Card>

                <Card>
                  <Input
                    label="Name"
                    iconLeft={<Tag />}
                    error={form.formState.errors.name?.message}
                    {...form.register('name', {
                      required: 'Please enter a name',
                    })}
                  />

                  <InputTextarea
                    label="Description"
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
                        label="Ticket Price (USD)"
                        placeholder="Free"
                        iconLeft={<CurrencyDollar />}
                        number={{
                          allowNegative: false,
                        }}
                        error={form.formState.errors.tickets?.[index]?.priceFiat?.message}
                        {...form.register(`tickets.${index}.priceFiat`, { min: 0 })}
                      />

                      <Input
                        label="Total Supply"
                        iconLeft={<Ticket />}
                        number={{
                          allowNegative: false,
                        }}
                        error={form.formState.errors.tickets?.[index]?.maxSupply?.message}
                        {...form.register(`tickets.${index}.maxSupply`, {
                          required: 'Please enter a value',
                          min: 1,
                          valueAsNumber: true,
                        })}
                      />

                      <Input
                        label="Quantity Limit"
                        iconLeft={<HashStraight />}
                        number={{
                          allowNegative: false,
                        }}
                        error={form.formState.errors.tickets?.[index]?.maxPurchases?.message}
                        {...form.register(`tickets.${index}.maxPurchases`, {
                          required: 'Please enter a value',
                          min: 1,
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

              <Flex align="center">
                {estimatedNearCost && (
                  <Tooltip content="The estimated cost (in NEAR) to publish this event">
                    <Flex align="center" gap="xs" wrap>
                      <Text size="text-xs" color="sand10">
                        Estimated Cost:
                      </Text>
                      <Text size="text-s" weight={600} color="sand12">
                        {yoctoToNear(estimatedNearCost)} Ⓝ
                      </Text>
                    </Flex>
                  </Tooltip>
                )}

                <Button
                  type="submit"
                  variant="affirmative"
                  label="Create Event"
                  iconRight={<ArrowRight />}
                  loading={form.formState.isSubmitting}
                  style={{ marginLeft: 'auto' }}
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
