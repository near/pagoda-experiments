import { DateTimePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import {
  AssistiveText,
  Badge,
  Button,
  Card,
  Container,
  FileInput,
  Flex,
  Form,
  handleClientError,
  Input,
  InputTextarea,
  openToast,
  Section,
  SvgIcon,
  Text,
  Tooltip,
} from '@near-pagoda/ui';
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
import { useMutation } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { FinalExecutionOutcome } from 'near-api-js/lib/providers';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Controller, SubmitHandler, useFieldArray, useForm } from 'react-hook-form';

import { useProducerLayout } from '@/hooks/useLayout';
import { useStripe } from '@/hooks/useStripe';
import { useNearStore } from '@/stores/near';
import { useStripeStore } from '@/stores/stripe';
import { useWalletStore } from '@/stores/wallet';
import { createNewEvent, createValidationRules } from '@/utils/event';
import { estimateCosts, FormSchema, TicketInfoFormMetadata, yoctoToNear } from '@/utils/helpers';
import { createStripeEvent } from '@/utils/stripe';
import { NextPageWithLayout } from '@/utils/types';

const MAX_ARTWORK_FILE_SIZE_BYTES = 5_000_000; // 5 MB is an arbitrary maximum to encourage event creators keep their images from being too large

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

  const [salesStartDateTime, setSalesStart] = useState(dayjs(new Date()).add(1, 'day'));
  const [salesEndDateTime, setSalesEnd] = useState(dayjs(new Date()).add(2, 'day'));
  const [eventStartsAt, setEventStartsAt] = useState(dayjs(new Date()).add(1, 'day'));
  const [eventEndsAt, setEventEndsAt] = useState(dayjs(new Date()).add(2, 'day'));

  const form = useForm<FormSchema>({
    defaultValues: {},
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'tickets',
    rules: { required: 'Please add at least one ticket configuration', minLength: 1 },
  });

  const createStripeEventMutation = useMutation({
    mutationFn: createStripeEvent,
    onSuccess: () => {
      setUploadedToStripe(true);
      console.log('Event Uploaded to Stripe');
      localStorage.removeItem('EVENT_INFO_SUCCESS_DATA');
    },
    onError: (error: any) => {
      console.error('Error uploading to stripe: ', error);
      handleClientError({
        title: 'Error Uploading to Stripe',
        error,
      });
    },
  });

  const createEventMutation = useMutation({ mutationFn: createNewEvent });

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
      if (
        eventData &&
        viewAccount &&
        !stripeUploaded &&
        !createStripeEventMutation.isSuccess &&
        !createStripeEventMutation.isPending
      ) {
        const parsedEventData = JSON.parse(eventData) as FormSchema;
        createStripeEventMutation.mutate(parsedEventData);
      }
    };
    checkForEventCreationSuccess();
  }, [
    createStripeEventMutation,
    createStripeEventMutation.isPending,
    createStripeEventMutation.isSuccess,
    createStripeEventMutation.mutate,
    router,
    stripeUploaded,
    viewAccount,
  ]);

  const placeHolderTicket: TicketInfoFormMetadata = {
    name: 'General Admission',
    denomination: 'Near',
    priceNear: '',
    priceFiat: '',
    salesValidThrough: {
      startDate: Date.now(), // Milliseconds from Unix Epoch
      startTime: '00:00', // Raw 24 hour time string such as 18:00
      endDate: new Date().setDate(Date.now() + 14), // Milliseconds from start date
      endTime: '00:00',
    },
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
    if (transactionHashes && account?.accountId) {
      const checkTransactionStatusForEvent = async () => {
        const txHash = transactionHashes as string;
        const provider = near?.connection.provider;

        try {
          const result = (await provider!.txStatus(txHash, account.accountId)) as FinalExecutionOutcome;
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
            title: 'An error occurred during Event Creation.',
            error,
          });
        }
      };
      checkTransactionStatusForEvent();
    }
  }, [account?.accountId, near?.connection.provider, router, transactionHashes]);

  const onValidSubmit: SubmitHandler<FormSchema> = async (formData) => {
    localStorage.setItem('EVENT_INFO_DATA', JSON.stringify(formData));
    try {
      await createEventMutation.mutateAsync({
        formData,
        accountId: account?.accountId,
        stripeAccountId,
        wallet,
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
    } catch (error) {
      console.error('Error creating event: ', error);
      handleClientError({ title: 'Event Creation Failed', error });
    }
  };

  const handleConnectStripe = async () => {
    const prevConnection = await checkForPriorStripeConnected(account?.accountId);
    if (prevConnection === null) {
      setAttemptToConnect(true);
    }
  };

  const validationRules = createValidationRules();

  return (
    <>
      <Head>
        <title>Create New Event</title>
      </Head>

      <Section background="primary-gradient" grow="available">
        <Container size="s" style={{ margin: 'auto' }}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
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
                      {...form.register('name', validationRules.name)}
                    />

                    <InputTextarea
                      label="Description"
                      error={form.formState.errors.description?.message}
                      {...form.register('description', validationRules.description)}
                    />

                    <Input
                      label="Location"
                      iconLeft={<MapPinArea />}
                      error={form.formState.errors.location?.message}
                      {...form.register('location', validationRules.location)}
                    />

                    <Flex stack="phone">
                      <Controller
                        control={form.control}
                        name="startTime"
                        render={({ field: { onChange, ref } }) => (
                          <DateTimePicker
                            label="Event Starts At"
                            disablePast
                            ref={ref}
                            defaultValue={eventStartsAt}
                            onChange={(value) => {
                              setEventStartsAt(value || eventStartsAt);
                              onChange(value);
                            }}
                          />
                        )}
                      />

                      <Controller
                        control={form.control}
                        name="endTime"
                        render={({ field: { onChange, ref } }) => (
                          <DateTimePicker
                            label="Event Ends At"
                            disablePast
                            ref={ref}
                            value={eventEndsAt}
                            onChange={(value) => {
                              setEventEndsAt(value || eventEndsAt);
                              onChange(value);
                            }}
                          />
                        )}
                      />
                    </Flex>

                    <Controller
                      control={form.control}
                      name="eventArtwork"
                      render={({ field, fieldState }) => (
                        <FileInput
                          label="Event Artwork"
                          accept="image/*"
                          maxFileSizeBytes={MAX_ARTWORK_FILE_SIZE_BYTES}
                          error={fieldState.error?.message}
                          {...field}
                        />
                      )}
                    />
                  </Card>

                  {fields.map((field, index) => (
                    <Card key={field.id}>
                      <Flex stack="phone">
                        <Input
                          label="Ticket Name"
                          placeholder="General Admission"
                          iconLeft={<Tag />}
                          {...form.register(`tickets.${index}.name`, validationRules.tickets.name)}
                        />
                      </Flex>

                      <Flex stack="phone">
                        <Input
                          label="Ticket Price (USD)"
                          placeholder="Free"
                          iconLeft={<CurrencyDollar />}
                          number={{
                            allowNegative: false,
                          }}
                          error={form.formState.errors.tickets?.[index]?.priceFiat?.message}
                          {...form.register(`tickets.${index}.priceFiat`, validationRules.tickets.priceFiat)}
                        />

                        <Input
                          label="Total Supply"
                          iconLeft={<Ticket />}
                          number={{
                            allowNegative: false,
                          }}
                          error={form.formState.errors.tickets?.[index]?.maxSupply?.message}
                          {...form.register(`tickets.${index}.maxSupply`, validationRules.tickets.maxSupply)}
                        />

                        <Input
                          label="Quantity Limit"
                          iconLeft={<HashStraight />}
                          number={{
                            allowNegative: false,
                          }}
                          error={form.formState.errors.tickets?.[index]?.maxPurchases?.message}
                          {...form.register(`tickets.${index}.maxPurchases`, validationRules.tickets.maxPurchases)}
                        />
                      </Flex>
                      <Flex stack="phone">
                        <Controller
                          control={form.control}
                          name={`tickets.${index}.salesValidThrough.startDate` as const}
                          render={({ field: { onChange, ref } }) => (
                            <DateTimePicker
                              label="Sales Start At"
                              disablePast
                              ref={ref}
                              defaultValue={salesStartDateTime}
                              onChange={(value) => {
                                setSalesStart(value || salesStartDateTime);
                                onChange(value);
                              }}
                            />
                          )}
                        />

                        <Controller
                          control={form.control}
                          name={`tickets.${index}.salesValidThrough.endDate` as const}
                          render={({ field: { onChange, ref } }) => (
                            <DateTimePicker
                              label="Sales End At"
                              disablePast
                              ref={ref}
                              value={salesEndDateTime}
                              onChange={(value) => {
                                setSalesEnd(value || salesEndDateTime);
                                onChange(value);
                              }}
                            />
                          )}
                        />
                      </Flex>

                      <Controller
                        control={form.control}
                        name={`tickets.${index}.artwork` as const}
                        render={({ field, fieldState }) => (
                          <FileInput
                            label="Ticket Artwork"
                            accept="image/*"
                            maxFileSizeBytes={MAX_ARTWORK_FILE_SIZE_BYTES}
                            error={fieldState.error?.message}
                            {...field}
                          />
                        )}
                      />

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
          </LocalizationProvider>
        </Container>
      </Section>
    </>
  );
};

CreateEvent.getLayout = useProducerLayout;

export default CreateEvent;
