/*
  Relevant Documentation:

  - https://github.com/tinovyatkin/pass-js
  - https://developer.apple.com/documentation/walletpasses
  - https://developer.apple.com/documentation/walletpasses/building_a_pass
  - https://developer.apple.com/library/archive/documentation/UserExperience/Conceptual/PassKit_PG/Creating.html
  - https://developer.apple.com/documentation/walletpasses/distributing_and_updating_a_pass#3793284
*/

import { Template } from '@walletpass/pass-js';
import JSZip from 'jszip';
import type { NextApiRequest, NextApiResponse } from 'next';
import { resolve } from 'path';

import { APPLE_WALLET_CERTIFICATE_PASSWORD, APPLE_WALLET_CERTIFICATE_PEM, HOSTNAME } from '@/utils/config';
import { displayEventDate } from '@/utils/date';
import { decodeEventDataForWallet } from '@/utils/wallet';

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
    const { event, tickets } = decodeEventDataForWallet(req.query.data as string);

    if (APPLE_WALLET_CERTIFICATE_PEM) {
      template.setCertificate(APPLE_WALLET_CERTIFICATE_PEM, APPLE_WALLET_CERTIFICATE_PASSWORD);
    } else {
      const certificatePath = resolve('./secrets/pass.com.pagoda.ticketing.pem');
      await template.loadCertificate(certificatePath, APPLE_WALLET_CERTIFICATE_PASSWORD);
    }

    /*
      NOTE: The Apple Wallet SDK is extremely picky when it comes to image dimensions, resolutions, 
      and types. For now we'll stick with using hardcoded placeholder images instead of using 
      the uploaded event/ticket artwork.
    */

    const logo1x = await imageBufferFromUrl(`${HOSTNAME}/images/apple-wallet/logo@1x.png`);
    const logo2x = await imageBufferFromUrl(`${HOSTNAME}/images/apple-wallet/logo@2x.png`);
    const logo3x = await imageBufferFromUrl(`${HOSTNAME}/images/apple-wallet/logo@3x.png`);
    const icon1x = await imageBufferFromUrl(`${HOSTNAME}/images/apple-wallet/icon@1x.png`);
    const icon2x = await imageBufferFromUrl(`${HOSTNAME}/images/apple-wallet/icon@2x.png`);
    const icon3x = await imageBufferFromUrl(`${HOSTNAME}/images/apple-wallet/icon@3x.png`);
    const thumbnail1x = await imageBufferFromUrl(`${HOSTNAME}/images/apple-wallet/thumbnail@1x.png`);
    const thumbnail2x = await imageBufferFromUrl(`${HOSTNAME}/images/apple-wallet/thumbnail@2x.png`);
    const thumbnail3x = await imageBufferFromUrl(`${HOSTNAME}/images/apple-wallet/thumbnail@3x.png`);

    const formattedEventDate = displayEventDate(event);

    const passes = tickets.map((ticket, i) => {
      const pass = template.createPass({
        description: event.name,
        organizationName: 'Ticketing',
        logoText: 'Ticketing',
        serialNumber: ticket.secretKey,
        barcodes: [
          {
            message: ticket.secretKey,
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
        value: `${tickets.length > 1 ? `${i + 1} of ${tickets.length} - ` : ''}${ticket.title}`,
      });

      pass.auxiliaryFields.add({
        key: 'location',
        label: 'Location & Date',
        value: `${event.location} - ${formattedEventDate.dateAndTime}`,
      });

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
