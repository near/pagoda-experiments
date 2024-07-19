import type { AccountState, Wallet, WalletSelector, WalletSelectorState } from '@near-wallet-selector/core';
import { setupWalletSelector } from '@near-wallet-selector/core';
import type { SignMessageMethod } from '@near-wallet-selector/core/src/lib/wallet';
import type { WalletSelectorModal } from '@near-wallet-selector/modal-ui';
import { create } from 'zustand';
import { WALLET_SELECTOR_PARAMS } from '@/utils/wallet';
import { KEYPOM_CONTRACT_ID } from '@/utils/common';

type WalletStore = {
  account: AccountState | null;
  hasResolved: boolean;
  modal: WalletSelectorModal | null;
  selector: WalletSelector | null;
  state: WalletSelectorState | null;
  wallet: (Wallet & SignMessageMethod) | null;

  setAccount: (account: AccountState | null) => void;
  setSelector: (selector: WalletSelector | null, modal: WalletSelectorModal | null) => void;
  setState: (state: WalletSelectorState | null) => void;
  setWallet: (wallet: (Wallet & SignMessageMethod) | null) => void;
  showFastAuthModal: () => void;
};

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
        isRecovery: false,
      });
      console.log('wallet', wallet);
    } catch (error) {
      console.error(error);
    }
  },
}));
