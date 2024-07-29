import { handleClientError } from '@near-pagoda/ui';
import { useQuery } from '@tanstack/react-query';
import { v4 as uuidv4 } from 'uuid';
import { create } from 'zustand';

import { EVENTS_WORKER_BASE, KEYPOM_MARKETPLACE_CONTRACT_ID } from '@/utils/config';

import { useNearStore } from './near';

type StripeStore = {
  stripeAccountId: string | null;
  stripeUuid: string | null;

  setStripeAccountId: (accountId: string | null) => void;

  checkForPriorStripeConnected: (accountId: string | undefined | null) => any | null;

  useStripe: (accountId: string | undefined, attemptToConnect: boolean) => void;
};

export const useStripeStore = create<StripeStore>((set) => ({
  stripeAccountId: null,
  stripeUuid: null,

  setStripeAccountId: (stripeAccountId) => set({ stripeAccountId }),

  checkForPriorStripeConnected: (accountId) => {
    if (accountId) {
      const stripeAccountObject = JSON.parse(localStorage.getItem(`STRIPE_ACCOUNT_INFO`) || '{}');
      if (Object.keys(stripeAccountObject).length === 0) {
        return null;
      } else {
        const loggedInStripeAccountId = stripeAccountObject.stripeAccountId;
        const loggedInStripeUuid = stripeAccountObject.uuid;
        set({ stripeAccountId: loggedInStripeAccountId });
        set({ stripeUuid: loggedInStripeUuid });
        return loggedInStripeAccountId || null;
      }
    }
    return false;
  },

  useStripe: (accountId: string | undefined, attemptToConnect: boolean) => {
    const viewAccount = useNearStore((store) => store.viewAccount);
    const setStripeAccountId = useStripeStore((store) => store.setStripeAccountId);

    const query: any = useQuery({
      enabled: !!viewAccount && !!accountId && attemptToConnect,
      queryKey: ['stripe', accountId],
      queryFn: async () => {
        try {
          if (!viewAccount) throw new Error('View account has not initialized yet');

          let stripeAccountId = await viewAccount.viewFunction({
            contractId: KEYPOM_MARKETPLACE_CONTRACT_ID,
            methodName: 'get_stripe_id_for_account',
            args: { account_id: accountId },
          });

          if (stripeAccountId) {
            // Update local storage
            let existingStripeAccoountInfo = localStorage.getItem('STRIPE_ACCOUNT_ID');
            if (!existingStripeAccoountInfo) {
              existingStripeAccoountInfo = '{}';
            }
            const existingStripeAccountInfoObj = JSON.parse(existingStripeAccoountInfo);
            existingStripeAccountInfoObj[`${accountId}`] = stripeAccountId;

            localStorage.setItem('STRIPE_ACCOUNT_ID', JSON.stringify(existingStripeAccountInfoObj));
            setStripeAccountId(stripeAccountId);
            return stripeAccountId;
          } else {
            let response: Response | undefined;

            const uuid = uuidv4();
            try {
              const body = {
                accountId,
                redirectUrl: `${window.location.origin}/event/new?successMessage=${uuid}`,
                refresh_url: `${window.location.origin}/event/new?successMessage=${uuid}`,
              };

              const url = `${EVENTS_WORKER_BASE}/stripe/create-account`;
              response = await fetch(url, {
                method: 'POST',
                body: JSON.stringify(body),
              });
            } catch (error) {
              // eslint-disable-next-line no-console
              console.error('Error connecting to stripe: ', error);
            }

            if (response?.ok) {
              const resBody = await response.json();
              const { accountLinkUrl, stripeAccountId } = resBody;

              localStorage.setItem('STRIPE_ACCOUNT_INFO', JSON.stringify({ stripeAccountId, uuid }));
              window.location.href = accountLinkUrl;
              setStripeAccountId(stripeAccountId);
              return stripeAccountId;
            } else {
              handleClientError({
                title: 'Unable to Create Stripe Account',
                description: `Please try again later or contact support.`,
                error: response,
              });
            }
          }
        } catch (error) {
          handleClientError({
            title: 'Failed to load stripe account',
            error,
          });
        }

        return query;
      },
    });
  },
}));
