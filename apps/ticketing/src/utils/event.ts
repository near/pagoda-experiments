import { Action } from '@near-wallet-selector/core';

import { KEYPOM_EVENTS_CONTRACT_ID } from './config';
import { createPayload, FormSchema } from './helpers';
import { pinMediaToIPFS } from './stripe';
import type { WalletStore } from './types';

export function formatEventIdQueryParam(publisherAccountId: string, eventId: string) {
  return `${publisherAccountId}:${eventId}`;
}

export function parseEventIdQueryParam(id: string | string[] | undefined) {
  if (!id || Array.isArray(id)) {
    id = '';
  }

  const [publisherAccountId, eventId] = id.split(':');

  return {
    eventId: eventId ?? '',
    publisherAccountId: publisherAccountId ?? '',
  };
}

export const createNewEvent = async ({
  formData,
  stripeAccountId,
  wallet,
  accountId,
}: {
  formData: FormSchema;
  stripeAccountId: string | null;
  wallet: WalletStore['wallet'];
  accountId: string | undefined;
}) => {
  if (!wallet || !accountId) {
    throw new Error('Wallet not connected');
  }
  try {
    const ipfsResponse = await pinMediaToIPFS(formData);

    if (ipfsResponse?.ok) {
      const resBody = await ipfsResponse.json();
      const cids: string[] = resBody.cids;

      const eventArtworkCid: string = cids[0] as string;
      const ticketArtworkCids: string[] = [];
      for (let i = 0; i < cids.length - 1; i++) {
        ticketArtworkCids.push(cids[i + 1] as string);
      }

      const eventId = Date.now().toString();
      localStorage.setItem('EVENT_INFO_SUCCESS_DATA', JSON.stringify({ eventId }));
      if (!stripeAccountId) throw Error('Stripe Account ID is not available');

      const { actions, dropIds }: { actions: Action[]; dropIds: string[] } = await createPayload({
        accountId: accountId!,
        formData,
        stripeAccountId,
        eventId,
        eventArtworkCid,
        ticketArtworkCids,
      });

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

      await wallet.signAndSendTransaction({
        signerId: wallet.id,
        receiverId: KEYPOM_EVENTS_CONTRACT_ID,
        actions,
      });
    }
  } catch (error) {
    console.error('Failed to create event', error);
  }
};

export const isValidFutureDate = (value: string) => {
  const today = new Date().toISOString().split('T')[0];
  return today !== undefined && value >= today;
};

export const createValidationRules = () => ({
  name: {
    required: 'Please enter a name',
    validate: (value: FormSchema['name']) => value.trim() !== '' || 'Name cannot be empty',
    setValueAs: (value: string) => value.trim(),
  },
  description: {
    validate: (value: FormSchema['description']) => {
      if (!value) return true;
      (value && value.trim() !== '') || 'Description cannot be empty';
    },
    setValueAs: (value: string) => value.trim(),
  },
  location: {
    required: 'Please enter a location',
    validate: (value: FormSchema['location']) => value.trim() !== '' || 'Location cannot be empty',
    setValueAs: (value: string) => value.trim(),
  },
  tickets: {
    name: {
      required: 'Ticket Name cannot be empty',
      validate: (value: string) => value.trim() !== '' || 'Ticket Name cannot be empty',
      setValueAs: (value: string) => value.trim(),
    },
    priceFiat: {
      min: {
        value: 0,
        message: 'Price cannot be negative',
      },
    },
    maxSupply: {
      required: 'Please enter a value',
      min: {
        value: 1,
        message: 'Supply must be at least 1',
      },
      valueAsNumber: true,
    },
    maxPurchases: {
      required: 'Please enter a value',
      min: {
        value: 1,
        message: 'Quantity limit must be at least 1',
      },
      valueAsNumber: true,
    },
  },
});
