import { Action } from '@near-wallet-selector/core';

import { KEYPOM_EVENTS_CONTRACT_ID } from './common';
import { FormSchema } from './helpers';
import { createPayload } from './helpers';
import { pinMediaToIPFS } from './stripe';
import type { WalletStore } from './types';

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
  console.log('createNewEvent', { formData, stripeAccountId, wallet, accountId });
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
