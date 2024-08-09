import { getPubFromSecret } from '@keypom/core';
import { openToast } from '@near-pagoda/ui';
import { Account, KeyPair, Near } from 'near-api-js';
import { BrowserLocalStorageKeyStore } from 'near-api-js/lib/key_stores';

import { fetchDetailsForPurchasedTicket } from '@/hooks/usePurchasedTickets';

import { KEYPOM_EVENTS_CONTRACT_ID } from './config';
import { validateDateAndTime } from './time';

const verifiedSecretKeys: string[] = [];

type VerifyAndClaimTicketOptions = {
  eventId: string;
  keyStore: BrowserLocalStorageKeyStore;
  near: Near;
  secretKey: string;
  viewAccount: Account;
};

export type VerifyAndClaimTicketResult = { isVerified: boolean; message?: string };

export async function verifyAndClaimTicket({
  eventId,
  keyStore,
  near,
  secretKey,
  viewAccount,
}: VerifyAndClaimTicketOptions): Promise<VerifyAndClaimTicketResult> {
  try {
    if (!secretKey) {
      return {
        isVerified: false,
        message: 'No value returned from QR code',
      };
    }

    const hasBeenVerified = verifiedSecretKeys.includes(secretKey);

    if (hasBeenVerified) {
      // Return early before making any API requests if we know we've already verified the ticket
      return {
        isVerified: true,
        message: 'Ticket has already been verified',
      };
    }

    const details = await fetchDetailsForPurchasedTicket(secretKey, viewAccount);
    const matchesEvent = details.extra.eventId === eventId;
    /*
        If remaining uses is less than 2, we assume the ticket has been scanned/verified.
        The additional use is to ensure that once the key is scanned and the attendee is
        admitted into the event, the key and its metadata are not deleted/lost:
      */
    const hasBeenUsed = details.usesRemaining < 2;

    if (hasBeenUsed) {
      return {
        isVerified: true,
        message: 'Ticket has already been verified',
      };
    }

    if (!matchesEvent) {
      return {
        isVerified: false,
        message: 'Ticket is not associated with current event',
      };
    }

    if (details.extra.passValidThrough) {
      const validatedTime = validateDateAndTime(details.extra.passValidThrough);
      if (!validatedTime.valid) {
        return {
          isVerified: false,
          message: 'Current date and time is outside of valid window for ticket',
        };
      }
    }

    verifiedSecretKeys.push(secretKey);

    /*
      NOTE: We purposefully don't await on claimTicket() below since it can take awhile to process.
      At this point, we've already verified the ticket is valid, so we can return a successful
      verification notification and assume the claiming logic will eventually finish.
    */

    claimTicket({ secretKey, keyStore, viewAccount, near });

    return {
      isVerified: true,
    };
  } catch (error) {
    console.error(error);
  }

  return {
    isVerified: false,
    message: 'Failed to load ticket information',
  };
}

type ClaimTicketOptions = {
  keyStore: BrowserLocalStorageKeyStore;
  near: Near;
  secretKey: string;
  viewAccount: Account;
};

async function claimTicket({ secretKey, keyStore, viewAccount, near }: ClaimTicketOptions) {
  try {
    const publicKey = getPubFromSecret(secretKey);
    console.log('Ticket claim started', publicKey);

    const signingKeyPair = KeyPair.fromString(secretKey);
    await keyStore.setKey(near.connection.networkId, KEYPOM_EVENTS_CONTRACT_ID, signingKeyPair);
    const keypomAccount = new Account(near.connection, KEYPOM_EVENTS_CONTRACT_ID);

    const keyInfo = await viewAccount.viewFunction({
      contractId: KEYPOM_EVENTS_CONTRACT_ID,
      methodName: 'get_key_information',
      args: {
        key: publicKey,
      },
    });
    const gasToAttach = keyInfo.required_gas;

    await keypomAccount.functionCall({
      contractId: KEYPOM_EVENTS_CONTRACT_ID,
      methodName: 'claim',
      args: {
        account_id: KEYPOM_EVENTS_CONTRACT_ID,
      },
      gas: gasToAttach,
    });

    console.log('Ticket claim finished', publicKey);
  } catch (error) {
    console.error('Ticket claim failed', error);

    openToast({
      type: 'error',
      title: 'Ticket Claim Failed',
      description: 'The previously verified ticket is valid, but the claiming process failed',
    });
  }
}
