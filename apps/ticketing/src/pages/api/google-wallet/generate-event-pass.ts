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

import { displayEventDate } from '@/utils/date';
import { decodeEventDataForWallet } from '@/utils/wallet';

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

    const { event, tickets } = decodeEventDataForWallet(req.query.data as string);

    const genericObjects: any[] = [];
    const formattedEventDate = displayEventDate(event);

    tickets.forEach((ticket, i) => {
      const logoImageUrl = 'https://i.ibb.co/rsXTfWm/icon-3x.png';
      // const artwork = ticket.artwork || event.artwork;
      // const heroImageUrl = artwork ? `${CLOUDFLARE_IPFS}/${artwork}` : undefined;

      const textModulesData: { header: string; body: string; id: string }[] = [];
      const ticketName = `${tickets.length > 1 ? `${i + 1} of ${tickets.length} - ` : ''}${ticket.title}`;
      const location = `${event.location} - ${formattedEventDate.dateAndTime}`;

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

      textModulesData.push({
        header: 'Location & Date',
        body: location,
        id: 'location',
      });

      genericObjects.push({
        id: `${ISSUER_ID}.${ticket.secretKey}`,
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
          value: ticket.secretKey,
        },
        // heroImage: {
        //   sourceUri: {
        //     uri: heroImageUrl,
        //   },
        // },
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
