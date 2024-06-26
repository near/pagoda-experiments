/*
  Relevant Documentation:

  - https://codelabs.developers.google.com/add-to-wallet-web#0
  - https://github.com/google-wallet/web-codelab/tree/main/web_complete
  - https://developers.google.com/wallet/tickets/events/use-cases/jwt
*/

import fs from 'fs';
import jwt from 'jsonwebtoken';
import type { NextApiRequest, NextApiResponse } from 'next';
import { resolve } from 'path';

import { HOSTNAME } from '@/utils/config';
import { EventAccount, EventDetails } from '@/utils/types';

const ISSUER_ID = '3388000000022340916';
const CLASS_ID = `${ISSUER_ID}.GENERIC`;

const credentialsPath = resolve('./secrets/google-wallet-pagoda-ticketing.json');
let credentials:
  | {
      client_email: string;
      private_key: string;
    }
  | undefined;

try {
  credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8')) as any;
} catch (error) {
  console.error('Failed to load Google Wallet credentials JSON file', error);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (!credentials) throw new Error('Credentials are undefined');

    const accountId = req.query.accountId as string;
    const eventId = req.query.eventId as string;

    // TODO: Fetch event data for eventId
    // TODO: Fetch ticket data for accountId (public key)
    console.log('Generating event passes for Google Wallet...', { accountId, eventId });

    const event: EventDetails = {
      id: '1',
      name: 'Some Cool Event Name',
      location: '1234 W Cool St, Denver, CO',
      date: '2024-10-14',
      startTime: '19:00',
      endTime: '22:00',
      description:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
      imageUrl: `${HOSTNAME}/images/hero-background.jpg`,
      links: {
        facebook: 'https://facebook.com',
        website: 'https://google.com',
        x: 'https://x.com',
        youTube: 'https://youtube.com',
      },
      tickets: {
        available: 20,
        sold: 30,
        total: 50,
      },
      ticketPrice: 10,
      ticketQuantityLimit: 3,
    };

    const account: EventAccount = {
      id: '1',
      tickets: [
        {
          id: 'a0fd96f4-12a5-4a92-882d-7b68609f8420', // Random, dummy UUID
          tier: 'Premium Seating',
        },
        {
          id: 'd7d2fc4e-c978-4b0d-93b1-3e57de9c92aa', // Random, dummy UUID
          tier: 'General Admission',
        },
      ],
    };

    const genericObjects: any[] = [];
    // TODO: const formattedEventDate = displayEventDate(event);
    const formattedEventDate = undefined;

    account.tickets.forEach((ticket, i) => {
      // TODO: Pull in dynamic images from event
      const logoImageUrl = 'https://i.ibb.co/rsXTfWm/icon-3x.png';
      const heroImageUrl = 'https://i.ibb.co/cD5fCJP/marcela-laskoski-Yrt-Flr-Lo2-DQ-unsplash.jpg';

      const textModulesData: { header: string; body: string; id: string }[] = [];
      const ticketName = `${account.tickets.length > 1 ? `${i + 1} of ${account.tickets.length} - ` : ''}${ticket.tier ?? 'General Admission'}`;
      // TODO: const location = formattedEventDate ? `${event.location} - ${formattedEventDate.dateAndTime}` : event.location;
      const location = event.location;

      textModulesData.push({
        header: 'Event',
        body: event.name,
        id: 'event',
      });

      textModulesData.push({
        header: 'Ticket',
        body: ticketName,
        id: 'ticket',
      });

      if (formattedEventDate) {
        textModulesData.push({
          header: 'Location & Date',
          body: location,
          id: 'location',
        });
      } else {
        textModulesData.push({
          header: 'Location',
          body: location,
          id: 'location',
        });
      }

      genericObjects.push({
        id: `${ISSUER_ID}.${ticket.id}`,
        classId: CLASS_ID,
        state: 'ACTIVE',
        hexBackgroundColor: '#604bc7',
        logo: {
          sourceUri: {
            uri: logoImageUrl,
          },
        },
        cardTitle: {
          defaultValue: {
            language: 'en',
            value: event.name,
          },
        },
        header: {
          defaultValue: {
            language: 'en',
            value: ticketName,
          },
        },
        subheader: {
          defaultValue: {
            language: 'en',
            value: 'Ticket',
          },
        },
        barcode: {
          type: 'QR_CODE',
          value: ticket.id,
        },
        heroImage: {
          sourceUri: {
            uri: heroImageUrl,
          },
        },
        textModulesData,
      });
    });

    /*
      NOTE: After some experimenting, we decided to go with using "genericObjects" instead of 
      "eventTicketObjects". Using a "GENERIC" class allows us to keep things simpler and dynamically 
      set all text/images on the object at this point. When using a proper "EVENT" class, the event 
      name can't be dynamically set and you'd need to create a new class for each and every event.
    */

    const claims = {
      iss: credentials.client_email,
      aud: 'google',
      origins: [],
      typ: 'savetowallet',
      payload: {
        genericObjects,
      },
    };

    const token = jwt.sign(claims, credentials.private_key, { algorithm: 'RS256' });
    const url = `https://pay.google.com/gp/v/save/${token}`;

    res.redirect(url);
  } catch (error) {
    console.error(error);
    res.status(500).send(undefined);
  }
}
