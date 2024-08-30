import type { AccountState, Wallet, WalletSelector, WalletSelectorState } from '@near-wallet-selector/core';
import type { SignMessageMethod } from '@near-wallet-selector/core/src/lib/wallet';
import type { WalletSelectorModal } from '@near-wallet-selector/modal-ui';
import type { NextPage } from 'next';
import type { ReactElement, ReactNode } from 'react';

export type NextPageWithLayout<T = any> = NextPage<T> & {
  getLayout?: (page: ReactElement) => ReactNode;
};

export type EventDetails = {
  id: string;
  name: string;
  location: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  description?: string;
  imageUrl?: string;
  links?: {
    facebook?: string;
    website?: string;
    x?: string;
    youTube?: string;
  };
  tickets: {
    available: number;
    sold: number;
    total: number;
  };
  ticketPrice?: number;
  ticketQuantityLimit?: number;
};

export type EventAccount = {
  id: string;
  tickets: EventAccountTicket[];
};

export type EventAccountTicket = {
  id: string;
  tier: string;
};

export type WalletStore = {
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
