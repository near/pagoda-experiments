import { Account } from 'near-api-js';

import { DropsByEventId } from '@/hooks/useDrops';

import { botCheck } from './bot-check';
import { CLOUDFLARE_IPFS, EVENTS_WORKER_BASE, KEYPOM_MARKETPLACE_CONTRACT_ID } from './config';
import { FunderEventMetadata } from './helpers';

type PurchaseWorkerPayload = {
  name: string | null;
  ticketAmount: number;
  buyerAnswers: string | undefined;
  ticket_info: {
    location: string;
    eventName: string;
    ticketType: string;
    eventDate: string;
    ticketOwner: string | undefined;
    eventId: string;
    dropId: string;
    funderId: string;
    event_image_url: string;
    ticket_image_url: string;
  };
  purchaseEmail: string;
  stripeAccountId: string | undefined;
  baseUrl: string;
  // secret keys, for multiple primary purchases
  ticketKeys?: string[];
  // single secret key to send in email
  ticketKey?: string;
  network?: string;
  linkdrop_secret_key?: string;
};

type PurchaseTicketOptions = {
  dropsForEvent: DropsByEventId[string];
  email: string;
  event: FunderEventMetadata;
  publisherAccountId: string;
  tickets: {
    dropId: string;
    quantity?: number;
  }[];
  viewAccount: Account;
};

type PurchasedTicket = {
  secretKey: string;
};

export async function purchaseTickets({
  dropsForEvent,
  email,
  event,
  publisherAccountId,
  tickets,
  viewAccount,
}: PurchaseTicketOptions) {
  const purchases: PurchasedTicket[] = [];

  const bot = await botCheck();
  if (bot) {
    throw new Error('Bot detection triggered');
  }

  for (const ticket of tickets) {
    if (!ticket.quantity) continue;

    const drop = dropsForEvent.find((d) => d.drop_id === ticket.dropId);

    if (!drop) {
      throw new Error(`Matching drop not found for id: ${ticket.dropId}`);
    }
    //if (!event.pubKey) {
    //  throw new Error('Event is missing public key');
    //}

    //const publicKeyBase64 = event.pubKey;
    //const publicKey = await base64ToPublicKey(publicKeyBase64);
    //const buyerAnswers = await encryptWithPublicKey(JSON.stringify({ questions: {} }), publicKey); // TODO: Eventually support questions in our UI and record answers here

    const eventImageUrl = event.artwork ? `${CLOUDFLARE_IPFS}/${event.artwork}` : '';
    const ticketImageUrl = drop.ticket.artwork ? `${CLOUDFLARE_IPFS}/${drop.ticket.artwork}` : (eventImageUrl ?? '');

    const workerPayload: PurchaseWorkerPayload = {
      name: null,
      ticketAmount: ticket.quantity,
      buyerAnswers: undefined,
      ticket_info: {
        location: event.location,
        eventName: event.name,
        ticketType: drop.ticket.title,
        eventDate: JSON.stringify(event.date),
        ticketOwner: undefined, // If signed in, this is signed in account, otherwise its undefined
        eventId: event.id,
        dropId: drop.drop_id,
        funderId: publisherAccountId,
        event_image_url: eventImageUrl,
        ticket_image_url: ticketImageUrl,
      },
      purchaseEmail: email.trim(),
      stripeAccountId: undefined,
      baseUrl: window.location.origin,
    };

    const ticketIsFree =
      (!drop.ticket.extra?.priceFiat || drop.ticket.extra.priceFiat === '0') &&
      (!drop.ticket.extra?.priceNear || drop.ticket.extra.priceNear === '0');

    let response: Response | undefined;
    let stripeAccountId = await viewAccount.viewFunction({
      contractId: KEYPOM_MARKETPLACE_CONTRACT_ID,
      methodName: 'get_stripe_id_for_account',
      args: { account_id: publisherAccountId },
    });
    workerPayload.stripeAccountId = stripeAccountId;

    const purchaseURL = ticketIsFree ? 'purchase-free-tickets' : 'stripe/create-checkout-session';
    response = await fetch(`${EVENTS_WORKER_BASE}/${purchaseURL}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(workerPayload),
    });

    if (response.ok) {
      const data = await response.json();
      if (!ticketIsFree) {
        // redirect to stripe for checkout
        window.location.href = data.stripe_url;
      } else {
        data.tickets.forEach((t: { secret_key: any }) => purchases.push({ secretKey: t.secret_key }));
      }
    } else {
      /*
        TODO: We'll need to think through how we redirect to Stripe after exiting this loop.
        We need to make sure any and all free tickets are handled first before redirecting
        to Stripe.
      */
      console.error(response);
      throw new Error('Request to purchase ticket(s) failed');
    }
  }

  if (!purchases.length) {
    throw new Error('No tickets were purchased. A ticket with quantity of 1 or greater is required for purchasing.');
  }

  return {
    purchases,
  };
}
