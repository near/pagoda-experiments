/*
  Relevant Documentation:

  - https://github.com/tinovyatkin/pass-js
  - https://developer.apple.com/documentation/walletpasses
  - https://developer.apple.com/documentation/walletpasses/building_a_pass
  - https://developer.apple.com/library/archive/documentation/UserExperience/Conceptual/PassKit_PG/Creating.html
  - https://developer.apple.com/documentation/walletpasses/distributing_and_updating_a_pass#3793284
*/

import { Template } from '@walletpass/pass-js';
import JSZip from 'JSZip';
import type { NextApiRequest, NextApiResponse } from 'next';
import { resolve } from 'path';

import { APPLE_WALLET_CERTIFICATE_PASSWORD, HOSTNAME } from '@/utils/config';
import { EventAccount, EventDetails } from '@/utils/types';

const certificatePath = resolve('./secrets/pass.com.pagoda.ticketing.pem');

const template = new Template('eventTicket', {
  passTypeIdentifier: 'pass.com.pagoda.ticketing',
  teamIdentifier: '9KTY2NB48W', // Organization Unit
  sharingProhibited: true,
});

async function imageBufferFromUrl(url: string) {
  const request = await fetch(url);
  const buffer = Buffer.from(await request.arrayBuffer());
  return buffer;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const accountId = req.query.accountId as string;
    const eventId = req.query.eventId as string;

    // TODO: Fetch event data for eventId
    // TODO: Fetch ticket data for accountId (public key)
    console.log('Generating event passes for Apple Wallet...', { accountId, eventId });

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

    await template.loadCertificate(certificatePath, APPLE_WALLET_CERTIFICATE_PASSWORD);

    // TODO: Pull in dynamic images from event
    const logo1x = await imageBufferFromUrl(`${HOSTNAME}/images/apple-wallet/logo@1x.png`);
    const logo2x = await imageBufferFromUrl(`${HOSTNAME}/images/apple-wallet/logo@2x.png`);
    const logo3x = await imageBufferFromUrl(`${HOSTNAME}/images/apple-wallet/logo@3x.png`);
    const icon1x = await imageBufferFromUrl(`${HOSTNAME}/images/apple-wallet/icon@1x.png`);
    const icon2x = await imageBufferFromUrl(`${HOSTNAME}/images/apple-wallet/icon@2x.png`);
    const icon3x = await imageBufferFromUrl(`${HOSTNAME}/images/apple-wallet/icon@3x.png`);
    const thumbnail1x = await imageBufferFromUrl(`${HOSTNAME}/images/apple-wallet/thumbnail@1x.png`);
    const thumbnail2x = await imageBufferFromUrl(`${HOSTNAME}/images/apple-wallet/thumbnail@2x.png`);
    const thumbnail3x = await imageBufferFromUrl(`${HOSTNAME}/images/apple-wallet/thumbnail@3x.png`);

    // TODO: const formattedEventDate = displayEventDate(event);
    const formattedEventDate = undefined;

    const passes = account.tickets.map((ticket, i) => {
      const pass = template.createPass({
        description: event.name,
        organizationName: 'Ticketing',
        logoText: 'Ticketing',
        serialNumber: ticket.id,
        barcodes: [
          {
            message: ticket.id,
            format: 'PKBarcodeFormatQR',
            messageEncoding: 'iso-8859-1',
          },
        ],
        backgroundColor: 'rgb(96, 75, 199)',
        foregroundColor: 'rgb(255, 255, 255)',
        labelColor: 'rgb(0, 0, 0)',
        stripColor: 'rgb(255, 255, 255)',
      });

      pass.primaryFields.add({
        key: 'event',
        label: 'Event',
        value: event.name,
      });

      pass.secondaryFields.add({
        key: 'ticket',
        label: 'Ticket',
        value: `${account.tickets.length > 1 ? `${i + 1} of ${account.tickets.length} - ` : ''}${ticket.tier}`,
      });

      if (formattedEventDate) {
        // TODO
        // pass.auxiliaryFields.add({
        //   key: 'location',
        //   label: 'Location & Date',
        //   value: `${event.location} - ${formattedEventDate.dateAndTime}`,
        // });
      } else {
        pass.secondaryFields.add({
          key: 'location',
          label: 'Location',
          value: event.location,
        });
      }

      pass.images.add('logo', logo1x);
      pass.images.add('logo', logo2x, '2x');
      pass.images.add('logo', logo3x, '3x');

      pass.images.add('icon', icon1x);
      pass.images.add('icon', icon2x, '2x');
      pass.images.add('icon', icon3x, '3x');

      pass.images.add('thumbnail', thumbnail1x);
      pass.images.add('thumbnail', thumbnail2x, '2x');
      pass.images.add('thumbnail', thumbnail3x, '3x');

      return pass;
    });

    /*
      The folowing ZIP logic allows us to bundle multiple passes together to add to the user's wallet in 
      one transaction in the case the user bought multiple tickets for a group:

      https://developer.apple.com/documentation/walletpasses/distributing_and_updating_a_pass#3793284
    */

    const zip = new JSZip();

    for (const pass of passes) {
      const buffer = await pass.asBuffer();
      zip.file(`${pass.serialNumber}.pkpass`, buffer);
    }

    const zipBuffer = await zip.generateAsync({ type: 'nodebuffer', mimeType: 'application/vnd.apple.pkpasses' });

    res.status(200).setHeader('Content-Type', 'application/vnd.apple.pkpasses').send(zipBuffer);
  } catch (error) {
    console.error(error);
    res.status(500).send(undefined);
  }
}
