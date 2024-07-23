import { create } from 'zustand';

import { KEYPOM_CONTRACT_ID } from '@/utils/config';
import type { WalletStore } from '@/utils/types';

export const useWalletStore = create<WalletStore>((set, get) => ({
  account: null,
  hasResolved: false,
  selector: null,
  modal: null,
  state: null,
  wallet: null,

  setAccount: (account) => set({ account }),
  setSelector: (selector, modal) => set({ selector, modal }),
  setState: (state) => {
    if (state) {
      return set({ hasResolved: true, state });
    }
    return set({ state });
  },
  setWallet: (wallet) => set({ wallet }),
  showFastAuthModal: async () => {
    const selector = get().selector;
    if (!selector) return;
    try {
      const fastAuthWallet = await selector.wallet('fast-auth-wallet');
      const wallet = await fastAuthWallet.signIn({
        contractId: KEYPOM_CONTRACT_ID,
        accounts: [],
      });
      console.log('wallet', wallet);
    } catch (error) {
      console.error(error);
    }
  },
}));
