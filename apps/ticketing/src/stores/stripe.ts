import { create } from 'zustand';

type StripeStore = {
  stripeAccountId: string | null;

  setStripeAccountId: (accountId: string | null) => void;

  checkForPriorStripeConnected: (accountId: string | undefined | null) => any | null;
};

export const useStripeStore = create<StripeStore>((set) => ({
  stripeAccountId: null,

  setStripeAccountId: (stripeAccountId) => set({ stripeAccountId }),

  checkForPriorStripeConnected: (accountId) => {
    if (accountId) {
      const stripeAccountData = localStorage.getItem(`stripe-connected-${accountId}`);
      const stripeAccountObject = stripeAccountData ? JSON.parse(stripeAccountData) : {};
      if (Object.keys(stripeAccountObject).length === 0) {
        return null;
      } else {
        const loggedInStripeAccountId = stripeAccountObject[`${accountId}`];
        set({ stripeAccountId: loggedInStripeAccountId });
        return loggedInStripeAccountId || null;
      }
    }
    return false;
  },
}));
