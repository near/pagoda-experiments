import { DropsByEventId } from '@/hooks/useDrops';

import { botCheck } from './bot-check';
import { EVENTS_WORKER_BASE } from './common';
import { FunderEventMetadata } from './helpers';

type PurchaseWorkerPayload = {
  name: string | null;
  ticketAmount: number;
  buyerAnswers: string;
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
  priceNear: string;
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
};

export async function purchaseTickets({
  dropsForEvent,
  email,
  event,
  publisherAccountId,
  tickets,
}: PurchaseTicketOptions) {
  let totalFreeTickets = 0;
  let totalFiatTickets = 0;

  for (const ticket of tickets) {
    if (!ticket.quantity) continue;

    const drop = dropsForEvent.find((d) => d.drop_id === ticket.dropId);

    if (!drop) {
      throw new Error(`Matching drop not found for id: ${ticket.dropId}`);
    }
    if (!event.pubKey) {
      throw new Error('Event is missing public key');
    }

    const publicKeyBase64 = event.pubKey;
    const publicKey = await base64ToPublicKey(publicKeyBase64);
    const buyerAnswers = await encryptWithPublicKey(JSON.stringify({ questions: {} }), publicKey); // TODO: Eventually support questions in our UI and record answers here

    const eventImageUrl = event.artwork ? `https://cloudflare-ipfs.com/ipfs/${event.artwork}` : '';
    const ticketImageUrl = drop.ticket.artwork
      ? `https://cloudflare-ipfs.com/ipfs/${drop.ticket.artwork}`
      : eventImageUrl ?? '';

    const workerPayload: PurchaseWorkerPayload = {
      name: null,
      ticketAmount: ticket.quantity,
      buyerAnswers,
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
      priceNear: '0', // TODO: What price should we pass since we really only want to support fiat and free?
    };

    const bot = await botCheck();
    if (bot) {
      throw new Error('Bot detection triggered');
    }

    const ticketIsFree =
      (!drop.ticket.extra?.priceFiat || drop.ticket.extra.priceFiat === '0') &&
      (!drop.ticket.extra?.priceNear || drop.ticket.extra.priceNear === '0');

    if (ticketIsFree) {
      const response = await fetch(`${EVENTS_WORKER_BASE}/purchase-free-tickets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(workerPayload),
      });

      const data = await response.json();

      if (response.ok) {
        console.log('Free ticket purchase success response data', data);
        totalFreeTickets += ticket.quantity;

        // TODO: Decide if saving this data to local storage is needed...
        // const purchaseLocalStorageKey = `${PURCHASED_LOCAL_STORAGE_PREFIX}_${workerPayload.ticket_info.dropId}`;
        // let numTicketsPurchased = parseInt(localStorage.getItem(purchaseLocalStorageKey) || '0');
        // numTicketsPurchased += workerPayload.ticketAmount;
        // localStorage.setItem(purchaseLocalStorageKey, numTicketsPurchased.toString());
      } else {
        console.error(response);
        throw new Error('Request to purchase free tickets failed');
      }
    } else {
      console.warn('TODO: Handle purchasing tickets with fiat or near...');
      totalFiatTickets += ticket.quantity;

      /*
        We'll need to think through how we redirect to Stripe after exiting this ticket loop. We 
        need to make sure all the free tickets are handled first for the edge case that a customer 
        is purchasing free and tickets with cost in one go.
      */
    }
  }

  if (!totalFiatTickets && !totalFreeTickets) {
    throw new Error('No tickets to purchase. Invalid purchase request.');
  }

  return {
    totalFiatTickets,
    totalFreeTickets,
  };
}

function uint8ArrayToBase64(u8Arr: Uint8Array) {
  const string = u8Arr.reduce((data, byte) => data + String.fromCharCode(byte), '');
  return btoa(string);
}

async function encryptWithPublicKey(data: string, publicKey: CryptoKey) {
  const encoded = new TextEncoder().encode(data);

  const encrypted = await window.crypto.subtle.encrypt(
    {
      name: 'RSA-OAEP',
    },
    publicKey,
    encoded,
  );

  return uint8ArrayToBase64(new Uint8Array(encrypted));
}

async function base64ToPublicKey(base64Key: string) {
  const binaryString = atob(base64Key);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);

  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  const publicKey = await window.crypto.subtle.importKey(
    'spki',
    bytes.buffer,
    {
      name: 'RSA-OAEP',
      hash: { name: 'SHA-256' },
    },
    true,
    ['encrypt'],
  );

  return publicKey;
}